<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../includes/db.php';

try {
    $path = __DIR__ . '/../database/migration_members.sql';
    if (!is_readable($path)) {
        throw new RuntimeException('migration_members.sql is not readable.');
    }

    $sql = file_get_contents($path);
    if ($sql === false) {
        throw new RuntimeException('Failed to read migration_members.sql.');
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

    echo sprintf("Member migration complete. Executed statements: %d\n", $count);
} catch (Throwable $error) {
    fwrite(STDERR, sprintf(
        "Member migration failed: %s: %s\n",
        get_class($error),
        $error->getMessage()
    ));
    exit(1);
}
