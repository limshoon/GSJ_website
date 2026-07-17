<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/http.php';
require_once __DIR__ . '/../includes/auth.php';

function normalize_account_email(string $email): string
{
    $email = strtolower(trim($email));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new RuntimeException('올바른 이메일을 입력해 주세요.', 422);
    }

    return $email;
}

function assert_account_email_available(string $email, int $exceptId): void
{
    $stmt = db()->prepare('SELECT id FROM users WHERE email = :email AND id <> :id LIMIT 1');
    $stmt->execute([
        ':email' => $email,
        ':id' => $exceptId,
    ]);

    if ($stmt->fetch()) {
        throw new RuntimeException('이미 사용 중인 이메일입니다.', 409);
    }
}

function assert_new_password(string $password, string $confirmPassword): string
{
    $password = trim($password);
    if (strlen($password) < 8) {
        throw new RuntimeException('새 비밀번호는 8자 이상 입력해 주세요.', 422);
    }
    if ($password !== trim($confirmPassword)) {
        throw new RuntimeException('새 비밀번호 확인이 일치하지 않습니다.', 422);
    }

    return $password;
}

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $currentUser = require_admin();

    if ($method === 'GET') {
        json_response(['ok' => true, 'user' => public_user($currentUser)]);
    }

    if ($method !== 'PUT') {
        method_not_allowed();
    }

    require_csrf();
    $body = read_json_body();
    $action = (string) ($body['action'] ?? 'profile');

    if ($action === 'profile') {
        if (!empty($currentUser['force_password_change'])) {
            throw new RuntimeException('비밀번호 변경 후 계정 정보를 수정할 수 있습니다.', 403);
        }

        $email = normalize_account_email((string) ($body['email'] ?? $currentUser['email']));
        assert_account_email_available($email, (int) $currentUser['id']);
        $name = trim((string) ($body['name'] ?? $currentUser['name']));
        $profile = trim((string) ($body['profile'] ?? ($currentUser['profile'] ?? '')));

        if ($name === '') {
            $name = $email;
        }

        $stmt = db()->prepare(
            'UPDATE users
             SET email = :email, name = :name, profile = :profile, updated_at = NOW()
             WHERE id = :id'
        );
        $stmt->execute([
            ':email' => $email,
            ':name' => $name,
            ':profile' => $profile,
            ':id' => (int) $currentUser['id'],
        ]);

        $fresh = find_user_by_id((int) $currentUser['id']);
        write_admin_log((int) $currentUser['id'], 'update_account', 'users', (string) $currentUser['id']);
        json_response(['ok' => true, 'user' => public_user($fresh ?: $currentUser)]);
    }

    if ($action === 'password') {
        $currentPassword = (string) ($body['currentPassword'] ?? '');
        $newPassword = assert_new_password(
            (string) ($body['newPassword'] ?? ''),
            (string) ($body['confirmPassword'] ?? '')
        );

        if (!password_verify($currentPassword, (string) $currentUser['password_hash'])) {
            throw new RuntimeException('현재 비밀번호가 올바르지 않습니다.', 401);
        }

        $stmt = db()->prepare(
            'UPDATE users
             SET password_hash = :password_hash,
                 force_password_change = 0,
                 remember_token = NULL,
                 remember_expires_at = NULL,
                 updated_at = NOW()
             WHERE id = :id'
        );
        $stmt->execute([
            ':password_hash' => password_hash($newPassword, PASSWORD_DEFAULT),
            ':id' => (int) $currentUser['id'],
        ]);

        clear_remember_cookie((int) $currentUser['id']);
        $fresh = find_user_by_id((int) $currentUser['id']);
        write_admin_log((int) $currentUser['id'], 'change_password', 'users', (string) $currentUser['id']);
        json_response(['ok' => true, 'user' => public_user($fresh ?: $currentUser)]);
    }

    throw new RuntimeException('지원하지 않는 계정 작업입니다.', 400);
} catch (Throwable $error) {
    handle_api_error($error);
}
