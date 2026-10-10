import { useState } from "react";

export default function ChatPanel({
  mode,
  setMode,
  onAsk,
  loading,
  result,
  error
}) {
  const [question, setQuestion] = useState(
    "How many casual leave days are allowed?"
  );

  function handleSubmit(event) {
    event.preventDefault();

    if (!question.trim() || loading) return;

    onAsk(question.trim());
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">KNOWLEDGE ASSISTANT</p>
          <h2>Ask your documents</h2>
          <p className="muted">
            Get answers using your company's policy knowledge.
          </p>
        </div>
        <span className="status-badge">Demo mode</span>
      </div>

      <div className="mode-selector">
        <button
          type="button"
          className={mode === "direct" ? "mode active" : "mode"}
          onClick={() => setMode("direct")}
        >
          Direct prompting
        </button>

        <button
          type="button"
          className={mode === "rag" ? "mode active" : "mode"}
          onClick={() => setMode("rag")}
        >
          RAG with context
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="question">Your question</label>

        <textarea
          id="question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask something about the company policy..."
          maxLength={500}
          rows={4}
        />

        <div className="form-footer">
          <span className="muted">
            {question.length}/500 characters
          </span>

          <button
            className="primary-button"
            type="submit"
            disabled={loading || !question.trim()}
          >
            {loading ? "Generating..." : "Ask AI"}
          </button>
        </div>
      </form>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {loading && (
        <div className="loading-message" role="status">
          Preparing your answer...
        </div>
      )}

      {result && (
        <div className="answer-card">
          <div className="answer-header">
            <div>
              <p className="eyebrow">GENERATED ANSWER</p>
              <h3>{mode === "rag" ? "Context-aware answer" : "Direct answer"}</h3>
            </div>

            <span className="status-badge">
              {mode === "rag" ? "RAG" : "Direct"}
            </span>
          </div>

          <p className="answer-text">{result.answer}</p>

          {mode === "rag" && (
            <div className="sources">
              <h4>Retrieved sources</h4>

              {result.sources?.length ? (
                result.sources.map((source) => (
                  <div className="source-item" key={source.title}>
                    <div>
                      <strong>{source.title}</strong>
                      <p className="muted">{source.content}</p>
                    </div>
                    <span className="score">
                      {(source.score * 100).toFixed(0)}%
                    </span>
                  </div>
                ))
              ) : (
                <p className="muted">
                  No relevant source was found.
                </p>
              )}
            </div>
          )}

          <div className="metrics-row">
            <div>
              <span className="metric-label">Latency</span>
              <strong>{result.latencyMs} ms</strong>
            </div>

            <div>
              <span className="metric-label">Input tokens</span>
              <strong>{result.inputTokens ?? "—"}</strong>
            </div>

            <div>
              <span className="metric-label">Output tokens</span>
              <strong>{result.outputTokens ?? "—"}</strong>
            </div>
          </div>

          <p className="demo-note">
            This is sample data. Real AI answers and measurements
            will appear after the backend is connected.
          </p>
        </div>
      )}
    </section>
  );
}