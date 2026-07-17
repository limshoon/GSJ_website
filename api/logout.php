<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/http.php';
require_once __DIR__ . '/../includes/auth.php';

try {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        method_not_allowed();
    }

    require_admin();
    require_csrf();
    logout_admin();
    json_response(['ok' => true]);
} catch (Throwable $error) {
    handle_api_error($error);
}
