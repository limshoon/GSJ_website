import {
  getGithubConfig,
  githubRequest,
  handleFunctionError,
  jsonResponse,
  makeId,
  methodNotAllowed,
  readJsonBody,
  requireSession,
} from "./_admin-utils.mjs";

const JSON_FILES = [
  ["content/site-info.json", (content) => ({ site: content.site || {} })],
  ["content/home.json", (content) => ({ home: content.home || {} })],
  ["content/notices.json", (content) => ({ notices: content.notices || [] })],
  ["content/activities.json", (content) => ({ activities: content.activities || [] })],
  ["content/resources.json", (content) => ({ resources: content.resources || [] })],
  ["content/about.json", (content) => ({ aboutItems: content.aboutItems || [] })],
  ["content/contact.json", (content) => ({ contactItems: content.contactItems || [] })],
  ["content/site.json", (content) => stripPrivateFields(content)],
];

export async function handler(event) {
  if (!["GET", "PUT"].includes(event.httpMethod)) return methodNotAllowed();

  try {
    const session = requireSession(event);

    if (event.httpMethod === "GET") {
      return jsonResponse({ content: await loadContentFromGitHub() });
    }

    const body = await readJsonBody(event);
    const content = body.content || {};
    const updatedContent = await applyUploads(content);
    const commit = await commitContent(updatedContent, session);

    return jsonResponse({
      ok: true,
      commit,
      content: stripPrivateFields(updatedContent),
    });
  } catch (error) {
    return handleFunctionError(error);
  }
}

async function loadContentFromGitHub() {
  const config = getGithubConfig();
  const files = [
    "content/site.json",
    "content/site-info.json",
    "content/home.json",
    "content/notices.json",
    "content/activities.json",
    "content/resources.json",
    "content/about.json",
    "content/contact.json",
  ];

  const parts = await Promise.all(files.map((path) => readJsonFile(path, config.branch)));
  return parts.reduce((content, part) => ({ ...content, ...part }), {});
}

async function readJsonFile(path, branch) {
  try {
    const payload = await githubRequest(`/contents/${encodeURIComponentPath(path)}?ref=${encodeURIComponent(branch)}`);
    const json = Buffer.from(String(payload.content || "").replace(/\s/g, ""), "base64").toString("utf8");
    return JSON.parse(json);
  } catch (error) {
    return {};
  }
}

async function applyUploads(content) {
  for (const collection of ["notices", "activities", "resources"]) {
    for (const item of content[collection] || []) {
      if (!item._uploads) continue;

      for (const [field, upload] of Object.entries(item._uploads)) {
        const fileName = upload.name || "file";
        const path = getUploadPath(upload.kind, fileName);

        item[field] = path;
        item._uploadTreeItems = item._uploadTreeItems || [];
        item._uploadTreeItems.push({
          path,
          mode: "100644",
          type: "blob",
          encoding: "base64",
          content: upload.content,
        });
      }

      delete item._uploads;
    }
  }

  return content;
}

async function commitContent(content, session) {
  const config = getGithubConfig();
  const ref = await githubRequest(`/git/ref/heads/${encodeURIComponent(config.branch)}`);
  const latestCommit = await githubRequest(`/git/commits/${ref.object.sha}`);
  const uploadTreeItems = await createUploadTreeItems(content);
  const jsonTreeItems = JSON_FILES.map(([path, pick]) => ({
    path,
    mode: "100644",
    type: "blob",
    content: `${JSON.stringify(pick(content), null, 2)}\n`,
  }));

  const tree = await githubRequest("/git/trees", {
    method: "POST",
    body: JSON.stringify({
      base_tree: latestCommit.tree.sha,
      tree: [...jsonTreeItems, ...uploadTreeItems],
    }),
  });

  const commit = await githubRequest("/git/commits", {
    method: "POST",
    body: JSON.stringify({
      message: `Update site content by ${session.email || "admin"}`,
      tree: tree.sha,
      parents: [latestCommit.sha],
    }),
  });

  await githubRequest(`/git/refs/heads/${encodeURIComponent(config.branch)}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha }),
  });

  return {
    sha: commit.sha,
    url: commit.html_url,
  };
}

async function createUploadTreeItems(content) {
  const uploads = [];

  for (const collection of ["notices", "activities", "resources"]) {
    for (const item of content[collection] || []) {
      if (!item._uploadTreeItems) continue;

      uploads.push(...item._uploadTreeItems);
      delete item._uploadTreeItems;
    }
  }

  const treeItems = [];

  for (const upload of uploads) {
    const blob = await githubRequest("/git/blobs", {
      method: "POST",
      body: JSON.stringify({
        content: upload.content,
        encoding: "base64",
      }),
    });

    treeItems.push({
      path: upload.path,
      mode: upload.mode,
      type: upload.type,
      sha: blob.sha,
    });
  }

  return treeItems;
}

function stripPrivateFields(content) {
  const cloned = JSON.parse(JSON.stringify(content || {}));

  ["notices", "activities", "resources"].forEach((collection) => {
    cloned[collection] = (cloned[collection] || []).map(({ _uploads, _uploadTreeItems, ...item }) => item);
  });

  return cloned;
}

function getUploadPath(kind, fileName) {
  const directory = kind === "image" ? "assets/images/uploads" : "assets/files/uploads";
  return `${directory}/${makeSafeFileName(fileName)}`;
}

function makeSafeFileName(name) {
  const extension = name.includes(".") ? name.slice(name.lastIndexOf(".")).toLowerCase().replace(/[^a-z0-9.]/g, "") : "";
  const baseName = name
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return `${Date.now()}-${makeId("upload").replace(/[^a-z0-9-]/g, "")}-${baseName || "file"}${extension || ".dat"}`;
}

function encodeURIComponentPath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}
