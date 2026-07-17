<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/member_auth.php';

if (current_member()) {
    redirect_to('/mypage.php');
}

$values = [
    'name' => trim((string) ($_POST['name'] ?? '')),
    'email' => strtolower(trim((string) ($_POST['email'] ?? ''))),
    'phone' => trim((string) ($_POST['phone'] ?? '')),
    'organization' => trim((string) ($_POST['organization'] ?? '')),
];
$errorMessage = '';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    try {
        require_member_csrf();
        register_member($_POST);
        redirect_to('/login.php?joined=1');
    } catch (Throwable $error) {
        $errorMessage = $error->getMessage();
    }
}

$csrfToken = member_csrf_token();
?>
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="과수정 교원노동조합 회원가입 신청 페이지" />
    <meta name="robots" content="noindex, follow" />
    <meta name="theme-color" content="#1346FF" />
    <link rel="canonical" href="https://smitu.kr/signup.php" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="ko_KR" />
    <meta property="og:site_name" content="과수정 교원노동조합" />
    <meta property="og:title" content="회원가입 | 과수정 교원노동조합" />
    <meta property="og:description" content="과수정 교원노동조합 회원가입 신청 페이지" />
    <meta property="og:url" content="https://smitu.kr/signup.php" />
    <meta property="og:image" content="https://smitu.kr/assets/images/smitu-thumbnail.png" />
    <title>회원가입 | 과수정 교원노동조합</title>
    <link rel="icon" href="assets/images/smitu-thumbnail.png" />
    <link rel="apple-touch-icon" href="assets/images/smitu-thumbnail.png" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
    <link rel="stylesheet" href="assets/css/style.css?v=20260717-logoshadow" />
    <script src="assets/js/main.js?v=20260717-posters2" defer></script>
  </head>
  <body>
    <a class="skip-link" href="#main">본문으로 바로가기</a>

    <aside class="site-sidebar" aria-label="사이트 사이드바">
      <a class="site-logo" href="index.php#home" aria-label="과수정 교원노동조합 홈으로 이동">
        <img class="site-logo__brand" src="assets/images/smitu-logo-full.png?v=20260716-logo" alt="" aria-hidden="true" />
      </a>

      <button class="site-menu-button" type="button" aria-label="메뉴 열기" aria-controls="site-nav" aria-expanded="false">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </button>

      <nav class="site-nav" id="site-nav" aria-label="주요 메뉴">
        <ul class="site-nav__list">
          <li><a class="site-nav__link" href="index.php#home" data-section="home">홈</a></li>
          <li><a class="site-nav__link" href="poster.php" data-section="posters">포스터</a></li>
          <li><a class="site-nav__link" href="notice.php" data-section="notice">공지사항</a></li>
          <li><a class="site-nav__link" href="activity.php" data-section="activity">활동</a></li>
          <li><a class="site-nav__link" href="resource.php" data-section="resources">자료실</a></li>
          <li><a class="site-nav__link" href="contact.php" data-section="contact">문의</a></li>
        </ul>
        <div class="site-auth-links" aria-label="회원 메뉴">
          <a class="site-auth-link" href="login.php">로그인</a>
          <a class="site-auth-link is-active" href="signup.php">회원가입</a>
        </div>
      </nav>
    </aside>

    <main class="site-main" id="main">
      <section class="section section--page" aria-labelledby="signup-title">
        <div class="page-panel glass-panel auth-page-panel">
          <header class="page-header">
            <span class="section-panel__bar" aria-hidden="true"></span>
            <h1 class="page-title" id="signup-title">회원가입</h1>
            <p class="page-copy">가입 신청 후 관리자 승인을 거쳐 회원 로그인을 사용할 수 있습니다.</p>
          </header>

          <div class="auth-card">
            <?php if ($errorMessage !== ''): ?>
              <p class="auth-message is-error"><?= e($errorMessage) ?></p>
            <?php endif; ?>

            <form class="auth-form auth-form--grid" method="post" action="signup.php">
              <input type="hidden" name="_csrf" value="<?= e($csrfToken) ?>" />
              <label>
                <span>이름</span>
                <input name="name" value="<?= e($values['name']) ?>" autocomplete="name" required />
              </label>
              <label>
                <span>이메일</span>
                <input name="email" type="email" value="<?= e($values['email']) ?>" autocomplete="email" required />
              </label>
              <label>
                <span>비밀번호</span>
                <input name="password" type="password" autocomplete="new-password" minlength="8" required />
              </label>
              <label>
                <span>비밀번호 확인</span>
                <input name="password_confirm" type="password" autocomplete="new-password" minlength="8" required />
              </label>
              <label>
                <span>연락처</span>
                <input name="phone" value="<?= e($values['phone']) ?>" autocomplete="tel" placeholder="010-0000-0000" />
              </label>
              <label>
                <span>소속</span>
                <input name="organization" value="<?= e($values['organization']) ?>" placeholder="학교명 또는 기관명" />
              </label>
              <button class="auth-button" type="submit">가입 신청</button>
            </form>

            <p class="auth-helper">이미 가입 신청을 했다면 <a href="login.php">로그인</a>에서 승인 상태를 확인해 주세요.</p>
            <p class="auth-helper auth-helper--sub">비밀번호는 8자 이상으로 입력해 주세요.</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="site-footer__office">
        <strong>과수정 교원노동조합 사무실</strong>
        <address>
          서울특별시 00구 00로 00 0000빌딩 000호<br />
          T. 02-000-0000&nbsp;&nbsp;&nbsp;&nbsp; E. smi.union@example.com
        </address>
      </div>
      <p class="site-footer__copyright">© 2024 과수정 교원노동조합. ALL RIGHTS RESERVED.</p>
      <div class="site-footer__sns" aria-label="SNS 링크">
        <strong>SNS</strong>
        <ul>
          <li><a href="#" aria-label="Instagram">Instagram</a></li>
          <li><a href="#" aria-label="Facebook">Facebook</a></li>
          <li><a href="#" aria-label="YouTube">YouTube</a></li>
        </ul>
      </div>
    </footer>

    <button class="back-to-top" type="button" id="back-to-top" aria-label="페이지 맨 위로 이동">
      ↑
    </button>
  </body>
</html>
