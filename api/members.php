<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/http.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/member_auth.php';

function list_members(): array
{
    $stmt = db()->query(
        'SELECT id, email, name, phone, organization, status, memo, approved_at, last_login_at, created_at, updated_at
         FROM members
         ORDER BY CASE status
            WHEN \'pending\' THEN 0
            WHEN \'approved\' THEN 1
            WHEN \'rejected\' THEN 2
            ELSE 3
          END,
          created_at DESC,
          id DESC'
    );

    return array_map(fn (array $member): array => public_member($member), $stmt->fetchAll());
}

function normalize_member_status_for_admin(string $status): string
{
    $status = trim($status);
    $allowed = ['pending', 'approved', 'rejected', 'suspended'];

    if (!in_array($status, $allowed, true)) {
        throw new RuntimeException('회원 상태 값이 올바르지 않습니다.', 422);
    }

    return $status;
}

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $currentUser = require_admin();

    if ($method === 'GET') {
        json_response(['members' => list_members()]);
    }

    require_csrf();
    if (!empty($currentUser['force_password_change'])) {
        throw new RuntimeException('비밀번호 변경 후 회원을 관리할 수 있습니다.', 403);
    }

    $body = read_json_body();

    if ($method === 'PUT') {
        $id = (int) ($body['id'] ?? 0);
        $member = $id > 0 ? find_member_by_id($id) : null;

        if (!$member) {
            throw new RuntimeException('회원을 찾을 수 없습니다.', 404);
        }

        $status = normalize_member_status_for_admin((string) ($body['status'] ?? $member['status']));
        $memo = trim((string) ($body['memo'] ?? ($member['memo'] ?? '')));

        $stmt = db()->prepare(
            'UPDATE members
             SET status = :status,
                 memo = :memo,
                 approved_at = CASE
                   WHEN :status_for_approved_at = \'approved\' AND approved_at IS NULL THEN NOW()
                   WHEN :status_for_clear <> \'approved\' THEN NULL
                   ELSE approved_at
                 END,
                 approved_by = CASE
                   WHEN :status_for_approved_by = \'approved\' THEN :approved_by
                   ELSE NULL
                 END,
                 failed_login_count = CASE WHEN :status_for_unlock = \'approved\' THEN 0 ELSE failed_login_count END,
                 locked_until = CASE WHEN :status_for_unlock_null = \'approved\' THEN NULL ELSE locked_until END,
                 updated_at = NOW()
             WHERE id = :id'
        );
        $stmt->execute([
            ':status' => $status,
            ':memo' => $memo,
            ':status_for_approved_at' => $status,
            ':status_for_clear' => $status,
            ':status_for_approved_by' => $status,
            ':approved_by' => (int) $currentUser['id'],
            ':status_for_unlock' => $status,
            ':status_for_unlock_null' => $status,
            ':id' => $id,
        ]);

        write_admin_log((int) $currentUser['id'], 'update_member', 'members', (string) $id, [
            'email' => $member['email'],
            'status' => $status,
        ]);

        json_response(['ok' => true, 'members' => list_members()]);
    }

    method_not_allowed();
} catch (Throwable $error) {
    handle_api_error($error);
}
