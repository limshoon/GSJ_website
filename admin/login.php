<?php
require_once __DIR__ . '/../includes/auth.php';

if (current_admin()) {
    header('Location: /admin/dashboard.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>관리자 로그인 | 과수정 교원노동조합</title>
    <link rel="icon" href="../assets/images/smitu-thumbnail.png" />
    <link rel="apple-touch-icon" href="../assets/images/smitu-thumbnail.png" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
    <link rel="stylesheet" href="admin.css?v=20260716-cms-auth" />
    <script src="../assets/js/login.js?v=20260716-cms-auth" defer></script>
  </head>
  <body class="auth-page">
    <main class="auth-shell">
      <a class="auth-logo" href="../index.php" aria-label="사이트로 돌아가기">
        <img src="../assets/images/smitu-logo-full.png?v=20260716-logo" alt="SMITU 과수정 교원노동조합" />
      </a>

      <section class="auth-panel" aria-labelledby="login-title">
        <p class="eyebrow">SMITU ADMIN</p>
        <h1 id="login-title">관리자 로그인</h1>
        <p>등록된 관리자만 게시물을 작성하고 수정할 수 있습니다.</p>

        <form class="auth-form" id="login-form">
          <label>
            <span>이메일 또는 아이디</span>
            <input name="identity" autocomplete="username" required />
          </label>
          <label>
            <span>비밀번호</span>
            <input name="password" type="password" autocomplete="current-password" required />
          </label>
          <label class="remember-field">
            <input name="remember" type="checkbox" />
            <span>로그인 상태 유지</span>
          </label>
          <button class="primary-button" type="submit">로그인</button>
        </form>

        <p class="auth-message" id="login-message" role="status" aria-live="polite"></p>
        <p class="auth-link-copy">SMITU CMS</p>
      </section>
    </main>
  </body>
</html>
