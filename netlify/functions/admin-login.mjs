import {
  createSessionCookie,
  handleFunctionError,
  jsonResponse,
  methodNotAllowed,
  publicUser,
  readJsonBody,
  verifyCredentials,
} from "./_admin-utils.mjs";

export async function handler(event) {
  if (event.httpMethod !== "POST") return methodNotAllowed();

  try {
    const body = await readJsonBody(event);
    const user = await verifyCredentials(body.email, body.password);

    if (!user) {
      return jsonResponse({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, 401);
    }

    return jsonResponse(
      {
        ok: true,
        user: publicUser(user),
      },
      200,
      { "Set-Cookie": createSessionCookie(user) }
    );
  } catch (error) {
    return handleFunctionError(error);
  }
}
