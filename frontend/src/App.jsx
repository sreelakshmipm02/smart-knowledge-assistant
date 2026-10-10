import { useState } from "react";

import ChatPanel from "./components/ChatPanel";
import ComparisonPanel from "./components/ComparisonPanel";
import EvaluationPanel from "./components/EvaluationPanel";

import { postRequest } from "./services/api";
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("chat");
  const [mode, setMode] = useState("rag");

  const [result, setResult] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [evaluation, setEvaluation] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [retrievalEvaluation, setRetrievalEvaluation] = useState(null);
  const [consistency, setConsistency] = useState(null);

  async function handleAsk(question) {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const endpoint = mode === "rag" ? "/rag" : "/direct";

      const data = await postRequest(endpoint, { question });

      setResult({
        answer: data.answer,
        sources: (data.retrievedDocuments || []).map(
          (document) => ({
            title: document.title,
            content: document.content,
            score: document.score
          })
        ),
        latencyMs: data.latencyMs,
        inputTokens: data.usage?.promptTokens ?? null,
        outputTokens: data.usage?.outputTokens ?? null,
        contextFound: data.contextFound
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCompare() {
    setLoading(true);
    setError("");
    setComparison(null);

    try {
      const question =
        "How many casual leave days are allowed?";

      const [direct, rag] = await Promise.all([
        postRequest("/direct", { question }),
        postRequest("/rag", { question })
      ]);

      // A simple rule-based check for this known test question.
      const expectedTerms = [
        "12 days",
        "casual leave",
        "calendar year"
      ];

      function passes(answer) {
        const normalized = answer.toLowerCase();

        return expectedTerms.every((term) =>
          normalized.includes(term)
        );
      }

      const directPassed = passes(direct.answer);
      const ragPassed = passes(rag.answer);

      let conclusion;

      if (!directPassed && ragPassed) {
        conclusion =
          "RAG passed the configured reference checks while direct prompting did not.";
      } else if (directPassed && !ragPassed) {
        conclusion =
          "Direct prompting passed the checks while RAG did not. Inspect the retrieved context and prompt.";
      } else if (directPassed && ragPassed) {
        conclusion =
          "Both responses passed the configured checks. More test cases are needed to compare them.";
      } else {
        conclusion =
          "Neither response passed all configured checks. Inspect the answers and evaluation rules.";
      }

      setComparison({
        direct: {
          answer: direct.answer,
          passed: directPassed
        },
        rag: {
          answer: rag.answer,
          passed: ragPassed
        },
        conclusion
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  
  async function handleRunRetrievalTests() {
    setLoading(true);
    setError("");
    setRetrievalEvaluation(null);

    try {
      const data = await postRequest("/evaluation/tests");

      setRetrievalEvaluation({
        totalTests: data.summary.totalTests,
        passed: data.summary.passed,
        failed: data.summary.failed,
        passRate: data.summary.passRate,
        results: data.results
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRunEvaluation() {
    setLoading(true);
    setError("");
    setEvaluation(null);

    try {
      const data = await postRequest("/evaluation/run");

      setEvaluation({
        totalTests: data.summary.totalTests,
        passed: data.summary.passed,
        failed: data.summary.failed,
        passRate: data.summary.passRate,
        averageLatencyMs: data.summary.averageLatencyMs,
        results: data.results
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRunConsistency(question, repetitions) {
    setLoading(true);
    setError("");
    setConsistency(null);

    try {
      const data = await postRequest("/evaluation/consistency", {
        question,
        repetitions
      });

      setConsistency(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
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
          <p>Module 17 + Module 18</p>
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
            Backend connected by API
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
                setError("");
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
              retrievalEvaluation={retrievalEvaluation}
              consistency={consistency}
              onRunEvaluation={handleRunEvaluation}
              onRunRetrievalTests={handleRunRetrievalTests}
              onRunConsistency={handleRunConsistency}
              loading={loading}
              error={error}
            />
          )}


          <footer className="footer">
            <span>Smart Knowledge Assistant</span>
            <span>React + Express · Demo AI mode</span>
          </footer>
        </div>
      </main>
    </div>
  );
}