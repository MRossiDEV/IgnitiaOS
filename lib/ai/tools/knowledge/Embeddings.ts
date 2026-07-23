import { KNOWLEDGE_EMBEDDING_DIMENSIONS } from "./constants"

function hashWord(word: string) {
  let hash = 0

  for (let index = 0; index < word.length; index += 1) {
    hash = (hash * 31 + word.charCodeAt(index)) >>> 0
  }

  return hash
}

export function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
}

export function createEmbedding(text: string): number[] {
  const vector = Array.from({ length: KNOWLEDGE_EMBEDDING_DIMENSIONS }, () => 0)
  const tokens = tokenize(text)

  for (const token of tokens) {
    const hash = hashWord(token)
    const slot = hash % KNOWLEDGE_EMBEDDING_DIMENSIONS
    const weight = 1 + (hash % 7)
    vector[slot] += weight
  }

  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1

  return vector.map((value) => Number((value / magnitude).toFixed(6)))
}

export function embedText(text: string) {
  return {
    text,
    vector: createEmbedding(text),
  }
}
