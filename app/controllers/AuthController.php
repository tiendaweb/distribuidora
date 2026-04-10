<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Domain\Users\UserRepository;

final class AuthController
{
    private const DEFAULT_EMAIL = 'admin@ladistribuidora.com';
    private const DEFAULT_PASSWORD = 'admin@ladistribuidora.com';

    public function __construct(private UserRepository $users)
    {
    }

    public function ensureDefaultUser(): void
    {
        $existing = $this->users->findByEmail(self::DEFAULT_EMAIL);
        if ($existing) {
            return;
        }

        $hash = password_hash(self::DEFAULT_PASSWORD, PASSWORD_DEFAULT);
        $this->users->create(self::DEFAULT_EMAIL, $hash, 'Administrador');
    }

    public function login(string $email, string $password): bool
    {
        $user = $this->users->findByEmail($email);
        if (!$user) {
            return false;
        }

        if (!password_verify($password, (string)($user['password_hash'] ?? ''))) {
            return false;
        }

        $_SESSION['user_id'] = (int)$user['id'];
        $_SESSION['user_email'] = (string)$user['email'];

        return true;
    }

    public function logout(): void
    {
        $_SESSION = [];
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_destroy();
        }
    }

    public function isAuthenticated(): bool
    {
        return !empty($_SESSION['user_id']);
    }
}
