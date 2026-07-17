<?php

declare(strict_types=1);

function e(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function active_class(string $current, string $target): string
{
    return $current === $target ? ' is-active' : '';
}

function redirect_to(string $path): never
{
    header('Location: ' . $path);
    exit;
}
