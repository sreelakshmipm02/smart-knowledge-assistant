import express from "express";
import {
  retrieveDocuments
} from "../services/retrievalService.js";

const router = express.Router();

const testCases = [
  {
    id: "TC01",
    question: "How many casual leave days are allowed?",
    expectedSection: "Casual Leave"
  },
  {
    id: "TC02",
    question: "What are the normal working hours?",
    expectedSection: "Working Hours"
  },
  {
    id: "TC03",
    question: "How many annual leave days are provided?",
    expectedSection: "Annual Leave"
  },
  {
    id: "TC04",
    question: "What is the office Wi-Fi password?",
    expectedSection: null
  }
];

router.post("/tests", async (req, res, next) => {
  try {
    const results = [];

    for (const testCase of testCases) {
      const documents = await retrieveDocuments(
        testCase.question,
        3
      );

      const retrievedTitles = documents.map(
        (document) => document.title
      );

      const passed = testCase.expectedSection === null
        ? documents.length === 0
        : retrievedTitles.includes(testCase.expectedSection);

      results.push({
        id: testCase.id,
        question: testCase.question,
        expectedSection: testCase.expectedSection,
        retrievedSections: retrievedTitles,
        passed
      });
    }

    const passedCount = results.filter(
      (result) => result.passed
    ).length;

    res.json({
      demo: true,
      summary: {
        totalTests: results.length,
        passed: passedCount,
        failed: results.length - passedCount,
        passRate: Number(
          (passedCount / results.length * 100).toFixed(2)
        )
      },
      results
    });
  } catch (error) {
    next(error);
  }
});

export default router;