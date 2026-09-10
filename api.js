async function unicapApi(action, data = {}) {
  const url = String(window.UNICAP_API_URL || "").trim();

  if (!url) {
    throw new Error("Backend ainda não conectado. Falta informar a URL /exec do Google Apps Script.");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({ action, data })
  });

  if (!response.ok) {
    throw new Error("Não foi possível comunicar com o servidor.");
  }

  const result = await response.json();

  if (!result || result.ok !== true) {
    throw new Error(result?.message || "O servidor recusou a operação.");
  }

  return result;
}

function unicapBackendConfigured() {
  return Boolean(String(window.UNICAP_API_URL || "").trim());
}
