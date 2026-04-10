<?php
declare(strict_types=1);
namespace App\Domain\Users;
use PDO;

final class UserRepository
{
    public function __construct(private PDO $pdo) {}

    public function findByEmail(string $email): ?array {
        $st=$this->pdo->prepare('SELECT * FROM users WHERE email=:email LIMIT 1');
        $st->execute([':email'=>$email]);
        $row=$st->fetch();
        return $row ?: null;
    }

    public function create(string $email, string $passwordHash, string $name = 'Administrador'): int {
        $st=$this->pdo->prepare('INSERT INTO users(email,password_hash,name) VALUES(:email,:password_hash,:name)');
        $st->execute([':email'=>$email,':password_hash'=>$passwordHash,':name'=>$name]);
        return (int)$this->pdo->lastInsertId();
    }
}
