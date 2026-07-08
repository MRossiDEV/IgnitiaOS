/**
 * Workflow Execution API
 * 
 * Handles PromptStack workflow execution
 * - Executes prompt blocks sequentially
 * - Manages retries and error handling
 * - Updates report with generated KPIs
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const ExecuteWorkflowSchema = z.object({
  executionId: z.string().uuid(),
  workflowId: z.string().uuid(),
})

type ExecuteWorkflowRequest = z.infer<typeof ExecuteWorkflowSchema>

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { executionId, workflowId } = ExecuteWorkflowSchema.parse(body)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Get workflow execution details
    const { data: execution, error: execError } = await supabase
      .from('workflow_executions')
      .select(`
        *,
        workflow_templates(*)
      `)
      .eq('id', executionId)
      .single()

    if (execError) throw execError

    // 2. Update execution status to 'running'
    await supabase
      .from('workflow_executions')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .eq('id', executionId)

    // 3. Execute prompt blocks
    let output_data: Record<string, any> = {}
    let error_message: string | null = null

    try {
      const workflow = execution.workflow_templates
      const inputData = execution.input_data

      // Execute each prompt block in sequence
      for (const block of workflow.prompt_blocks) {
        try {
          const result = await executePromptBlock(block, inputData, output_data)
          output_data[block.output_key] = result
        } catch (blockError) {
          error_message = `Block ${block.id} failed: ${blockError instanceof Error ? blockError.message : 'Unknown error'}`
          throw blockError
        }
      }

      // 4. Update execution with results
      await supabase
        .from('workflow_executions')
        .update({
          status: 'completed',
          output_data,
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - new Date(execution.started_at).getTime(),
        })
        .eq('id', executionId)

      // 5. Update report with KPI data
      await supabase
        .from('reports')
        .update({
          status: 'delivered',
          kpi_data: output_data,
          ai_confidence_score: output_data.confidence_score || 80,
          sent_at: new Date().toISOString(),
        })
        .eq('id', execution.report_id)

      // 6. Create upsell opportunity
      await supabase
        .from('upsell_opportunities')
        .insert({
          report_id: execution.report_id,
          user_id: (await supabase.from('reports').select('user_id').eq('id', execution.report_id).single()).data?.user_id,
          service_type: 'premium_analysis',
          service_description: 'Get detailed consulting and optimization recommendations',
          upsell_price: 500,
        })

      // 7. Send delivery email (via email service)
      // This should be queued to a background email service
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/report-delivered`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reportId: execution.report_id,
          }),
        })
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
      }

      return NextResponse.json({
        success: true,
        execution_id: executionId,
        status: 'completed',
      })
    } catch (error) {
      // Handle execution failure
      error_message = error instanceof Error ? error.message : 'Unknown error'

      // Update execution status
      await supabase
        .from('workflow_executions')
        .update({
          status: 'failed',
          error_message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', executionId)

      // Log failure for manual intervention
      await supabase
        .from('automation_failures')
        .insert({
          organization_id: execution.organization_id || 'default',
          workflow_execution_id: executionId,
          error_type: 'execution_failure',
          error_message,
          input_data: execution.input_data,
        })

      // Send admin alert
      const admins = await supabase
        .from('user_profiles')
        .select('id')
        .eq('role', 'admin')

      if (admins.data) {
        for (const admin of admins.data) {
          await supabase
            .from('admin_alerts')
            .insert({
              organization_id: execution.organization_id || 'default',
              admin_user_id: admin.id,
              alert_type: 'workflow_failure',
              severity: 'high',
              title: 'Workflow Execution Failed',
              message: `Workflow execution ${executionId} failed: ${error_message}`,
              related_entity_type: 'workflow_execution',
              related_entity_id: executionId,
            })
        }
      }

      return NextResponse.json(
        {
          error: error_message,
          execution_id: executionId,
          status: 'failed',
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Workflow execution error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Workflow execution failed',
      },
      { status: 500 }
    )
  }
}

/**
 * Execute a single prompt block
 * 
 * Supports different block types:
 * - 'prompt': Execute OpenAI prompt
 * - 'data_fetch': Fetch data from external API
 * - 'transform': Transform data
 * - 'validate': Validate data against schema
 * - 'format': Format data for output
 */
async function executePromptBlock(
  block: any,
  inputData: Record<string, any>,
  previousOutputs: Record<string, any>
): Promise<any> {
  switch (block.type) {
    case 'prompt': {
      // Execute OpenAI prompt
      const prompt = substituteVariables(block.prompt_template, {
        ...inputData,
        ...previousOutputs,
      })

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: block.system_prompt || 'You are a business intelligence assistant.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: block.temperature || 0.7,
          max_tokens: block.max_tokens || 2000,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      return JSON.parse(data.choices[0].message.content)
    }

    case 'data_fetch': {
      // Fetch data from external API
      const url = substituteVariables(block.url, inputData)
      const response = await fetch(url, {
        headers: block.headers || {},
      })

      if (!response.ok) {
        throw new Error(`API fetch failed: ${response.statusText}`)
      }

      return await response.json()
    }

    case 'transform': {
      // Transform data
      const transformer = new Function('data', `return ${block.transformation}`)
      return transformer(previousOutputs)
    }

    case 'validate': {
      // Validate data against schema
      // Implementation would depend on validation library
      return previousOutputs
    }

    case 'format': {
      // Format data for output
      return formatData(previousOutputs, block.format_spec)
    }

    default:
      throw new Error(`Unknown block type: ${block.type}`)
  }
}

/**
 * Substitute variables in template string
 * Supports: {{variable_name}} syntax
 */
function substituteVariables(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] ?? match
  })
}

/**
 * Format data according to specification
 */
function formatData(data: Record<string, any>, spec: any): any {
  if (spec.type === 'json') {
    return JSON.stringify(data, null, 2)
  }
  if (spec.type === 'markdown') {
    return objectToMarkdown(data)
  }
  return data
}

/**
 * Convert object to markdown format
 */
function objectToMarkdown(obj: any, depth = 0): string {
  const indent = '  '.repeat(depth)
  let md = ''

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      md += `${indent}### ${key}\n${objectToMarkdown(value, depth + 1)}\n`
    } else {
      md += `${indent}- **${key}**: ${value}\n`
    }
  }

  return md
}
