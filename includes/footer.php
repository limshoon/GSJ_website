<?php
declare(strict_types=1);

function render_footer(): void
{
    ?>
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
    <?php
}
