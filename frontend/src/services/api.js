const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001/api";

export async function postRequest(endpoint, body = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
  } catch {
    throw new Error(
      "Cannot connect to the backend. Check whether the server is running."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || `Request failed with status ${response.status}`
    );
  }

  return data;
}