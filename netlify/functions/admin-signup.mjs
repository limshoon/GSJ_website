import {
  createPasswordHash,
  handleFunctionError,
  jsonResponse,
  makeId,
  methodNotAllowed,
  normalizeEmail,
  readAuthData,
  readJsonBody,
  writeAuthData,
} from "./_admin-utils.mjs";

export async function handler(event) {
  if (event.httpMethod !== "POST") return methodNotAllowed();

  try {
    const body = await readJsonBody(event);
    const email = normalizeEmail(body.email);
    const name = String(body.name || "").trim();
    const password = String(body.password || "");

    if (!email || !email.includes("@")) {
      return jsonResponse({ error: "이메일을 입력해주세요." }, 400);
    }

    if (!name) {
      return jsonResponse({ error: "이름을 입력해주세요." }, 400);
    }

    if (password.length < 10) {
      return jsonResponse({ error: "비밀번호는 10자 이상이어야 합니다." }, 400);
    }

    const data = await readAuthData();
    const exists = [...data.users, ...data.requests].some((item) => normalizeEmail(item.email) === email);

    if (!exists) {
      data.requests.unshift({
        id: makeId("admin-request"),
        email,
        name,
        passwordHash: createPasswordHash(password),
        requestedAt: new Date().toISOString(),
        status: "pending",
      });
      await writeAuthData(data);
    }

    return jsonResponse({
      ok: true,
      message: "관리자 가입 요청이 접수되었습니다. 기존 관리자가 승인하면 로그인할 수 있습니다.",
    });
  } catch (error) {
    return handleFunctionError(error);
  }
}
