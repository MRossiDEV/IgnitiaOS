export interface Tool {
  name: string
  description: string
  run: (
    input: Record<string, any>
  ) => Promise<any>
}