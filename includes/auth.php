<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/http.php';

const REMEMBER_COOKIE = 'smitu_admin_remember';
const REMEMBER_LIFETIME = 2592000;
const LOGIN_LOCK_THRESHOLD = 5;
const LOGIN_LOCK_SECONDS = 600;

function is_https_request(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
}

function start_admin_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $config = app_config()['session'];
    session_name($config['name'] ?? 'smitu_admin_session');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => is_https_request(),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function ensure_bootstrap_admin(): void
{
    $config = app_config()['bootstrap_admin'] ?? [];
    $email = strtolower(trim((string) ($config['email'] ?? 'admin@example.com')));
    $password = (string) ($config['password'] ?? 'admin1234');
    $name = trim((string) ($config['name'] ?? '최고관리자'));

    if ($email === '' || $password === '') {
        return;
    }

    $pdo = db();
    $count = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();

    if ($count > 0) {
        return;
    }

    $stmt = $pdo->prepare(
        'INSERT INTO users
          (email, name, password_hash, role, is_active, force_password_change, failed_login_count, created_at, updated_at)
         VALUES
          (:email, :name, :password_hash, :role, 1, 1, 0, NOW(), NOW())'
    );
    $stmt->execute([
        ':email' => $email,
        ':name' => $name !== '' ? $name : $email,
        ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ':role' => 'owner',
    ]);
}

function find_user_by_email(string $email): ?array
{
    $stmt = db()->prepare('SELECT * FROM users WHERE email = :email AND is_active = 1 LIMIT 1');
    $stmt->execute([':email' => strtolower(trim($email))]);
    $user = $stmt->fetch();

    return $user ?: null;
}

function find_user_by_identity(string $identity): ?array
{
    $identity = trim($identity);
    if ($identity === '') {
        return null;
    }

    if (ctype_digit($identity)) {
        return find_user_by_id((int) $identity);
    }

    return find_user_by_email($identity);
}

function find_user_by_id(int $id): ?array
{
    $stmt = db()->prepare('SELECT * FROM users WHERE id = :id AND is_active = 1 LIMIT 1');
    $stmt->execute([':id' => $id]);
    $user = $stmt->fetch();

    return $user ?: null;
}

function user_is_locked(array $user): bool
{
    if (empty($user['locked_until'])) {
        return false;
    }

    return strtotime((string) $user['locked_until']) > time();
}

function record_failed_login(?array $user, string $identity): void
{
    if (!$user) {
        write_admin_log(null, 'login_failed', 'users', null, ['identity' => strtolower(trim($identity))]);
        return;
    }

    $failedCount = (int) ($user['failed_login_count'] ?? 0) + 1;
    $lockedUntil = $failedCount >= LOGIN_LOCK_THRESHOLD ? date('Y-m-d H:i:s', time() + LOGIN_LOCK_SECONDS) : null;

    $stmt = db()->prepare(
        'UPDATE users
         SET failed_login_count = :failed_login_count, locked_until = :locked_until, updated_at = NOW()
         WHERE id = :id'
    );
    $stmt->execute([
        ':failed_login_count' => $failedCount,
        ':locked_until' => $lockedUntil,
        ':id' => (int) $user['id'],
    ]);

    write_admin_log((int) $user['id'], 'login_failed', 'users', (string) $user['id'], [
        'identity' => strtolower(trim($identity)),
        'failedCount' => $failedCount,
        'lockedUntil' => $lockedUntil,
    ]);
}

function reset_failed_login(array $user): void
{
    $stmt = db()->prepare('UPDATE users SET failed_login_count = 0, locked_until = NULL WHERE id = :id');
    $stmt->execute([':id' => (int) $user['id']]);
}

function verify_admin_credentials(string $identity, string $password): ?array
{
    ensure_bootstrap_admin();
    $user = find_user_by_identity($identity);

    if ($user && user_is_locked($user)) {
        write_admin_log((int) $user['id'], 'login_locked', 'users', (string) $user['id']);
        return null;
    }

    if (!$user || !password_verify($password, $user['password_hash'])) {
        record_failed_login($user, $identity);
        return null;
    }

    reset_failed_login($user);

    return find_user_by_id((int) $user['id']);
}

function login_admin(array $user, bool $remember = false): void
{
    start_admin_session();
    session_regenerate_id(true);
    $_SESSION['admin_user_id'] = (int) $user['id'];
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    $_SESSION['last_activity'] = time();

    $stmt = db()->prepare('UPDATE users SET last_login_at = NOW(), last_login = NOW() WHERE id = :id');
    $stmt->execute([':id' => (int) $user['id']]);

    if ($remember) {
        issue_remember_cookie((int) $user['id']);
    } else {
        clear_remember_cookie((int) $user['id']);
    }

    write_admin_log((int) $user['id'], 'login', 'users', (string) $user['id'], ['remember' => $remember]);
}

