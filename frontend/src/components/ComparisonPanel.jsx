export default function ComparisonPanel({
  comparison,
  onCompare,
  loading,
  error
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Direct vs. RAG</h2>
          <p className="muted">
            Compare answers for the same question.
          </p>
        </div>
      </div>

      <div className="info-banner">
        <strong>Experiment</strong>
        <p>
          Direct prompting uses the question alone. RAG adds
          relevant external knowledge to the prompt.
        </p>
      </div>

      <button
        className="primary-button"
        type="button"
        onClick={onCompare}
        disabled={loading}
      >
        {loading ? "Comparing..." : "Run comparison"}
      </button>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {comparison && (
        <>
          <div className="comparison-grid">
            <article className="comparison-card">
              <span className="status-badge">Without context</span>
              <h3>Direct prompting</h3>
              <p>{comparison.direct.answer}</p>

              <div className="result-metric">
                <span>Evaluation</span>
                <strong>
                  {comparison.direct.passed ? "Passed" : "Failed"}
                </strong>
              </div>
            </article>

            <article className="comparison-card">
              <span className="status-badge">With context</span>
              <h3>RAG prompting</h3>
              <p>{comparison.rag.answer}</p>

              <div className="result-metric">
                <span>Evaluation</span>
                <strong>
                  {comparison.rag.passed ? "Passed" : "Failed"}
                </strong>
              </div>
            </article>
          </div>

          <div className="info-banner">
            <strong>Comparison result</strong>
            <p>{comparison.conclusion}</p>
            <p className="muted">
              Demo values are illustrative, not measured AI performance.
            </p>
          </div>
        </>
      )}
    </section>
  );
}