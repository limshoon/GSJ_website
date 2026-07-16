const loginForm = document.querySelector("#login-form");
const loginMessage = document.querySelector("#login-message");

async function checkSession() {
  try {
    const response = await fetch("/.netlify/functions/admin-session", { cache: "no-store" });
    if (response.ok) window.location.href = "/admin/";
  } catch (error) {
    return;
  }
}

async function handleLogin(event) {
  event.preventDefault();
  setMessage("로그인 중입니다.");

  const formData = new FormData(loginForm);

  try {
    const response = await fetch("/.netlify/functions/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });
    const payload = await response.json();

    if (!response.ok) throw new Error(payload.error || "로그인에 실패했습니다.");

    setMessage("로그인되었습니다. 관리자 화면으로 이동합니다.", "success");
    window.location.href = "/admin/";
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
