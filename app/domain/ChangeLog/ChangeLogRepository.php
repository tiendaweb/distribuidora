<?php

declare(strict_types=1);

namespace App\Domain\ChangeLog;

use PDO;

final class ChangeLogRepository
{
    public function __construct(private readonly PDO $pdo) {}

    public function list(): array
    {
        $stmt = $this->pdo->query(
            'SELECT id, date, type, product_id, product_name, field, old_value, new_value, note, created_at
             FROM change_log
             ORDER BY date DESC
             LIMIT 500'
        );
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    public function replaceAll(array $entries): void
    {
        $this->pdo->beginTransaction();
        try {
            $this->pdo->exec('DELETE FROM change_log');

            if (!empty($entries)) {
                $stmt = $this->pdo->prepare(
                    'INSERT INTO change_log (id, date, type, product_id, product_name, field, old_value, new_value, note)
                     VALUES (:id, :date, :type, :product_id, :product_name, :field, :old_value, :new_value, :note)'
                );

                foreach (array_slice($entries, 0, 500) as $entry) {
                    $stmt->execute([
                        ':id'           => $entry['id'] ?? uniqid('log', true),
                        ':date'         => $entry['date'] ?? (new \DateTimeImmutable())->format(DATE_ATOM),
                        ':type'         => $entry['type'] ?? 'unknown',
                        ':product_id'   => $entry['productId'] ?? $entry['product_id'] ?? null,
                        ':product_name' => $entry['productName'] ?? $entry['product_name'] ?? null,
                        ':field'        => $entry['field'] ?? null,
                        ':old_value'    => $entry['oldValue'] ?? $entry['old_value'] ?? null,
                        ':new_value'    => $entry['newValue'] ?? $entry['new_value'] ?? null,
                        ':note'         => $entry['note'] ?? null,
                    ]);
                }
            }

            $this->pdo->commit();
        } catch (\Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
}
