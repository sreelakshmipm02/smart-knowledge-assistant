import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

const policyPath = path.resolve(
  currentDirectory,
  "../../data/companyPolicy.txt"
);

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were",
  "what", "which", "who", "when", "where", "why",
  "how", "many", "much", "can", "do", "does",
  "to", "of", "for", "in", "on", "at", "and",
  "or", "my", "me", "your", "it", "this", "that",
  "be", "per", "allowed", "company"
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(
      (word) => word.length > 1 && !STOP_WORDS.has(word)
    );
}

export async function loadPolicySections() {
  const content = await fs.readFile(policyPath, "utf8");

  return content
    .split(/(?=^## )/m)
    .map((section) => section.trim())
    .filter(Boolean)
    .map((content, index) => ({
      id: index + 1,
      title: content.split("\n")[0].replace(/^##\s*/, ""),
      content
    }));
}

export async function retrieveDocuments(question, topK = 3) {
  const sections = await loadPolicySections();
  const queryWords = [...new Set(tokenize(question))];

  if (queryWords.length === 0) {
    return [];
  }

  const ranked = sections.map((section) => {
    const sectionWords = new Set(tokenize(section.content));

    const matchedWords = queryWords.filter((word) =>
      sectionWords.has(word)
    );

    return {
      ...section,
      matchedWords,
      score: Number(
        (matchedWords.length / queryWords.length).toFixed(3)
      )
    };
  });

  return ranked
    // Require at least half of the unique query words to match.
    .filter((section) => section.score >= 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(Math.max(topK, 1), 5));
}