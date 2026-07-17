<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/http.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/content.php';

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        json_response(['contacts' => load_contacts()]);
    }

    if ($method === 'PUT') {
        $admin = require_password_ready();
        require_csrf();
        $body = read_json_body();
        $contacts = is_array($body['contacts'] ?? null) ? $body['contacts'] : [];
        sync_contacts($contacts);
        write_admin_log((int) $admin['id'], 'save_contacts', 'contacts');
        json_response(['ok' => true, 'contacts' => load_contacts()]);
    }

    method_not_allowed();
} catch (Throwable $error) {
    handle_api_error($error);
}
