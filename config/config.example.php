<?php

return [
    'db' => [
        'host' => 'localhost',
        'name' => 'YOUR_DATABASE_NAME',
        'user' => 'YOUR_DATABASE_USER',
        'password' => 'YOUR_DATABASE_PASSWORD',
        'charset' => 'utf8mb4',
    ],

    'session' => [
        'name' => 'smitu_admin_session',
        'lifetime' => 28800,
        'timeout' => 28800,
    ],

    'uploads' => [
        'directory' => __DIR__ . '/../uploads',
        'url' => '/uploads',
        'max_size' => 10485760,
    ],

    'bootstrap_admin' => [
        'email' => 'admin@example.com',
        'password' => 'CHANGE_THIS_PASSWORD',
        'name' => '최고관리자',
    ],
];
