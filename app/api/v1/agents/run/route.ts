import { runAgent } from "@/lib/agents/runner"

export async function POST(req: Request) {
  const { agent, message } = await req.json()

  const response = await runAgent(agent, message)

  return Response.json({
    response,
  })
}