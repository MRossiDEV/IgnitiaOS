// REPLACE THE ENTIRE MODULE WITH THIS CONCEPTUAL STRUCTURE

/*
PROMPTSTACK ARCHITECTURE

Tabs:
1. Builder
2. Templates
3. Executions
4. Analytics

Builder Layout:

┌─────────────┬──────────────────────────────┬──────────────┐
│ Node Library│        Prompt Stack          │  Variables   │
├─────────────┼──────────────────────────────┼──────────────┤
│ Prompt      │ Prompt Node                  │ BUSINESS_NAME│
│ Preview     │ Preview Node                 │ SERVICE      │
│ Send        │ Send Node                    │ CITY         │
│ Response    │ Response Node                │ PHONE        │
│             │ Prompt Node                  │ EMAIL        │
│             │ Preview Node                 │              │
│             │ Send Node                    │              │
│             │ Response Node                │              │
└─────────────┴──────────────────────────────┴──────────────┘

*/


"use client"

import { useState, useMemo } from "react"
import {
  Plus,
  Play,
  Save,
  Trash2,
  Copy,
  Eye,
  Send,
  MessageSquare,
  Variable,
  FileText,
  Download,
  Sparkles,
  GripVertical,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

type NodeType =
  | "prompt"
  | "preview"
  | "send"
  | "response"

interface PromptNode {
  id: string
  type: NodeType
  title: string
  content?: string
}

export default function PromptStackPage() {
  const [nodes, setNodes] = useState<PromptNode[]>([
    {
      id: "1",
      type: "prompt",
      title: "Prompt Node",
      content:
        "Create a landing page for {BUSINESS_NAME} offering {SERVICE} in {CITY}",
    },
    {
      id: "2",
      type: "preview",
      title: "Preview Node",
    },
    {
      id: "3",
      type: "send",
      title: "Send Node",
    },
    {
      id: "4",
      type: "response",
      title: "Response Node",
    },
  ])

  const [selectedNode, setSelectedNode] = useState<string>("1")

  const [variables, setVariables] = useState<Record<string, string>>({
    BUSINESS_NAME: "Joe Roofing",
    SERVICE: "Roof Repair",
    CITY: "Miami",
  })

  const selected = nodes.find((n) => n.id === selectedNode)

  const extractVariables = (text: string) => {
    const matches = text.match(/\{([A-Z0-9_]+)\}/g) || []

    const vars = matches.map((m) =>
      m.replace("{", "").replace("}", "")
    )

    return [...new Set(vars)]
  }

  const updatePromptContent = (value: string) => {
    const updated = nodes.map((node) =>
      node.id === selectedNode
        ? {
            ...node,
            content: value,
          }
        : node
    )

    setNodes(updated)

    const detected = extractVariables(value)

    const nextVariables = { ...variables }

    detected.forEach((v) => {
      if (!nextVariables[v]) {
        nextVariables[v] = ""
      }
    })

    setVariables(nextVariables)
  }

  const renderPrompt = (content: string) => {
    let result = content

    Object.entries(variables).forEach(([key, value]) => {
      result = result.replaceAll(`{${key}}`, value)
    })

    return result
  }

  const addNode = (type: NodeType) => {
    setNodes([
      ...nodes,
      {
        id: Date.now().toString(),
        type,
        title:
          type.charAt(0).toUpperCase() +
          type.slice(1) +
          " Node",
      },
    ])
  }

  return (
    <div className="h-screen bg-zinc-950 text-white flex flex-col">

      {/* HEADER */}

      <div className="h-16 border-b border-zinc-800 px-6 flex items-center justify-between">

        <div>
          <h1 className="text-xl font-bold">
            PromptStack
          </h1>
          <p className="text-xs text-zinc-500">
            Visual Prompt Chaining Builder
          </p>
        </div>

        <div className="flex gap-2">

          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>

          <Button variant="outline">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Optimize
          </Button>

          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save Stack
          </Button>

        </div>

      </div>

      <Tabs defaultValue="builder" className="flex-1 flex flex-col">

        <div className="border-b border-zinc-800 px-6 py-3">

          <TabsList>

            <TabsTrigger value="builder">
              Builder
            </TabsTrigger>

            <TabsTrigger value="templates">
              Templates
            </TabsTrigger>

            <TabsTrigger value="executions">
              Executions
            </TabsTrigger>

            <TabsTrigger value="analytics">
              Analytics
            </TabsTrigger>

          </TabsList>

        </div>

        <TabsContent value="builder" className="flex-1 m-0">

          <div className="flex h-full">

            {/* NODE LIBRARY */}

            <div className="w-72 border-r border-zinc-800 p-4">

              <h2 className="font-semibold mb-4">
                Node Library
              </h2>

              <div className="space-y-2">

                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => addNode("prompt")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Prompt Node
                </Button>

                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => addNode("preview")}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Node
                </Button>

                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => addNode("send")}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Node
                </Button>

                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => addNode("response")}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Response Node
                </Button>

              </div>

            </div>

            {/* STACK */}

            <div className="flex-1 overflow-auto p-6">

              <div className="max-w-4xl mx-auto space-y-4">

                {nodes.map((node) => (

                  <Card
                    key={node.id}
                    onClick={() => setSelectedNode(node.id)}
                    className={`cursor-pointer border ${
                      selectedNode === node.id
                        ? "border-cyan-500"
                        : "border-zinc-800"
                    } bg-zinc-900`}
                  >

                    <div className="p-5">

                      <div className="flex items-center justify-between mb-4">

                        <div className="flex items-center gap-3">

                          <GripVertical className="w-4 h-4 text-zinc-500" />

                          <Badge>
                            {node.type}
                          </Badge>

                          <h3>{node.title}</h3>

                        </div>

                        <Trash2 className="w-4 h-4 text-zinc-500" />

                      </div>

                      {node.type === "prompt" && (
                        <Textarea
                          value={node.content}
                          onChange={(e) =>
                            updatePromptContent(e.target.value)
                          }
                          className="min-h-[150px]"
                        />
                      )}

                      {node.type === "preview" && (
                        <div className="bg-zinc-950 rounded-xl p-4 whitespace-pre-wrap">
                          {renderPrompt(
                            nodes.find(
                              (n) => n.type === "prompt"
                            )?.content || ""
                          )}
                        </div>
                      )}

                      {node.type === "send" && (
                        <div className="space-y-4">

                          <Input
                            defaultValue="gpt-5"
                          />

                          <Button>
                            <Play className="w-4 h-4 mr-2" />
                            Generate
                          </Button>

                        </div>
                      )}

                      {node.type === "response" && (
                        <div className="space-y-4">

                          <div className="bg-zinc-950 rounded-xl p-4 min-h-[180px]">
                            AI Response Appears Here
                          </div>

                          <div className="flex gap-2">

                            <Button variant="outline">
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                            </Button>

                            <Button variant="outline">
                              <Download className="w-4 h-4 mr-2" />
                              Export TXT
                            </Button>

                            <Button variant="outline">
                              <Download className="w-4 h-4 mr-2" />
                              Export MD
                            </Button>

                            <Button variant="outline">
                              <Download className="w-4 h-4 mr-2" />
                              Export JSON
                            </Button>

                          </div>

                        </div>
                      )}

                    </div>

                  </Card>

                ))}

              </div>

            </div>

            {/* VARIABLES DRAWER */}

            <div className="w-80 border-l border-zinc-800 p-4">

              <div className="flex items-center gap-2 mb-4">

                <Variable className="w-4 h-4" />

                <h2 className="font-semibold">
                  Variables
                </h2>

              </div>

              <div className="space-y-3">

                {Object.entries(variables).map(
                  ([key, value]) => (

                    <div key={key}>

                      <label className="text-xs text-zinc-500">
                        {key}
                      </label>

                      <Input
                        value={value}
                        onChange={(e) =>
                          setVariables({
                            ...variables,
                            [key]: e.target.value,
                          })
                        }
                      />

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

        </TabsContent>

      </Tabs>

    </div>
  )
}