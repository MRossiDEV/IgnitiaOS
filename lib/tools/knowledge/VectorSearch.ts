import type { KnowledgeEmbedding, KnowledgeSearchResult } from "./KnowledgeTypes"

function cosineSimilarity(left: number[], right: number[]) {
  const length = Math.max(left.length, right.length)
  let dot = 0
  let leftMagnitude = 0
  let rightMagnitude = 0

  for (let index = 0; index < length; index += 1) {
    const leftValue = left[index] ?? 0
    const rightValue = right[index] ?? 0
    dot += leftValue * rightValue
    leftMagnitude += leftValue * leftValue
    rightMagnitude += rightValue * rightValue
  }

  const denominator = Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude) || 1
  return dot / denominator
}

export function vectorSearch<T extends KnowledgeEmbedding>(
  queryVector: number[],
  candidates: T[],
  topK = 5
): KnowledgeSearchResult<T>[] {
  return candidates
    .map((item) => ({
      score: cosineSimilarity(queryVector, item.vector),
      item,
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, topK)
}
