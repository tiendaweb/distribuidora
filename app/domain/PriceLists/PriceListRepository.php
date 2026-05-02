<?php

declare(strict_types=1);

namespace App\Domain\PriceLists;

use PDO;

final class PriceListRepository
{
    public function __construct(private PDO $pdo) {}

    /** @return array<int, array<string, mixed>> Lista de listas de precios hidratadas */
    public function all(): array
    {
        $stmt = $this->pdo->query('SELECT * FROM price_lists ORDER BY is_default DESC, created_at ASC');
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return is_array($rows) ? array_map($this->hydrate(...), $rows) : [];
    }

    /**
     * Inserta o actualiza una lista de precios.
     * Si is_default=true, desmarca como default a todas las demás.
     * @param array<string, mixed> $data Datos de la lista (id opcional para update)
     * @return array<string, mixed> Lista guardada y rehidratada
     */
    public function save(array $data): array
    {
        $id = $data['id'] ?? null;
        $name = $data['name'] ?? '';
        $description = $data['description'] ?? '';
        $factor = (float)($data['factor'] ?? 1.0);
        $isActive = $data['is_active'] ? 1 : 0;
        $isDefault = $data['is_default'] ? 1 : 0;
        $overrides = is_array($data['overrides'] ?? null) ? json_encode((object)$data['overrides'], JSON_UNESCAPED_UNICODE) : '{}';

        if ($isDefault) {
            $stmt = $this->pdo->prepare('UPDATE price_lists SET is_default = 0 WHERE id != :id');
            $stmt->execute([':id' => $id ?? 0]);
        }

        if (!$id) {
            $stmt = $this->pdo->prepare(
                'INSERT INTO price_lists (name, description, factor, is_active, is_default, overrides) VALUES (:name, :description, :factor, :is_active, :is_default, :overrides)'
            );
            $stmt->execute([
                ':name' => $name,
                ':description' => $description,
                ':factor' => $factor,
                ':is_active' => $isActive,
                ':is_default' => $isDefault,
                ':overrides' => $overrides,
            ]);
            $id = $this->pdo->lastInsertId();
        } else {
            $stmt = $this->pdo->prepare(
                'UPDATE price_lists SET name = :name, description = :description, factor = :factor, is_active = :is_active, is_default = :is_default, overrides = :overrides WHERE id = :id'
            );
            $stmt->execute([
                ':id' => $id,
                ':name' => $name,
                ':description' => $description,
                ':factor' => $factor,
                ':is_active' => $isActive,
                ':is_default' => $isDefault,
                ':overrides' => $overrides,
            ]);
        }

        return $this->findById((int)$id);
    }

    public function findById(int $id): array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM price_lists WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $this->hydrate($row) : [];
    }

    public function delete(int $id): void
    {
        $list = $this->findById($id);
        if (!$list || $list['is_default']) {
            return;
        }

        $stmt = $this->pdo->prepare('DELETE FROM price_lists WHERE id = :id');
        $stmt->execute([':id' => $id]);
    }

    public function replaceAll(array $lists): void
    {
        $this->pdo->exec('DELETE FROM price_lists');

        $stmt = $this->pdo->prepare(
            'INSERT INTO price_lists (id, name, description, factor, is_active, is_default, overrides) VALUES (:id, :name, :description, :factor, :is_active, :is_default, :overrides)'
        );

        foreach ($lists as $list) {
            $overrides = is_array($list['overrides'] ?? null) ? json_encode((object)$list['overrides'], JSON_UNESCAPED_UNICODE) : '{}';
            $stmt->execute([
                ':id' => $list['id'] ?? null,
                ':name' => $list['name'] ?? '',
                ':description' => $list['description'] ?? '',
                ':factor' => (float)($list['factor'] ?? 1.0),
                ':is_active' => $list['is_active'] ? 1 : 0,
                ':is_default' => $list['is_default'] ? 1 : 0,
                ':overrides' => $overrides,
            ]);
        }

        if (empty($lists)) {
            $this->pdo->exec("INSERT INTO price_lists (name, description, factor, is_active, is_default, overrides) VALUES ('Principal', 'Lista de precios estándar', 1.0, 1, 1, '{}')");
        }
    }

    private function hydrate(array $row): array
    {
        $overrides = json_decode($row['overrides'] ?? '{}', true);
        // Cast to object so json_encode produces {} for empty, not [] — JS arrays drop string keys on stringify
        return [
            'id' => (int)$row['id'],
            'name' => $row['name'] ?? '',
            'description' => $row['description'] ?? '',
            'factor' => (float)($row['factor'] ?? 1.0),
            'is_active' => (bool)$row['is_active'],
            'is_default' => (bool)$row['is_default'],
            'overrides' => (object)(is_array($overrides) ? $overrides : []),
            'created_at' => $row['created_at'] ?? '',
        ];
    }
}
