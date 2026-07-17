<?php
require_once __DIR__ . '/../includes/auth.php';
$admin = current_admin();
if (!$admin) {
    header('Location: /admin/login.php');
    exit;
}
$csrfToken = csrf_token();
?>
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>관리자 | 과수정 교원노동조합</title>
    <link rel="icon" href="../assets/images/smitu-thumbnail.png" />
    <link rel="apple-touch-icon" href="../assets/images/smitu-thumbnail.png" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
    <link rel="stylesheet" href="admin.css?v=20260717-posteradmin" />
    <meta name="csrf-token" content="<?= htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8') ?>" />
    <script src="https://cdn.jsdelivr.net/npm/tinymce@6/tinymce.min.js" referrerpolicy="origin" defer></script>
    <script src="admin-app.js?v=20260717-posteradmin" defer></script>
  </head>
  <body class="admin-body">
    <aside class="admin-app-sidebar" aria-label="관리자 메뉴">
      <a class="admin-app-logo" href="../index.php" target="_blank" rel="noreferrer" aria-label="사이트 보기">
        <img src="../assets/images/smitu-logo-full.png?v=20260716-logo" alt="SMITU 과수정 교원노동조합" />
      </a>

      <nav class="admin-app-nav" aria-label="콘텐츠 관리">
        <button class="admin-app-nav__link is-active" type="button" data-admin-section="dashboard">대시보드</button>
        <button class="admin-app-nav__link" type="button" data-admin-section="posters">포스터 관리</button>
        <button class="admin-app-nav__link" type="button" data-admin-section="notices">공지사항 관리</button>
        <button class="admin-app-nav__link" type="button" data-admin-section="activities">활동 관리</button>
        <button class="admin-app-nav__link" type="button" data-admin-section="resources">자료실 관리</button>
        <button class="admin-app-nav__link" type="button" data-admin-section="contactItems">문의 정보 관리</button>
        <button class="admin-app-nav__link" type="button" data-admin-section="members">회원 관리</button>
      </nav>

      <div class="admin-app-sidebar__footer">
        <button type="button" data-admin-section="admins">관리자 계정</button>
        <button type="button" data-admin-section="account">계정 정보</button>
        <button type="button" data-admin-section="password">비밀번호 변경</button>
        <button type="button" data-admin-section="home">홈 화면 설정</button>
        <button type="button" data-admin-section="site">사이트 설정</button>
        <button type="button" data-admin-section="aboutItems">조합소개</button>
        <a href="../index.php" target="_blank" rel="noreferrer">사이트 보기</a>
      </div>
    </aside>

    <main class="admin-workspace">
      <header class="admin-topbar">
        <div>
          <p class="eyebrow">Admin Console</p>
          <h1 id="admin-title">홈</h1>
          <p class="admin-user-line" id="admin-user-line">로그인 확인 중입니다.</p>
        </div>
        <div class="admin-topbar__actions">
          <details class="admin-account-menu">
            <summary aria-label="관리자 메뉴">
              <span><?= htmlspecialchars($admin['name'] ?: $admin['email'], ENT_QUOTES, 'UTF-8') ?></span>
              <small><?= htmlspecialchars($admin['role'] === 'owner' ? '최고관리자' : '관리자', ENT_QUOTES, 'UTF-8') ?></small>
            </summary>
            <div class="admin-account-menu__panel">
              <button type="button" data-admin-section="account">계정 설정</button>
              <button type="button" data-admin-section="password">비밀번호 변경</button>
              <button type="button" id="logout-button">로그아웃</button>
            </div>
          </details>
          <button class="primary-button" type="button" id="save-button" disabled aria-busy="false">저장하고 게시</button>
        </div>
      </header>

      <div class="status-message" id="status-message" role="status" aria-live="polite">
        관리자 정보를 확인하는 중입니다.
      </div>

      <div class="editor" id="editor"></div>
    </main>
  </body>
</html>
