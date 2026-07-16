import { getStore } from "@netlify/blobs";
import { createHash, createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "smitu_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8;
const USERS_KEY = "admin-users.json";

export function jsonResponse(payload, status = 200, extraHeaders = {}) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
    body: JSON.stringify(payload),
  };
}

export function methodNotAllowed() {
  return jsonResponse({ error: "Method not allowed" }, 405);
}

export async function readJsonBody(event) {
  if (!event.body) return {};

  try {
    return JSON.parse(event.body);
  } catch (error) {
    throw new Error("JSON 형식이 올바르지 않습니다.");
  }
}

export function createPasswordHash(password) {
  const salt = randomBytes(16).toString("hex");
  const iterations = 210000;
  const hash = pbkdf2Sync(String(password), salt, iterations, 32, "sha256").toString("hex");
  return `pbkdf2$${iterations}$${salt}$${hash}`;
}

export function verifyPassword(password, storedValue) {
  const stored = String(storedValue || "");

  if (stored.startsWith("pbkdf2$")) {
    const [, iterations, salt, expectedHash] = stored.split("$");
    const actual = pbkdf2Sync(String(password), salt, Number(iterations), 32, "sha256").toString("hex");
    return safeEqual(actual, expectedHash);
  }

  return safeEqual(String(password), stored);
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name || user.email,
    role: user.role || "admin",
    createdAt: user.createdAt || "",
    approvedAt: user.approvedAt || "",
    approvedBy: user.approvedBy || "",
    source: user.source || "site",
  };
}

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function makeId(prefix = "id") {
  return `${prefix}-${Date.now()}-${randomBytes(4).toString("hex")}`;
}

export async function getAuthStore() {
  return getStore({ name: "smitu-admin-auth", consistency: "strong" });
}

export async function readAuthData() {
  const store = await getAuthStore();
  const saved = (await store.get(USERS_KEY, { type: "json", consistency: "strong" })) || {};
  const data = {
    users: Array.isArray(saved.users) ? saved.users : [],
    requests: Array.isArray(saved.requests) ? saved.requests : [],
  };

  return mergeBootstrapAdmin(data);
}

export async function writeAuthData(data) {
  const store = await getAuthStore();
  await store.setJSON(
    USERS_KEY,
    {
      users: (data.users || []).filter((user) => user.source !== "env"),
      requests: data.requests || [],
    },
    { metadata: { updatedAt: new Date().toISOString() } }
  );
}

function mergeBootstrapAdmin(data) {
  const email = normalizeEmail(process.env.ADMIN_EMAIL);
  const passwordHash = process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || "";

  if (!email || !passwordHash) return data;

  const exists = data.users.some((user) => normalizeEmail(user.email) === email);
  if (exists) return data;

  return {
    ...data,
    users: [
      {
        id: "bootstrap-admin",
        email,
        name: process.env.ADMIN_NAME || "대표 관리자",
        role: "owner",
        passwordHash,
        createdAt: "",
        approvedAt: "",
        source: "env",
      },
      ...data.users,
    ],
  };
}

export async function verifyCredentials(email, password) {
  const normalizedEmail = normalizeEmail(email);
  const data = await readAuthData();
  const user = data.users.find((item) => normalizeEmail(item.email) === normalizedEmail);

  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  return user;
}

export function createSessionCookie(user) {
  const token = signSession({
    sub: user.id,
    email: normalizeEmail(user.email),
    name: user.name || user.email,
    role: user.role || "admin",
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  });

  return `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${SESSION_MAX_AGE}; HttpOnly; Secure; SameSite=Strict`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

export function requireSession(event) {
  const session = getSession(event);
  if (!session) {
    const error = new Error("로그인이 필요합니다.");
    error.statusCode = 401;
    throw error;
  }
  return session;
}

export function getSession(event) {
  const cookie = parseCookies(event.headers.cookie || event.headers.Cookie || "")[SESSION_COOKIE];
  if (!cookie) return null;

  const payload = verifySession(cookie);
  if (!payload || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

function signSession(payload) {
  const encodedPayload = base64url(JSON.stringify(payload));
  const signature = createHmac("sha256", getSessionSecret()).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

function verifySession(token) {
  const [encodedPayload, signature] = String(token || "").split(".");
  if (!encodedPayload || !signature) return null;

  const expected = createHmac("sha256", getSessionSecret()).update(encodedPayload).digest("base64url");
  if (!safeEqual(signature, expected)) return null;

  try {
    return JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  } catch (error) {
    return null;
  }
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 24) {
    throw new Error("SESSION_SECRET 환경 변수를 24자 이상으로 설정해야 합니다.");
  }
  return secret;
}

function parseCookies(cookieHeader) {
  return Object.fromEntries(
    String(cookieHeader || "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        return [decodeURIComponent(part.slice(0, index)), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

function base64url(value) {
  return Buffer.from(String(value)).toString("base64url");
}

export function getGithubConfig() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

  if (!token) {
    throw new Error("GITHUB_TOKEN 환경 변수를 설정해야 게시물을 저장할 수 있습니다.");
  }

  return {
    owner: process.env.GITHUB_OWNER || "limshoon",
    repo: process.env.GITHUB_REPO || "GSJ_website",
    branch: process.env.GITHUB_BRANCH || "main",
    token,
  };
}

export async function githubRequest(path, options = {}) {
  const config = getGithubConfig();
  const response = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let detail = "";
    try {
      const payload = await response.json();
      detail = payload.message ? ` ${payload.message}` : "";
    } catch (error) {
      detail = "";
    }
    throw new Error(`GitHub 요청에 실패했습니다.${detail}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export function hashValue(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

export function handleFunctionError(error) {
  return jsonResponse({ error: error.message || "처리 중 문제가 발생했습니다." }, error.statusCode || 500);
}
