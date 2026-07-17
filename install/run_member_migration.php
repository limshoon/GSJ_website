<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../includes/db.php';

$path = __DIR__ . '/../database/migration_members.sql';
if (!is_readable($path)) {
    fwrite(STDERR, "migration_members.sql is not readable.\n");
    exit(1);
}

$sql = file_get_contents($path);
if ($sql === false) {
    fwrite(STDERR, "Failed to read migration_members.sql.\n");
    exit(1);
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
