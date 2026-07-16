const signupForm = document.querySelector("#signup-form");
const signupMessage = document.querySelector("#signup-message");

async function handleSignup(event) {
  event.preventDefault();
  setMessage("가입 요청을 보내는 중입니다.");

  const formData = new FormData(signupForm);

  try {
    const response = await fetch("/.netlify/functions/admin-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });
    const payload = await response.json();

    if (!response.ok) throw new Error(payload.error || "가입 요청에 실패했습니다.");

    signupForm.reset();
    setMessage(payload.message || "가입 요청이 접수되었습니다.", "success");
  } catch (error) {
    setMessage(error.message, "error");
  }
}

function setMessage(message, type = "") {
  signupMessage.textContent = message;
  signupMessage.classList.toggle("is-error", type === "error");
  signupMessage.classList.toggle("is-success", type === "success");
}

signupForm.addEventListener("submit", handleSignup);
