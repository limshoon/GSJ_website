<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../includes/db.php';

try {
    $count = 0;

    $count += execute_sql_file(__DIR__ . '/../database/schema.sql');
    sync_bootstrap_admin();
    $count += execute_sql_file(__DIR__ . '/../database/migration_members.sql');
    $count += execute_sql_file(__DIR__ . '/../database/migration_posters.sql');

    echo sprintf("Site migration complete. Executed statements: %d\n", $count);
} catch (Throwable $error) {
    fwrite(STDERR, sprintf(
        "Site migration failed: %s: %s\n",
        get_class($error),
        $error->getMessage()
    ));
    exit(1);
}

function execute_sql_file(string $path): int
{
    if (!is_readable($path)) {
        throw new RuntimeException(basename($path) . ' is not readable.');
    }

    $sql = file_get_contents($path);
    if ($sql === false) {
        throw new RuntimeException('Failed to read ' . basename($path) . '.');
    }

    $sql = preg_replace('/^\xEF\xBB\xBF/', '', $sql) ?? $sql;
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    $count = 0;

    foreach ($statements as $statement) {
        if ($statement === '') {
            continue;
        }

        db()->exec($statement);
        $count++;
    }

    return $count;
}

function sync_bootstrap_admin(): void
{
    $config = app_config()['bootstrap_admin'] ?? [];
    $email = strtolower(trim((string) ($config['email'] ?? 'admin@example.com')));
    $password = (string) ($config['password'] ?? '');
    $name = trim((string) ($config['name'] ?? '최고관리자'));

    if ($email === '' || $password === '') {
        return;
    }

    $stmt = db()->prepare('SELECT id, force_password_change FROM users WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    if (!$user) {
        $stmt = db()->prepare(
            'INSERT INTO users
              (email, name, password_hash, role, is_active, force_password_change, failed_login_count, created_at, updated_at)
             VALUES
              (:email, :name, :password_hash, \'owner\', 1, 1, 0, NOW(), NOW())'
        );
        $stmt->execute([
            ':email' => $email,
            ':name' => $name !== '' ? $name : '최고관리자',
            ':password_hash' => $passwordHash,
        ]);
        return;
    }

    if ((int) ($user['force_password_change'] ?? 0) !== 1) {
        return;
    }

    $stmt = db()->prepare(
        'UPDATE users
         SET password_hash = :password_hash,
             role = \'owner\',
             is_active = 1,
             name = CASE WHEN name = \'\' THEN :name ELSE name END,
             updated_at = NOW()
         WHERE id = :id'
    );
    $stmt->execute([
        ':password_hash' => $passwordHash,
        ':name' => $name !== '' ? $name : '최고관리자',
        ':id' => (int) $user['id'],
    ]);
}
