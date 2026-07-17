<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/functions.php';

const MEMBER_SESSION_NAME = 'smitu_member_session';
const MEMBER_SESSION_KEY = 'member_id';
const MEMBER_CSRF_KEY = 'member_csrf_token';
const MEMBER_LOGIN_LOCK_THRESHOLD = 5;
const MEMBER_LOGIN_LOCK_SECONDS = 600;

if (!function_exists('is_https_request')) {
    function is_https_request(): bool
    {
        return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    }
}

function start_member_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    session_name(MEMBER_SESSION_NAME);
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => is_https_request(),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function member_csrf_token(): string
{
    start_member_session();
    if (empty($_SESSION[MEMBER_CSRF_KEY])) {
        $_SESSION[MEMBER_CSRF_KEY] = bin2hex(random_bytes(32));
    }

    return (string) $_SESSION[MEMBER_CSRF_KEY];
}

function require_member_csrf(): void
{
    start_member_session();
    $token = (string) ($_POST['_csrf'] ?? '');
    if ($token === '' || !hash_equals(member_csrf_token(), $token)) {
        throw new RuntimeException('보안 토큰이 올바르지 않습니다. 새로고침 후 다시 시도해 주세요.');
    }
}

function normalize_member_email(string $email): string
{
    $email = strtolower(trim($email));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new RuntimeException('올바른 이메일을 입력해 주세요.');
    }

    return $email;
}

function normalize_member_password(string $password): string
{
    $password = trim($password);
    if (strlen($password) < 8) {
        throw new RuntimeException('비밀번호는 8자 이상 입력해 주세요.');
    }

    return $password;
}

