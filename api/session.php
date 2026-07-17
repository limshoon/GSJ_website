<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/http.php';
require_once __DIR__ . '/../includes/auth.php';

try {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
        method_not_allowed();
    }

    $user = current_admin();

    if (!$user) {
        json_response(['error' => '로그인이 필요합니다.'], 401);
    }

    json_response(['ok' => true, 'user' => public_user($user), 'csrfToken' => csrf_token()]);
} catch (Throwable $error) {
    handle_api_error($error);
}
