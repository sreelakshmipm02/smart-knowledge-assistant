
import express from "express";

import { retrieveDocuments } from "../services/retrievalService.js";
import {
  buildDirectPrompt,
  buildRagPrompt
} from "../services/promptService.js";
import { generateAnswer } from "../services/aiService.js";

const router = express.Router();

const NOT_FOUND_ANSWER =
  "I could not find this information in the provided policy.";

function validateQuestion(req, res) {
  const { question } = req.body ?? {};

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
      error: "Question must be 500 characters or fewer."
    });

    return null;
  }

  return question.trim();
}

router.post("/direct", async (req, res, next) => {
  const startedAt = Date.now();
  const question = validateQuestion(req, res);

  if (question === null) {
    return;
  }

  try {
    const prompt = buildDirectPrompt(question);
    const result = await generateAnswer(prompt);

    res.json({
      mode: "direct",
      question,
      answer: result.answer,
      model: result.model,
      latencyMs: Date.now() - startedAt,
      usage: result.usage,
      demo: false
    });
  } catch (error) {
    next(error);
  }
});

router.post("/rag", async (req, res, next) => {
  const startedAt = Date.now();
  const question = validateQuestion(req, res);

  if (question === null) {
    return;
  }

  try {
    const documents = await retrieveDocuments(question);

    // Do not ask the model to guess when retrieval finds nothing.
    if (documents.length === 0) {
      return res.json({
        mode: "rag",
        question,
        answer: NOT_FOUND_ANSWER,
        model: null,
        retrievedDocuments: [],
        contextFound: false,
        contextChars: 0,
        latencyMs: Date.now() - startedAt,
        usage: {
          promptTokens: null,
          outputTokens: null,
          totalTokens: null
        },
        demo: false
      });
    }

    const {
      prompt,
      usedDocuments,
      contextChars
    } = buildRagPrompt(question, documents);

    const result = await generateAnswer(prompt);

    res.json({
      mode: "rag",
      question,
      answer: result.answer,
      model: result.model,
      retrievedDocuments: usedDocuments.map((document) => ({
        title: document.title,
        content: document.content,
        score: document.score,
        matchedWords: document.matchedWords,
        truncated: document.truncated
      })),
      contextFound: true,
      contextChars,
      latencyMs: Date.now() - startedAt,
      usage: result.usage,
      demo: false
    });
  } catch (error) {
    next(error);
  }
});

export default router;
