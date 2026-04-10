<?php

declare(strict_types=1);

namespace App\Domain\Slides;

use PDO;

final class SlideRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function all(): array
    {
        $stmt = $this->pdo->query('SELECT id, image_url, title, sort_order, is_active, created_at FROM slides ORDER BY sort_order ASC, created_at DESC');
        $rows = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];

        return array_map([$this, 'hydrate'], $rows ?: []);
    }

    public function upsert(array $slide): array
    {
        $id = isset($slide['id']) && $slide['id'] !== '' ? (int)$slide['id'] : null;

        if ($id === null) {
            $stmt = $this->pdo->prepare('INSERT INTO slides (image_url, title, sort_order, is_active) VALUES (:image_url, :title, :sort_order, :is_active)');
            $stmt->execute([
                ':image_url' => trim((string)($slide['image_url'] ?? '')),
                ':title' => trim((string)($slide['title'] ?? '')),
                ':sort_order' => (int)($slide['sort_order'] ?? 0),
                ':is_active' => !empty($slide['is_active']) ? 1 : 0,
            ]);

            $id = (int)$this->pdo->lastInsertId();
        } else {
            $stmt = $this->pdo->prepare('UPDATE slides SET image_url = :image_url, title = :title, sort_order = :sort_order, is_active = :is_active WHERE id = :id');
            $stmt->execute([
                ':id' => $id,
                ':image_url' => trim((string)($slide['image_url'] ?? '')),
                ':title' => trim((string)($slide['title'] ?? '')),
                ':sort_order' => (int)($slide['sort_order'] ?? 0),
                ':is_active' => !empty($slide['is_active']) ? 1 : 0,
            ]);
        }

        $get = $this->pdo->prepare('SELECT id, image_url, title, sort_order, is_active, created_at FROM slides WHERE id = :id');
        $get->execute([':id' => $id]);
        $row = $get->fetch(PDO::FETCH_ASSOC);

        return $this->hydrate($row ?: []);
    }

    public function replaceAll(array $slides): void
    {
        $this->pdo->beginTransaction();
        $this->pdo->exec('DELETE FROM slides');
        foreach ($slides as $slide) {
            $this->upsert($slide);
        }
        $this->pdo->commit();
    }

    public function delete(int $id): void
    {
        $stmt = $this->pdo->prepare('DELETE FROM slides WHERE id = :id');
        $stmt->execute([':id' => $id]);
    }

    private function hydrate(array $row): array
    {
        return [
            'id' => (int)($row['id'] ?? 0),
            'image_url' => (string)($row['image_url'] ?? ''),
            'title' => (string)($row['title'] ?? ''),
            'sort_order' => (int)($row['sort_order'] ?? 0),
            'is_active' => (int)($row['is_active'] ?? 0),
            'created_at' => (string)($row['created_at'] ?? ''),
        ];
    }
}
