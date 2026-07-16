import { getSession, jsonResponse, methodNotAllowed } from "./_admin-utils.mjs";

export async function handler(event) {
  if (event.httpMethod !== "GET") return methodNotAllowed();

  const user = getSession(event);
  if (!user) return jsonResponse({ authenticated: false }, 401);

  return jsonResponse({ authenticated: true, user });
}
