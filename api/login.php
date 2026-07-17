<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/http.php';
require_once __DIR__ . '/../includes/auth.php';

try {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        method_not_allowed();
    }

    $body = read_json_body();
    $identity = (string) ($body['identity'] ?? $body['email'] ?? '');
    $password = (string) ($body['password'] ?? '');
    $remember = (bool) ($body['remember'] ?? false);
    $user = verify_admin_credentials($identity, $password);

    if (!$user) {
        json_response(['error' => '아이디 또는 비밀번호가 올바르지 않습니다.'], 401);
    }

    login_admin($user, $remember);
    json_response(['ok' => true, 'user' => public_user($user)]);
} catch (Throwable $error) {
    handle_api_error($error);
}
