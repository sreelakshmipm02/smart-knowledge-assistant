export default function EvaluationPanel({
  evaluation,
  onRunTests,
  loading,
  error
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">MODULE 18</p>
          <h2>Retrieval evaluation</h2>
          <p className="muted">
            Check whether the correct policy sections are retrieved.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={onRunTests}
          disabled={loading}
        >
          {loading ? "Running..." : "Run tests"}
        </button>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {!evaluation && (
        <div className="empty-state">
          <div className="empty-icon">✓</div>
          <h3>Ready to evaluate</h3>
          <p className="muted">
            Run the backend test suite to inspect actual retrieval results.
          </p>
        </div>
      )}

      {evaluation && (
        <>
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-label">Total tests</span>
              <strong>{evaluation.totalTests}</strong>
            </div>

            <div className="metric-card">
              <span className="metric-label">Passed</span>
              <strong>{evaluation.passed}</strong>
            </div>

            <div className="metric-card">
              <span className="metric-label">Failed</span>
              <strong>{evaluation.failed}</strong>
            </div>

            <div className="metric-card">
              <span className="metric-label">Retrieval pass rate</span>
              <strong>{evaluation.retrievalPassRate}%</strong>
            </div>
          </div>

          <h3 className="section-title">Individual test results</h3>

          <div className="table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Question</th>
                  <th>Expected section</th>
                  <th>Retrieved sections</th>
                  <th>Result</th>
                </tr>
              </thead>

              <tbody>
                {evaluation.results.map((test) => (
                  <tr key={test.id}>
                    <td>{test.id}</td>
                    <td>{test.question}</td>
                    <td>{test.expectedSection ?? "None"}</td>
                    <td>
                      {test.retrievedSections.length
                        ? test.retrievedSections.join(", ")
                        : "None"}
                    </td>
                    <td>
                      <span className={test.passed ? "pass" : "fail"}>
                        {test.passed ? "Pass" : "Fail"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="demo-note">
            These measurements evaluate document retrieval only.
            AI-generated answer accuracy will be evaluated after Gemini
            is integrated.
          </p>
        </>
      )}
    </section>
  );
}