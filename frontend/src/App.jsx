import { useState } from "react";

import ChatPanel from "./components/ChatPanel";
import ComparisonPanel from "./components/ComparisonPanel";
import EvaluationPanel from "./components/EvaluationPanel";

import "./App.css";

const SAMPLE_POLICY = [
  {
    title: "Casual Leave",
    content:
      "Employees can take 12 days of casual leave per calendar year.",
    score: 0.75
  },
  {
    title: "Working Hours",
    content:
      "Normal working hours are 9:00 AM to 6:00 PM, Monday through Friday.",
    score: 0.5
  },
  {
    title: "Annual Leave",
    content:
      "Eligible employees receive 15 days of annual leave per year.",
    score: 0.5
  }
];

const SAMPLE_TESTS = [
  {
    id: "TC01",
    question: "Casual leave allowance",
    directPassed: false,
    ragPassed: true,
    retrievalPassed: true
  },
  {
    id: "TC02",
    question: "Normal working hours",
    directPassed: true,
    ragPassed: true,
    retrievalPassed: true
  },
  {
    id: "TC03",
    question: "Annual leave allowance",
    directPassed: false,
    ragPassed: true,
    retrievalPassed: true
  },
  {
    id: "TC04",
    question: "Company Wi-Fi password",
    directPassed: false,
    ragPassed: true,
    retrievalPassed: true
  }
];

function getDemoAnswer(question, mode) {
  const text = question.toLowerCase();

  if (text.includes("casual leave")) {
    return mode === "rag"
      ? "Employees can take 12 days of casual leave per calendar year. Manager approval is required."
      : "Casual leave policies vary by company. Please check your company's policy.";
  }

  if (text.includes("working hour")) {
    return "Normal working hours are 9:00 AM to 6:00 PM, Monday through Friday.";
  }

  if (text.includes("annual leave")) {
    return "Eligible employees receive 15 days of annual leave per year.";
  }

  if (text.includes("wifi") || text.includes("password")) {
    return "I could not find this information in the provided policy.";
  }

  return mode === "rag"
    ? "I could not find sufficient relevant information in the sample policy."
    : "Please provide more information so I can answer your question.";
}

export default function App() {
  const [activeTab, setActiveTab] = useState("chat");
  const [mode, setMode] = useState("rag");

  const [result, setResult] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [evaluation, setEvaluation] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleAsk(question) {
    setLoading(true);
    setError("");

    try {
      const answer = getDemoAnswer(question, mode);

      const resultData = {
        answer,
        sources: mode === "rag" && !answer.startsWith(
          "I could not find"
        )
          ? SAMPLE_POLICY.filter((source) => {
              const keywords = question.toLowerCase().split(/\W+/);
              return keywords.some(
                (word) =>
                  word.length > 3 &&
                  source.content.toLowerCase().includes(word)
              );
            })
          : [],
        latencyMs: 125,
        inputTokens: 120,
        outputTokens: 35
      };

      setResult(resultData);
    } catch {
      setError("Unable to generate the sample answer.");
    } finally {
      setLoading(false);
    }
  }

  function handleCompare() {
    setError("");

    setComparison({
      direct: {
        answer:
          "Casual leave policies vary by company. Please check the policy.",
        passed: false
      },
      rag: {
        answer:
          "Employees can take 12 days of casual leave per calendar year.",
        passed: true
      },
      conclusion:
        "In this illustrative example, the RAG answer includes the required company-specific fact."
    });
  }

  function handleRunTests() {
    setError("");

    setEvaluation({
      totalTests: SAMPLE_TESTS.length,
      directPassRate: 25,
      ragPassRate: 100,
      retrievalPassRate: 100,
      results: SAMPLE_TESTS
    });
  }

  const tabs = [
    { id: "chat", label: "Ask questions", icon: "✳" },
    { id: "compare", label: "Compare answers", icon: "⇄" },
    { id: "evaluation", label: "Evaluation", icon: "✓" }
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h1>Smart Knowledge</h1>
            <p>AI assistant</p>
          </div>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="navigation">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={
                activeTab === tab.id
                  ? "nav-item selected"
                  : "nav-item"
              }
              onClick={() => {
                setActiveTab(tab.id);
                setError("");
              }}
            >
              <span className="nav-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-label">PROJECT</div>
          <span className="sidebar-caption">
            RAG · Testing · Optimization
          </span>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Workspace /</span>{" "}
            <strong>
              {tabs.find((tab) => tab.id === activeTab)?.label}
            </strong>
          </div>

          <span className="environment-badge">
            <span className="online-dot" />
            Frontend demo
          </span>
        </header>

        <div className="page-content">
          <div className="page-intro">
            <p className="eyebrow">AI ENGINEERING WORKSPACE</p>
            <h2>Build better AI answers.</h2>
            <p className="muted">
              Retrieve knowledge, evaluate responses, and improve
              AI reliability.
            </p>
          </div>

          {activeTab === "chat" && (
            <ChatPanel
              mode={mode}
              setMode={(nextMode) => {
                setMode(nextMode);
                setResult(null);
              }}
              onAsk={handleAsk}
              loading={loading}
              result={result}
              error={error}
            />
          )}

          {activeTab === "compare" && (
            <ComparisonPanel
              comparison={comparison}
              onCompare={handleCompare}
              loading={loading}
              error={error}
            />
          )}

          {activeTab === "evaluation" && (
            <EvaluationPanel
              evaluation={evaluation}
              onRunTests={handleRunTests}
              loading={loading}
              error={error}
            />
          )}

          <footer className="footer">
            <span>Smart Knowledge Assistant</span>
          </footer>
        </div>
      </main>
    </div>
  );
}