function issue_remember_cookie(int $userId): void
{
    $token = bin2hex(random_bytes(32));
    $hash = hash('sha256', $token);
    $expiresAt = date('Y-m-d H:i:s', time() + REMEMBER_LIFETIME);

    $stmt = db()->prepare(
        'UPDATE users SET remember_token = :remember_token, remember_expires_at = :remember_expires_at WHERE id = :id'
    );
    $stmt->execute([
        ':remember_token' => $hash,
        ':remember_expires_at' => $expiresAt,
        ':id' => $userId,
    ]);

    setcookie(REMEMBER_COOKIE, $userId . ':' . $token, [
        'expires' => time() + REMEMBER_LIFETIME,
        'path' => '/',
        'secure' => is_https_request(),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function clear_remember_cookie(?int $userId = null): void
{
    if ($userId) {
        $stmt = db()->prepare('UPDATE users SET remember_token = NULL, remember_expires_at = NULL WHERE id = :id');
        $stmt->execute([':id' => $userId]);
    }

    setcookie(REMEMBER_COOKIE, '', [
        'expires' => time() - 3600,
        'path' => '/',
        'secure' => is_https_request(),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function login_from_remember_cookie(): ?array
{
    $cookie = (string) ($_COOKIE[REMEMBER_COOKIE] ?? '');
    if ($cookie === '' || !str_contains($cookie, ':')) {
        return null;
    }

    [$userId, $token] = explode(':', $cookie, 2);
    if (!ctype_digit($userId) || $token === '') {
        clear_remember_cookie();
        return null;
    }

    $user = find_user_by_id((int) $userId);
    if (!$user || empty($user['remember_token']) || empty($user['remember_expires_at'])) {
        clear_remember_cookie((int) $userId);
        return null;
    }

    if (strtotime((string) $user['remember_expires_at']) <= time()) {
        clear_remember_cookie((int) $userId);
        return null;
    }

    if (!hash_equals((string) $user['remember_token'], hash('sha256', $token))) {
        clear_remember_cookie((int) $userId);
        write_admin_log((int) $user['id'], 'remember_token_mismatch', 'users', (string) $user['id']);
        return null;
    }

    start_admin_session();
    session_regenerate_id(true);
    $_SESSION['admin_user_id'] = (int) $user['id'];
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    $_SESSION['last_activity'] = time();
    issue_remember_cookie((int) $user['id']);
    write_admin_log((int) $user['id'], 'remember_login', 'users', (string) $user['id']);

    return find_user_by_id((int) $user['id']);
}

function logout_admin(): void
{
    start_admin_session();
    $userId = (int) ($_SESSION['admin_user_id'] ?? 0);
    if ($userId > 0) {
        write_admin_log($userId, 'logout', 'users', (string) $userId);
        clear_remember_cookie($userId);
    } else {
        clear_remember_cookie();
    }

    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', $params['secure'], $params['httponly']);
    }

    session_destroy();
}

function current_admin(): ?array
{
    start_admin_session();
    $id = (int) ($_SESSION['admin_user_id'] ?? 0);

    if ($id <= 0) {
        return login_from_remember_cookie();
    }

    $timeout = (int) (app_config()['session']['timeout'] ?? app_config()['session']['lifetime'] ?? 28800);
    $lastActivity = (int) ($_SESSION['last_activity'] ?? time());
    if ($timeout > 0 && time() - $lastActivity > $timeout) {
        $_SESSION = [];
        return login_from_remember_cookie();
    }

    $_SESSION['last_activity'] = time();

    return find_user_by_id($id);
}

function require_admin(): array
{
    $user = current_admin();

    if (!$user) {
        throw new RuntimeException('로그인이 필요합니다.', 401);
    }

    return $user;
}

function require_password_ready(): array
{
    $user = require_admin();

    if (!empty($user['force_password_change'])) {
        throw new RuntimeException('비밀번호 변경 후 관리자 기능을 사용할 수 있습니다.', 403);
    }

    return $user;
}

function require_owner_or_self(?int $targetUserId = null): array
{
    $user = require_admin();
    if (($user['role'] ?? '') === 'owner' || ($targetUserId && (int) $user['id'] === $targetUserId)) {
        return $user;
    }

    throw new RuntimeException('권한이 없습니다.', 403);
}

function csrf_token(): string
{
    start_admin_session();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return (string) $_SESSION['csrf_token'];
}

function require_csrf(): void
{
    start_admin_session();
    $headerToken = (string) ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    $bodyToken = '';

    if ($headerToken === '' && isset($_POST['_csrf'])) {
        $bodyToken = (string) $_POST['_csrf'];
    }

    $token = $headerToken !== '' ? $headerToken : $bodyToken;
    if ($token === '' || !hash_equals(csrf_token(), $token)) {
        throw new RuntimeException('보안 토큰이 올바르지 않습니다. 새로고침 후 다시 시도해 주세요.', 403);
    }
}

function public_user(array $user): array
{
    return [
        'id' => (string) $user['id'],
        'email' => $user['email'],
        'name' => $user['name'] ?: $user['email'],
        'profile' => $user['profile'] ?? '',
        'role' => $user['role'] ?: 'admin',
        'isActive' => (bool) ($user['is_active'] ?? true),
        'forcePasswordChange' => (bool) ($user['force_password_change'] ?? false),
        'lastLoginAt' => $user['last_login_at'] ?? ($user['last_login'] ?? ''),
        'createdAt' => $user['created_at'] ?? '',
        'source' => 'mysql',
    ];
}

function write_admin_log(?int $userId, string $action, string $targetType = '', ?string $targetId = null, array $meta = []): void
{
    try {
        $stmt = db()->prepare(
            'INSERT INTO admin_logs (user_id, action, target_type, target_id, ip_address, user_agent, meta, created_at)
             VALUES (:user_id, :action, :target_type, :target_id, :ip_address, :user_agent, :meta, NOW())'
        );
        $stmt->execute([
            ':user_id' => $userId,
            ':action' => $action,
            ':target_type' => $targetType,
            ':target_id' => $targetId,
            ':ip_address' => substr((string) ($_SERVER['REMOTE_ADDR'] ?? ''), 0, 45),
            ':user_agent' => substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255),
            ':meta' => $meta ? json_encode($meta, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null,
        ]);
    } catch (Throwable $error) {
        error_log('admin log failed: ' . $error->getMessage());
    }
}
