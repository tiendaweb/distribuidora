<?php

declare(strict_types=1);

namespace App\Domain\Images;

use PDO;

final class ImageRepository
{
    public function __construct(private PDO $pdo) {}

    public function all(): array
    {
        $stmt = $this->pdo->query('SELECT * FROM uploaded_images ORDER BY created_at DESC');
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return is_array($rows) ? array_map($this->hydrate(...), $rows) : [];
    }

    public function save(array $data): array
    {
        $id = $data['id'] ?? null;
        $filename = $data['filename'] ?? '';
        $url = $data['url'] ?? '';
        $originalName = $data['original_name'] ?? '';
        $size = $data['size'] ?? 0;
        $mimeType = $data['mime_type'] ?? '';

        if (!$id) {
            $stmt = $this->pdo->prepare(
                'INSERT INTO uploaded_images (filename, url, original_name, size, mime_type) VALUES (:filename, :url, :original_name, :size, :mime_type)'
            );
            $stmt->execute([
                ':filename' => $filename,
                ':url' => $url,
                ':original_name' => $originalName,
                ':size' => $size,
                ':mime_type' => $mimeType,
            ]);
            $id = $this->pdo->lastInsertId();
        } else {
            $stmt = $this->pdo->prepare(
                'UPDATE uploaded_images SET filename = :filename, url = :url, original_name = :original_name, size = :size, mime_type = :mime_type WHERE id = :id'
            );
            $stmt->execute([
                ':id' => $id,
                ':filename' => $filename,
                ':url' => $url,
                ':original_name' => $originalName,
                ':size' => $size,
                ':mime_type' => $mimeType,
            ]);
        }

        return $this->findById((int)$id);
    }

    public function findById(int $id): array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM uploaded_images WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $this->hydrate($row) : [];
    }

    public function delete(int $id): ?string
    {
        $image = $this->findById($id);
        if (!$image) {
            return null;
        }

        $stmt = $this->pdo->prepare('DELETE FROM uploaded_images WHERE id = :id');
        $stmt->execute([':id' => $id]);

        return $image['filename'] ?? null;
    }

    private function hydrate(array $row): array
    {
        return [
            'id' => (int)$row['id'],
            'filename' => $row['filename'] ?? '',
            'url' => $row['url'] ?? '',
            'original_name' => $row['original_name'] ?? '',
            'size' => (int)($row['size'] ?? 0),
            'mime_type' => $row['mime_type'] ?? '',
            'created_at' => $row['created_at'] ?? '',
        ];
    }
}
