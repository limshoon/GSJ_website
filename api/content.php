<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/http.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/content.php';

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        $includePrivate = current_admin() !== null;
        json_response(['content' => load_site_content($includePrivate)]);
    }

    if ($method === 'PUT') {
        $admin = require_password_ready();
        require_csrf();
        $body = read_json_body();
        $content = is_array($body['content'] ?? null) ? $body['content'] : [];
        $saved = save_site_content($content);
        write_admin_log((int) $admin['id'], 'save_content', 'content');
        json_response([
            'ok' => true,
            'content' => $saved,
        ]);
    }

    method_not_allowed();
} catch (Throwable $error) {
    handle_api_error($error);
}
