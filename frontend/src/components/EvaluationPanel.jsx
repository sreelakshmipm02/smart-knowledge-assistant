
import { useState } from "react";

export default function EvaluationPanel({
  evaluation,
  retrievalEvaluation,
  consistency,
  onRunEvaluation,
  onRunRetrievalTests,
  onRunConsistency,
  loading,
  error
}) {
  const [question, setQuestion] = useState(
    "How many casual leave days are allowed?"
  );
  const [repetitions, setRepetitions] = useState("2");

  function handleConsistencySubmit(event) {
    event.preventDefault();
    onRunConsistency(question, Number(repetitions));
  }

  return (
    <section className="evaluation-panel">
      <div className="evaluation-heading">
        <div>
          <h3>AI evaluation dashboard</h3>
          <p>
            Test retrieval, measure answer correctness, and
            check response consistency.
          </p>
        </div>

        <span className="evaluation-status">
          Module 18
        </span>
      </div>

      {error && (
        <div className="evaluation-error" role="alert">
          {error}
        </div>
      )}

      <div className="evaluation-actions">
        <button
          type="button"
          onClick={onRunRetrievalTests}
          disabled={loading}
        >
          Run retrieval tests
        </button>

        <button
          type="button"
          onClick={onRunEvaluation}
          disabled={loading}
        >
          Run AI evaluation
        </button>
      </div>

      {loading && (
        <p className="evaluation-loading">
          Running tests. Please wait...
        </p>
      )}

      {retrievalEvaluation && (
        <section className="evaluation-section">
          <h4>Retrieval test results</h4>

          <div className="evaluation-metrics">
            <Metric
              label="Total tests"
              value={retrievalEvaluation.totalTests}
            />
            <Metric
              label="Passed"
              value={retrievalEvaluation.passed}
            />
            <Metric
              label="Failed"
              value={retrievalEvaluation.failed}
            />
            <Metric
              label="Pass rate"
              value={`${retrievalEvaluation.passRate}%`}
            />
          </div>

          <TestResults results={retrievalEvaluation.results} />
        </section>
      )}

      {evaluation && (
        <section className="evaluation-section">
          <h4>AI answer evaluation results</h4>

          <div className="evaluation-metrics">
            <Metric
              label="Total tests"
              value={evaluation.totalTests}
            />
            <Metric
              label="Passed"
              value={evaluation.passed}
            />
            <Metric
              label="Failed"
              value={evaluation.failed}
            />
            <Metric
              label="Pass rate"
              value={`${evaluation.passRate}%`}
            />
            <Metric
              label="Avg. latency"
              value={`${evaluation.averageLatencyMs} ms`}
            />
          </div>

          <TestResults results={evaluation.results} />

          {evaluation.results.map((result) => (
            <details
              className="evaluation-detail"
              key={result.id}
            >
              <summary>
                {result.id}: {result.question}
              </summary>

              <p>
                <strong>Generated answer:</strong>{" "}
                {result.answer}
              </p>

              <p>
                <strong>Expected section:</strong>{" "}
                {result.expectedSection || "No section expected"}
              </p>

              <p>
                <strong>Retrieved sections:</strong>{" "}
                {result.retrievedSections.join(", ") ||
                  "None"}
              </p>

              <p>
                <strong>Fact checks:</strong>
              </p>

              <ul>
                {result.factResults.map((fact) => (
                  <li key={fact.label}>
                    {fact.passed ? "✓" : "✗"} {fact.label}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </section>
      )}

      <section className="evaluation-section">
        <h4>Response consistency test</h4>
        <p>
          Ask the same question repeatedly and compare the
          normalized answers.
        </p>

        <form
          className="consistency-form"
          onSubmit={handleConsistencySubmit}
        >
          <label htmlFor="consistency-question">
            Question
          </label>

          <textarea
            id="consistency-question"
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            rows={3}
            maxLength={500}
            required
          />

          <label htmlFor="consistency-repetitions">
            Number of repetitions
          </label>

          <select
            id="consistency-repetitions"
            value={repetitions}
            onChange={(event) =>
              setRepetitions(event.target.value)
            }
          >
            <option value="2">2 runs</option>
            <option value="3">3 runs</option>
            <option value="4">4 runs</option>
            <option value="5">5 runs</option>
          </select>

          <button type="submit" disabled={loading}>
            Run consistency test
          </button>
        </form>

        {consistency && (
          <div className="consistency-results">
            <div className="evaluation-metrics">
              <Metric
                label="Exact matches"
                value={`${consistency.exactMatches}/${consistency.repetitions}`}
              />
              <Metric
                label="Consistency rate"
                value={`${consistency.exactConsistencyRate}%`}
              />
              <Metric
                label="Total time"
                value={`${consistency.totalLatencyMs} ms`}
              />
            </div>

            {consistency.answers.map((answer) => (
              <article
                className="consistency-answer"
                key={answer.run}
              >
                <strong>Run {answer.run}</strong>
                <p>{answer.answer}</p>
                <small>
                  Latency: {answer.latencyMs} ms
                </small>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
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

function TestResults({ results = [] }) {
  return (
    <div className="evaluation-table-wrapper">
      <table className="evaluation-table">
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
          {results.map((result) => (
            <tr key={result.id}>
              <td>{result.id}</td>
              <td>{result.question}</td>
              <td>
                {result.expectedSection || "None"}
              </td>
              <td>
                {result.retrievedSections.join(", ") ||
                  "None"}
              </td>
              <td>
                <span
                  className={
                    result.passed
                      ? "evaluation-pass"
                      : "evaluation-fail"
                  }
                >
                  {result.passed ? "PASS" : "FAIL"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
