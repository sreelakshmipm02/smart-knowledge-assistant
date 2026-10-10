
import { retrieveDocuments } from "./retrievalService.js";
import { buildRagPrompt } from "./promptService.js";
import { generateAnswer } from "./aiService.js";

export const evaluationCases = [
  {
    id: "TC01",
    question: "How many casual leave days are allowed?",
    expectedSection: "Casual Leave",
    expectedFacts: [
      {
        label: "12 days",
        pattern: /\b12 days\b/i
      },
      {
        label: "Calendar year",
        pattern: /\bcalendar year\b/i
      }
    ]
  },
  {
    id: "TC02",
    question: "What are the normal working hours?",
    expectedSection: "Working Hours",
    expectedFacts: [
      {
        label: "9 AM start",
        pattern: /\b9(?::00)?\s*am\b/i
      },
      {
        label: "6 PM end",
        pattern: /\b6(?::00)?\s*pm\b/i
      },
      {
        label: "Monday to Friday",
        pattern: /\bmonday\b.*\bfriday\b/i
      }
    ]
  },
  {
    id: "TC03",
    question: "How many annual leave days are provided?",
    expectedSection: "Annual Leave",
    expectedFacts: [
      {
        label: "15 days",
        pattern: /\b15 days\b/i
      },
      {
        label: "Annual leave",
        pattern: /\bannual leave\b/i
      }
    ]
  },
  {
    id: "TC04",
    question: "What is the office Wi-Fi password?",
    expectedSection: null,
    expectedFacts: [],
    expectedNoContext: true
  }
];

export async function generateRagAnswer(question) {
  const startedAt = Date.now();

  const documents = await retrieveDocuments(question);

  if (documents.length === 0) {
    return {
      answer:
        "I could not find this information in the provided policy.",
      documents: [],
      usage: {
        promptTokens: null,
        outputTokens: null,
        totalTokens: null
      },
      model: null,
      contextChars: 0,
      latencyMs: Date.now() - startedAt
    };
  }

  const {
    prompt,
    usedDocuments,
    contextChars
  } = buildRagPrompt(question, documents);

  const generated = await generateAnswer(prompt);

  return {
    answer: generated.answer,
    documents: usedDocuments,
    usage: generated.usage,
    model: generated.model,
    contextChars,
    latencyMs: Date.now() - startedAt
  };
}

export async function runEvaluationCase(testCase) {
  const result = await generateRagAnswer(testCase.question);

  const retrievedSections = result.documents.map(
    (document) => document.title
  );

  const sectionFound = testCase.expectedSection
    ? retrievedSections.includes(testCase.expectedSection)
    : retrievedSections.length === 0;

  const factResults = testCase.expectedFacts.map((fact) => ({
    label: fact.label,
    passed: fact.pattern.test(result.answer)
  }));

  const factsPassed = factResults.every(
    (fact) => fact.passed
  );

  const noContextPassed = testCase.expectedNoContext
    ? result.documents.length === 0 &&
      result.answer ===
        "I could not find this information in the provided policy."
    : true;

  return {
    id: testCase.id,
    question: testCase.question,
    expectedSection: testCase.expectedSection,
    retrievedSections,
    answer: result.answer,
    factResults,
    sectionFound,
    factsPassed,
    noContextPassed,
    latencyMs: result.latencyMs,
    usage: result.usage,
    passed:
      sectionFound &&
      factsPassed &&
      noContextPassed
  };
}
