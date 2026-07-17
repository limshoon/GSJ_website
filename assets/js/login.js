const loginForm = document.querySelector("#login-form");
const loginMessage = document.querySelector("#login-message");

async function checkSession() {
  try {
    const response = await fetch("/api/session.php", { cache: "no-store", credentials: "same-origin" });
    if (response.ok) window.location.href = "/admin/dashboard.php";
  } catch (error) {
    return;
  }
}

async function handleLogin(event) {
  event.preventDefault();
  setMessage("로그인 중입니다.");

  const formData = new FormData(loginForm);

  try {
    const response = await fetch("/api/login.php", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identity: formData.get("identity"),
        password: formData.get("password"),
        remember: Boolean(formData.get("remember")),
      }),
    });
    const payload = await response.json();

    if (!response.ok) throw new Error(payload.error || "로그인에 실패했습니다.");

    setMessage("로그인되었습니다. 관리자 화면으로 이동합니다.", "success");
    window.location.href = "/admin/dashboard.php";
  } catch (error) {
    setMessage(error.message, "error");
  }
}

function setMessage(message, type = "") {
  loginMessage.textContent = message;
  loginMessage.classList.toggle("is-error", type === "error");
  loginMessage.classList.toggle("is-success", type === "success");
}

loginForm.addEventListener("submit", handleLogin);
checkSession();
