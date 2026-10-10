const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001/api";

export async function postRequest(endpoint, body) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || `Request failed: ${response.status}`
    );
  }

  return data;
}