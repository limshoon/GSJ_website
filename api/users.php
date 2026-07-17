<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/http.php';
require_once __DIR__ . '/../includes/auth.php';

function list_admin_users(): array
{
    $stmt = db()->query(
        'SELECT id, email, name, profile, role, is_active, force_password_change, last_login_at, last_login, created_at, updated_at
         FROM users
         WHERE is_active = 1
         ORDER BY CASE WHEN role = \'owner\' THEN 0 ELSE 1 END, id ASC'
    );

    return array_map(fn (array $user): array => public_user($user), $stmt->fetchAll());
}

function normalize_admin_email(string $email): string
{
    $email = strtolower(trim($email));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new RuntimeException('올바른 이메일을 입력해 주세요.', 422);
    }

    return $email;
}

function assert_admin_email_available(string $email, int $exceptId = 0): void
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

function normalize_admin_role(string $role, array $currentUser): string
{
    $role = $role === 'owner' ? 'owner' : 'admin';

    if ($role === 'owner' && ($currentUser['role'] ?? '') !== 'owner') {
        throw new RuntimeException('최고관리자 권한은 최고관리자만 부여할 수 있습니다.', 403);
    }

    return $role;
}

function require_valid_password(string $password): string
{
    $password = trim($password);
    if (strlen($password) < 8) {
        throw new RuntimeException('비밀번호는 8자 이상 입력해 주세요.', 422);
    }

    return $password;
}

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $currentUser = require_admin();

    if ($method === 'GET') {
        json_response(['users' => list_admin_users(), 'currentUser' => public_user($currentUser)]);
    }

    require_csrf();
    if (!empty($currentUser['force_password_change'])) {
        throw new RuntimeException('비밀번호 변경 후 관리자 계정을 관리할 수 있습니다.', 403);
    }
    $body = read_json_body();

    if ($method === 'POST') {
        $email = normalize_admin_email((string) ($body['email'] ?? ''));
        assert_admin_email_available($email);
        $name = trim((string) ($body['name'] ?? ''));
        $password = require_valid_password((string) ($body['password'] ?? ''));
        $role = normalize_admin_role((string) ($body['role'] ?? 'admin'), $currentUser);

        if ($name === '') {
            $name = $email;
        }

        $stmt = db()->prepare(
            'INSERT INTO users
              (email, name, profile, password_hash, role, is_active, force_password_change, failed_login_count, created_at, updated_at)
             VALUES
              (:email, :name, :profile, :password_hash, :role, 1, 1, 0, NOW(), NOW())'
        );
        $stmt->execute([
            ':email' => $email,
            ':name' => $name,
            ':profile' => trim((string) ($body['profile'] ?? '')),
            ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
            ':role' => $role,
        ]);

        $newId = (int) db()->lastInsertId();
        write_admin_log((int) $currentUser['id'], 'create_admin', 'users', (string) $newId, ['email' => $email, 'role' => $role]);
        json_response(['ok' => true, 'users' => list_admin_users()]);
    }

    if ($method === 'PUT') {
        $id = (int) ($body['id'] ?? 0);
        $target = $id > 0 ? find_user_by_id($id) : null;
        if (!$target) {
            throw new RuntimeException('관리자 계정을 찾을 수 없습니다.', 404);
        }

        $email = normalize_admin_email((string) ($body['email'] ?? $target['email']));
        assert_admin_email_available($email, $id);
        $name = trim((string) ($body['name'] ?? $target['name']));
        $profile = trim((string) ($body['profile'] ?? ($target['profile'] ?? '')));
        $role = normalize_admin_role((string) ($body['role'] ?? $target['role']), $currentUser);
        $isActive = isset($body['isActive']) ? (bool) $body['isActive'] : (bool) $target['is_active'];
        $forcePasswordChange = isset($body['forcePasswordChange'])
            ? (bool) $body['forcePasswordChange']
            : (bool) ($target['force_password_change'] ?? false);
        $password = trim((string) ($body['password'] ?? ''));

        if (($target['role'] ?? '') === 'owner') {
            $role = 'owner';
            $isActive = true;
        }

        if ($name === '') {
            $name = $email;
        }

        if ($password !== '') {
            require_valid_password($password);
            $stmt = db()->prepare(
                'UPDATE users
                 SET email = :email,
                     name = :name,
                     profile = :profile,
                     password_hash = :password_hash,
                     role = :role,
                     is_active = :is_active,
                     force_password_change = :force_password_change,
                     remember_token = NULL,
                     remember_expires_at = NULL,
                     updated_at = NOW()
                 WHERE id = :id'
            );
            $params = [
                ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
                ':force_password_change' => $forcePasswordChange ? 1 : 0,
            ];
        } else {
            $stmt = db()->prepare(
                'UPDATE users
                 SET email = :email,
                     name = :name,
                     profile = :profile,
                     role = :role,
                     is_active = :is_active,
                     force_password_change = :force_password_change,
                     updated_at = NOW()
                 WHERE id = :id'
            );
            $params = [
                ':force_password_change' => $forcePasswordChange ? 1 : 0,
            ];
        }

        $stmt->execute($params + [
            ':email' => $email,
            ':name' => $name,
            ':profile' => $profile,
            ':role' => $role,
            ':is_active' => $isActive ? 1 : 0,
            ':id' => $id,
        ]);

        write_admin_log((int) $currentUser['id'], 'update_admin', 'users', (string) $id, ['email' => $email, 'role' => $role]);
        $freshCurrentUser = find_user_by_id((int) $currentUser['id']) ?: $currentUser;
        json_response([
            'ok' => true,
            'users' => list_admin_users(),
            'currentUser' => public_user($freshCurrentUser),
        ]);
    }

    if ($method === 'DELETE') {
        $id = (int) ($body['id'] ?? 0);
        $target = $id > 0 ? find_user_by_id($id) : null;
        if (!$target) {
            throw new RuntimeException('관리자 계정을 찾을 수 없습니다.', 404);
        }
        if (($target['role'] ?? '') === 'owner') {
            throw new RuntimeException('최고관리자는 삭제할 수 없습니다.', 403);
        }
        if ((int) $target['id'] === (int) $currentUser['id']) {
            throw new RuntimeException('현재 로그인한 계정은 직접 삭제할 수 없습니다.', 403);
        }

        $stmt = db()->prepare(
            'UPDATE users
             SET is_active = 0,
                 remember_token = NULL,
                 remember_expires_at = NULL,
                 updated_at = NOW()
             WHERE id = :id'
        );
        $stmt->execute([':id' => $id]);

        write_admin_log((int) $currentUser['id'], 'delete_admin', 'users', (string) $id, ['email' => $target['email']]);
        json_response(['ok' => true, 'users' => list_admin_users()]);
    }

    method_not_allowed();
} catch (Throwable $error) {
    handle_api_error($error);
}
