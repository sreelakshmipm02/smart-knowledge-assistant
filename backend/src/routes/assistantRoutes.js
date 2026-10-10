import express from "express";
import {
  retrieveDocuments
} from "../services/retrievalService.js";

const router = express.Router();

function validateQuestion(req, res) {
  const question = req.body?.question;

  if (
    typeof question !== "string" ||
    question.trim().length === 0
  ) {
    res.status(400).json({
      error: "Please provide a question."
    });

    return null;
  }

  if (question.length > 500) {
    res.status(400).json({
      error: "Question must not exceed 500 characters."
    });

    return null;
  }

  return question.trim();
}

function createDemoAnswer(question, mode, documents) {
  const text = question.toLowerCase();

  if (mode === "rag") {
    if (documents.length === 0) {
      return "I could not find this information in the provided policy.";
    }

    const content = documents
      .map((document) => document.content)
      .join("\n");

    if (text.includes("casual leave")) {
      return content.includes("12 days")
        ? "Employees can take 12 days of casual leave per calendar year. Manager approval is required."
        : "I could not find this information in the provided policy.";
    }

    if (text.includes("annual leave")) {
      return content.includes("15 days")
        ? "Eligible employees receive 15 days of annual leave per year."
        : "I could not find this information in the provided policy.";
    }

    if (text.includes("working hours")) {
      return content.includes("9:00 AM to 6:00 PM")
        ? "Normal working hours are 9:00 AM to 6:00 PM, Monday through Friday."
        : "I could not find this information in the provided policy.";
    }

    return "Relevant policy sections were retrieved. AI generation will be connected in the next stage.";
  }

  return "This is a demo response without AI generation or access to external policy context.";
}

router.post("/direct", async (req, res, next) => {
  try {
    const question = validateQuestion(req, res);

    if (!question) return;

    const startTime = Date.now();

    const answer = createDemoAnswer(question, "direct", []);

    res.json({
      mode: "direct",
      question,
      answer,
      latencyMs: Date.now() - startTime,
      usage: {
        promptTokens: null,
        outputTokens: null,
        totalTokens: null
      },
      demo: true
    });
  } catch (error) {
    next(error);
  }
});

router.post("/rag", async (req, res, next) => {
  try {
    const question = validateQuestion(req, res);

    if (!question) return;

    const startTime = Date.now();

    const documents = await retrieveDocuments(question, 3);

    const answer = createDemoAnswer(
      question,
      "rag",
      documents
    );

    res.json({
      mode: "rag",
      question,
      answer,
      retrievedDocuments: documents.map((document) => ({
        title: document.title,
        content: document.content,
        score: document.score,
        matchedWords: document.matchedWords
      })),
      contextFound: documents.length > 0,
      latencyMs: Date.now() - startTime,
      usage: {
        promptTokens: null,
        outputTokens: null,
        totalTokens: null
      },
      demo: true
    });
  } catch (error) {
    next(error);
  }
});

export default router;