import {
  handleFunctionError,
  jsonResponse,
  methodNotAllowed,
  normalizeEmail,
  publicUser,
  readAuthData,
  readJsonBody,
  requireSession,
  writeAuthData,
} from "./_admin-utils.mjs";

export async function handler(event) {
  if (!["GET", "POST"].includes(event.httpMethod)) return methodNotAllowed();

  try {
    const session = requireSession(event);
    const data = await readAuthData();

    if (event.httpMethod === "GET") {
      return jsonResponse(toPublicAdminData(data));
    }

    const body = await readJsonBody(event);
    const requestIndex = data.requests.findIndex((request) => request.id === body.id);

    if (requestIndex === -1) {
      return jsonResponse({ error: "가입 요청을 찾을 수 없습니다." }, 404);
    }

    const [request] = data.requests.splice(requestIndex, 1);

    if (body.action === "approve") {
      const alreadyApproved = data.users.some((user) => normalizeEmail(user.email) === normalizeEmail(request.email));

      if (!alreadyApproved) {
        data.users.unshift({
          id: request.id.replace("admin-request", "admin-user"),
          email: normalizeEmail(request.email),
          name: request.name,
          passwordHash: request.passwordHash,
          role: "admin",
          createdAt: request.requestedAt,
          approvedAt: new Date().toISOString(),
          approvedBy: session.email,
        });
      }
    } else if (body.action !== "reject") {
      return jsonResponse({ error: "지원하지 않는 작업입니다." }, 400);
    }

    await writeAuthData(data);
    return jsonResponse(toPublicAdminData(await readAuthData()));
  } catch (error) {
    return handleFunctionError(error);
  }
}

function toPublicAdminData(data) {
  return {
    users: data.users.map(publicUser),
    requests: data.requests.map((request) => ({
      id: request.id,
      email: request.email,
      name: request.name,
      requestedAt: request.requestedAt,
      status: request.status || "pending",
    })),
  };
}
