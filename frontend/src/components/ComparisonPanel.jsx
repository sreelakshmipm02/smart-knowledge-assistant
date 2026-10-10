export default function ComparisonPanel({
  comparison,
  onCompare,
  loading,
  error
}) {
  function formatMetric(value, suffix = "") {
    return value === null || value === undefined
      ? "Not available"
      : `${value}${suffix}`;
  }

  return (
    <section className="comparison-panel">
      <div className="comparison-heading">
        <div>
          <h3>Direct vs RAG</h3>
          <p>
            Compare answer quality, response time, and token usage.
          </p>
        </div>

        <button
          type="button"
          onClick={onCompare}
          disabled={loading}
        >
          {loading ? "Comparing..." : "Run comparison"}
        </button>
      </div>

      {error && (
        <div className="evaluation-error" role="alert">
          {error}
        </div>
      )}

      {comparison && (
        <>
          <div className="comparison-question">
            <strong>Test question</strong>
            <p>{comparison.question}</p>
          </div>

          <div className="comparison-grid">
            <AnswerCard
              title="Direct prompting"
              result={comparison.direct}
              formatMetric={formatMetric}
            />

            <AnswerCard
              title="RAG prompting"
              result={comparison.rag}
              formatMetric={formatMetric}
            />
          </div>

          <section className="comparison-summary">
            <h4>Performance comparison</h4>

            <div className="evaluation-metrics">
              <Metric
                label="Direct latency"
                value={formatMetric(
                  comparison.direct.latencyMs,
                  " ms"
                )}
              />

              <Metric
                label="RAG latency"
                value={formatMetric(
                  comparison.rag.latencyMs,
                  " ms"
                )}
              />

              <Metric
                label="Latency difference (RAG − Direct)"
                value={formatMetric(
                  comparison.latencyDifferenceMs,
                  " ms"
                )}
              />

              <Metric
                label="Token difference (RAG − Direct)"
                value={formatMetric(
                  comparison.tokenDifference
                )}
              />
            </div>

            <p>{comparison.conclusion}</p>
          </section>
        </>
      )}
    </section>
  );
}

function AnswerCard({ title, result, formatMetric }) {
  return (
    <article className="comparison-answer">
      <h4>{title}</h4>

      <p className="comparison-answer-text">
        {result.answer}
      </p>

      <p>
        Reference checks:{" "}
        <strong>
          {result.passed ? "PASS" : "FAIL"}
        </strong>
      </p>

      <div className="comparison-small-metrics">
        <span>
          Latency: {formatMetric(result.latencyMs, " ms")}
        </span>
        <span>
          Input tokens: {formatMetric(result.inputTokens)}
        </span>
        <span>
          Output tokens: {formatMetric(result.outputTokens)}
        </span>
        <span>
          Total tokens: {formatMetric(result.totalTokens)}
        </span>
      </div>
    </article>
  );
}

function Metric({ label, value }) {
  return (
    <div className="evaluation-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
