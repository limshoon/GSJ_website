<?php
declare(strict_types=1);

require_once __DIR__ . '/functions.php';

function render_sidebar(string $active = 'home'): void
{
    $items = [
        ['home', '홈', '/index.php#home'],
        ['posters', '포스터', '/poster.php'],
        ['notice', '공지사항', '/notice.php'],
        ['activity', '활동', '/activity.php'],
        ['resources', '자료실', '/resource.php'],
        ['contact', '문의', '/contact.php'],
    ];
    ?>
    <aside class="site-sidebar" aria-label="사이트 사이드바">
      <a class="site-logo" href="/index.php#home" aria-label="과수정 교원노동조합 홈으로 이동">
        <img class="site-logo__brand" src="/assets/images/smitu-logo-full.png?v=20260716-logo" alt="" aria-hidden="true" />
      </a>
      <nav class="site-nav" id="site-nav" aria-label="주요 메뉴">
        <ul class="site-nav__list">
          <?php foreach ($items as [$key, $label, $href]): ?>
            <li><a class="site-nav__link<?= active_class($active, $key) ?>" href="<?= e($href) ?>" data-section="<?= e($key) ?>"><?= e($label) ?></a></li>
          <?php endforeach; ?>
        </ul>
        <div class="site-auth-links" aria-label="회원 메뉴">
          <a class="site-auth-link<?= active_class($active, 'member') ?>" href="/login.php">로그인</a>
          <a class="site-auth-link<?= active_class($active, 'signup') ?>" href="/signup.php">회원가입</a>
        </div>
      </nav>
    </aside>
    <?php
}