function find_member_by_email(string $email): ?array
{
    $stmt = db()->prepare('SELECT * FROM members WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => strtolower(trim($email))]);
    $member = $stmt->fetch();

    return $member ?: null;
}

function find_member_by_id(int $id): ?array
{
    $stmt = db()->prepare('SELECT * FROM members WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $member = $stmt->fetch();

    return $member ?: null;
}

function member_is_locked(array $member): bool
{
    if (empty($member['locked_until'])) {
        return false;
    }

    return strtotime((string) $member['locked_until']) > time();
}

function record_member_failed_login(?array $member): void
{
    if (!$member) {
        return;
    }

    $failedCount = (int) ($member['failed_login_count'] ?? 0) + 1;
    $lockedUntil = $failedCount >= MEMBER_LOGIN_LOCK_THRESHOLD ? date('Y-m-d H:i:s', time() + MEMBER_LOGIN_LOCK_SECONDS) : null;

    $stmt = db()->prepare(
        'UPDATE members
         SET failed_login_count = :failed_login_count, locked_until = :locked_until, updated_at = NOW()
         WHERE id = :id'
    );
    $stmt->execute([
        ':failed_login_count' => $failedCount,
        ':locked_until' => $lockedUntil,
        ':id' => (int) $member['id'],
    ]);
}

function reset_member_failed_login(array $member): void
{
    $stmt = db()->prepare('UPDATE members SET failed_login_count = 0, locked_until = NULL WHERE id = :id');
    $stmt->execute([':id' => (int) $member['id']]);
}

function register_member(array $input): array
{
    $email = normalize_member_email((string) ($input['email'] ?? ''));
    $name = trim((string) ($input['name'] ?? ''));
    $password = normalize_member_password((string) ($input['password'] ?? ''));
    $passwordConfirm = (string) ($input['password_confirm'] ?? '');
    $phone = trim((string) ($input['phone'] ?? ''));
    $organization = trim((string) ($input['organization'] ?? ''));

    if ($name === '') {
        throw new RuntimeException('이름을 입력해 주세요.');
    }

    if ($password !== trim($passwordConfirm)) {
        throw new RuntimeException('비밀번호 확인이 일치하지 않습니다.');
    }

    if (find_member_by_email($email)) {
        throw new RuntimeException('이미 가입 신청된 이메일입니다. 로그인 또는 관리자 승인을 확인해 주세요.');
    }

    $stmt = db()->prepare(
        'INSERT INTO members
          (email, name, password_hash, phone, organization, status, failed_login_count, created_at, updated_at)
         VALUES
          (:email, :name, :password_hash, :phone, :organization, \'pending\', 0, NOW(), NOW())'
    );
    $stmt->execute([
        ':email' => $email,
        ':name' => $name,
        ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ':phone' => $phone,
        ':organization' => $organization,
    ]);

    return find_member_by_id((int) db()->lastInsertId()) ?: [];
}

function login_member(string $email, string $password): array
{
    $member = find_member_by_email($email);

    if ($member && member_is_locked($member)) {
        throw new RuntimeException('로그인 시도가 많아 잠시 잠겼습니다. 10분 뒤 다시 시도해 주세요.');
    }

    if (!$member || !password_verify($password, (string) $member['password_hash'])) {
        record_member_failed_login($member);
        throw new RuntimeException('이메일 또는 비밀번호를 확인해 주세요.');
    }

    $status = (string) ($member['status'] ?? 'pending');
    if ($status === 'pending') {
        throw new RuntimeException('가입 신청이 접수되어 관리자 승인을 기다리는 중입니다.');
    }
    if ($status === 'rejected') {
        throw new RuntimeException('가입 신청이 승인되지 않았습니다. 문의 메뉴를 통해 연락해 주세요.');
    }
    if ($status === 'suspended') {
        throw new RuntimeException('현재 이용이 중지된 계정입니다. 관리자에게 문의해 주세요.');
    }
    if ($status !== 'approved') {
        throw new RuntimeException('로그인할 수 없는 계정 상태입니다.');
    }

    reset_member_failed_login($member);
    start_member_session();
    session_regenerate_id(true);
    $_SESSION[MEMBER_SESSION_KEY] = (int) $member['id'];
    $_SESSION[MEMBER_CSRF_KEY] = bin2hex(random_bytes(32));

    $stmt = db()->prepare('UPDATE members SET last_login_at = NOW(), updated_at = NOW() WHERE id = :id');
    $stmt->execute([':id' => (int) $member['id']]);

    return find_member_by_id((int) $member['id']) ?: $member;
}

function current_member(): ?array
{
    start_member_session();
    $id = (int) ($_SESSION[MEMBER_SESSION_KEY] ?? 0);

    if ($id <= 0) {
        return null;
    }

    $member = find_member_by_id($id);
    if (!$member || ($member['status'] ?? '') !== 'approved') {
        unset($_SESSION[MEMBER_SESSION_KEY]);
        return null;
    }

    return $member;
}

function require_member(): array
{
    $member = current_member();

    if (!$member) {
        redirect_to('/login.php?next=' . rawurlencode($_SERVER['REQUEST_URI'] ?? '/mypage.php'));
    }

    return $member;
}

function logout_member(): void
{
    start_member_session();
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', $params['secure'], $params['httponly']);
    }

    session_destroy();
}

function public_member(array $member): array
{
    return [
        'id' => (string) $member['id'],
        'email' => $member['email'],
        'name' => $member['name'],
        'phone' => $member['phone'] ?? '',
        'organization' => $member['organization'] ?? '',
        'status' => $member['status'] ?? 'pending',
        'memo' => $member['memo'] ?? '',
        'approvedAt' => $member['approved_at'] ?? '',
        'lastLoginAt' => $member['last_login_at'] ?? '',
        'createdAt' => $member['created_at'] ?? '',
        'updatedAt' => $member['updated_at'] ?? '',
    ];
}

function safe_member_redirect(string $next, string $fallback = '/mypage.php'): string
{
    $next = trim($next);
    if ($next === '' || !str_starts_with($next, '/') || str_starts_with($next, '//')) {
        return $fallback;
    }

    if (preg_match('/[\r\n]/', $next)) {
        return $fallback;
    }

    return $next;
}
