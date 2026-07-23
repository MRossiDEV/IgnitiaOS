import {createReportMemory, clearReportMemory } from "../memory/temporary";
import { crawlWebsite } from "../web/crawler/crawler";
import { analyzeWebsite } from "../web/crawler/analyzer";
import { websiteAgent } from "../agents/website";
import { seoAgent } from "../agents/seo";
import { AgentContext } from "../engine/types";
import { supabaseAdmin,} from "@/lib/supabase/server";

export async function generateFreeReport(
  reportId: string
) {
  
  /**
   * Get report data
   */
  const {data: report, error } = await supabaseAdmin
      .from("free_reports")
      .select("*")
      .eq("id", reportId)
      .single();

  if(error || !report){
    throw new Error(
      "Report not found"
    );
    }
    
    /**
   * Create Context for agents
   * This context will be passed to all agents
   * so they can access the reportId and other relevant information
   */
  const context:AgentContext = {reportId: reportId};

  /**
   * Create temporary memory
   */
  const memory = createReportMemory(reportId, report );

  try {
    /**
     * Website crawling
     */
    if(report.website){
      const website =  await crawlWebsite(report.website );
      memory.website = await analyzeWebsite(website, context);
    }

    /**
     * Specialist agents
     */
    const websiteAudit = await websiteAgent({
          businessName: report.business_name,
          website: report.website,
          industry: report.industry,
          businessType: report.business_type,
          country: report.country,
          city: report.city,
        },
        context
      );

      memory.results.website = websiteAudit.data;
      
    const seoAudit = await seoAgent({
          businessName: report.business_name,
          website: report.website,
          industry: report.industry,
          businessType: report.business_type,
          country: report.country,
          city: report.city,
          primaryGoal: report.primary_goal,
        },

        context
      );

    memory.results.seo = seoAudit.data;

    /**
     * Save partial result
     */
    await supabaseAdmin
      .from("free_reports")
      .update({
        status: "completed",
        ai_summary: memory.website?.summary || "",
        metadata: memory,
      })
      .eq("id", reportId );

    return memory;

  } catch(error){

    await supabaseAdmin
      .from("free_reports")
      .update({status: "failed",
      })
      .eq("id", reportId );
    throw error;
  } finally {

    /**
     * Destroy temporary memory
     */
    clearReportMemory(memory);
  }
}