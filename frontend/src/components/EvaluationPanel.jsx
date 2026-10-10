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
          <h2>AI evaluation</h2>
          <p className="muted">
            Check accuracy, retrieval, and response quality.
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
            Run the sample test suite to see how evaluation works.
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
              <span className="metric-label">Direct pass rate</span>
              <strong>{evaluation.directPassRate}%</strong>
            </div>

            <div className="metric-card">
              <span className="metric-label">RAG pass rate</span>
              <strong>{evaluation.ragPassRate}%</strong>
            </div>

            <div className="metric-card">
              <span className="metric-label">Retrieval pass rate</span>
              <strong>{evaluation.retrievalPassRate}%</strong>
            </div>
          </div>

          <h3 className="section-title">Test case results</h3>

          <div className="table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Test ID</th>
                  <th>Test case</th>
                  <th>Direct</th>
                  <th>RAG</th>
                  <th>Retrieval</th>
                </tr>
              </thead>

              <tbody>
                {evaluation.results.map((result) => (
                  <tr key={result.id}>
                    <td>{result.id}</td>
                    <td>{result.question}</td>
                    <td>
                      <span className={result.directPassed ? "pass" : "fail"}>
                        {result.directPassed ? "Pass" : "Fail"}
                      </span>
                    </td>
                    <td>
                      <span className={result.ragPassed ? "pass" : "fail"}>
                        {result.ragPassed ? "Pass" : "Fail"}
                      </span>
                    </td>
                    <td>
                      <span className={result.retrievalPassed ? "pass" : "fail"}>
                        {result.retrievalPassed ? "Pass" : "Fail"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="demo-note">
            Sample evaluation scores are predefined. They will be
            replaced by actual test results when the backend is ready.
          </p>
        </>
      )}
    </section>
  );
}