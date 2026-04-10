<?php

declare(strict_types=1);

namespace App\Infra;

use PDO;

final class MigrationRunner
{
    public static function migrate(PDO $pdo): void
    {
        $pdo->exec('CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)');

        $migrationDir = dirname(__DIR__) . '/migrations';
        $files = glob($migrationDir . '/*.sql') ?: [];
        sort($files);

        $existing = $pdo->query('SELECT name FROM _migrations')->fetchAll(PDO::FETCH_COLUMN);
        $applied = array_fill_keys($existing, true);

        foreach ($files as $file) {
            $name = basename($file);
            if (isset($applied[$name])) {
                continue;
            }

            $sql = file_get_contents($file);
            if ($sql === false) {
                continue;
            }

            $pdo->beginTransaction();
            try {
                $pdo->exec($sql);
                $stmt = $pdo->prepare('INSERT INTO _migrations(name, applied_at) VALUES(:name, :applied_at)');
                $stmt->execute([
                    ':name' => $name,
                    ':applied_at' => (new \DateTimeImmutable())->format(DATE_ATOM),
                ]);
                $pdo->commit();
            } catch (\Throwable $e) {
                $pdo->rollBack();
                throw $e;
            }
        }
    }
}
