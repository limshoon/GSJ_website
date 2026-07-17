<?php
require_once __DIR__ . '/../includes/auth.php';

header('Location: ' . (current_admin() ? '/admin/dashboard.php' : '/admin/login.php'));
exit;
