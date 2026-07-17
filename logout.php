<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/member_auth.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    try {
        require_member_csrf();
    } catch (Throwable $error) {
        redirect_to('/login.php');
    }

    logout_member();
    redirect_to('/login.php?logged_out=1');
}

redirect_to('/login.php');
