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
    $count += execute_sql_file(__DIR__ . '/../database/migration_members.sql');

    echo sprintf("Member migration complete. Executed statements: %d\n", $count);
} catch (Throwable $error) {
    fwrite(STDERR, sprintf(
        "Member migration failed: %s: %s\n",
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
