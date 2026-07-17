<?php
require_once __DIR__ . '/../includes/board_api.php';

try {
    handle_board_api('resources');
} catch (Throwable $error) {
    handle_api_error($error);
}
