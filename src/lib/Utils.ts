export async function loadJson(url: string | URL | Request): any {
  const response = await fetch(url);
  if (response.status != 200) {
    throw Error("Server returned status code " + response.status);
  }

  const json = await response.json().catch(() => null);
  if (json === null) {
    throw Error("Server returned invalid JSON: " + response.body);
  }

  return json;
}
