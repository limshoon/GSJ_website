import { clearSessionCookie, jsonResponse, methodNotAllowed } from "./_admin-utils.mjs";

export async function handler(event) {
  if (event.httpMethod !== "POST") return methodNotAllowed();
  return jsonResponse({ ok: true }, 200, { "Set-Cookie": clearSessionCookie() });
}
