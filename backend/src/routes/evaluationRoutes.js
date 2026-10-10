
import express from "express";

import {
  retrieveDocuments
} from "../services/retrievalService.js";

import {
  evaluationCases,
  runEvaluationCase,
  generateRagAnswer
} from "../services/evaluationService.js";

const router = express.Router();

// 1. Retrieval-only evaluation
router.post("/tests", async (req, res, next) => {
  try {
    const results = [];

    for (const testCase of evaluationCases) {
      const documents = await retrieveDocuments(
        testCase.question,
        3
      );

      const retrievedSections = documents.map(
        (document) => document.title
      );

      const passed = testCase.expectedSection
        ? retrievedSections.includes(testCase.expectedSection)
        : retrievedSections.length === 0;

      results.push({
        id: testCase.id,
        question: testCase.question,
        expectedSection: testCase.expectedSection,
        retrievedSections,
        passed
      });
    }

    const passedCount = results.filter(
      (result) => result.passed
    ).length;

    res.json({
      summary: {
        totalTests: results.length,
        passed: passedCount,
        failed: results.length - passedCount,
        passRate: Number(
          ((passedCount / results.length) * 100).toFixed(2)
        )
      },
      results
    });
  } catch (error) {
    next(error);
  }
});

// 2. AI answer evaluation
router.post("/run", async (req, res, next) => {
  try {
    const results = [];

    for (const testCase of evaluationCases) {
      results.push(
        await runEvaluationCase(testCase)
      );
    }

    const passedCount = results.filter(
      (result) => result.passed
    ).length;

    const latencies = results
      .map((result) => result.latencyMs)
      .filter((value) => value > 0);

    const averageLatencyMs = latencies.length
      ? Math.round(
          latencies.reduce((sum, value) => sum + value, 0) /
            latencies.length
        )
      : 0;

    res.json({
      summary: {
        totalTests: results.length,
        passed: passedCount,
        failed: results.length - passedCount,
        passRate: Number(
          ((passedCount / results.length) * 100).toFixed(2)
        ),
        averageLatencyMs
      },
      results
    });
  } catch (error) {
    next(error);
  }
});

// 3. Response consistency evaluation
router.post("/consistency", async (req, res, next) => {
  const { question, repetitions } = req.body ?? {};

  if (
    typeof question !== "string" ||
    question.trim().length === 0 ||
    question.length > 500
  ) {
    return res.status(400).json({
      error: "Provide a question of 1 to 500 characters."
    });
  }

  const repeatCount = Number(repetitions ?? 3);

  if (
    !Number.isInteger(repeatCount) ||
    repeatCount < 2 ||
    repeatCount > 5
  ) {
    return res.status(400).json({
      error: "Repetitions must be an integer from 2 to 5."
    });
  }

  try {
    const answers = [];

    for (let i = 0; i < repeatCount; i++) {
      const result = await generateRagAnswer(
        question.trim()
      );

      answers.push({
        run: i + 1,
        answer: result.answer,
        model: result.model,
        latencyMs: result.latencyMs,
        usage: result.usage
      });
    }

    const normalize = (text) =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const firstAnswer = normalize(answers[0].answer);

    const exactMatches = answers.filter(
      (item) => normalize(item.answer) === firstAnswer
    ).length;

    res.json({
      question: question.trim(),
      repetitions: repeatCount,
      exactMatches,
      exactConsistencyRate: Number(
        ((exactMatches / repeatCount) * 100).toFixed(2)
      ),
      totalLatencyMs: answers.reduce(
        (sum, answer) => sum + answer.latencyMs,
        0
      ),
      answers
    });
  } catch (error) {
    next(error);
  }
});

export default router;
