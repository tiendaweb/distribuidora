<?php

declare(strict_types=1);

namespace App\Domain\Products;

use PDO;

final class ProductRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function all(): array
    {
        $rows = $this->pdo->query('SELECT payload FROM products ORDER BY created_at DESC')->fetchAll();
        return array_values(array_map(fn(array $row) => json_decode($row['payload'] ?? '{}', true) ?: [], $rows));
    }

    public function find(string $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT payload FROM products WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ? (json_decode($row['payload'] ?? '{}', true) ?: []) : null;
    }

    public function upsert(array $product): array
    {
        $id = (string)($product['id'] ?? '');
        if ($id === '') {
            $id = bin2hex(random_bytes(8));
            $product['id'] = $id;
        }

        $stmt = $this->pdo->prepare(
            'INSERT INTO products (id, name, short, description, price, sale, cat, badge, img, cost, margin, stock, payload, updated_at)
            VALUES (:id, :name, :short, :description, :price, :sale, :cat, :badge, :img, :cost, :margin, :stock, :payload, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
            name=excluded.name, short=excluded.short, description=excluded.description, price=excluded.price, sale=excluded.sale,
            cat=excluded.cat, badge=excluded.badge, img=excluded.img, cost=excluded.cost, margin=excluded.margin, stock=excluded.stock,
            payload=excluded.payload, updated_at=CURRENT_TIMESTAMP'
        );

        $stmt->execute([
            ':id' => $id,
            ':name' => (string)($product['name'] ?? ''),
            ':short' => (string)($product['short'] ?? ''),
            ':description' => (string)($product['desc'] ?? ''),
            ':price' => (float)($product['price'] ?? 0),
            ':sale' => (float)($product['sale'] ?? 0),
            ':cat' => (string)($product['cat'] ?? 'all'),
            ':badge' => (string)($product['badge'] ?? ''),
            ':img' => (string)($product['img'] ?? ''),
            ':cost' => (float)($product['cost'] ?? 0),
            ':margin' => (float)($product['margin'] ?? 0),
            ':stock' => (int)($product['stock'] ?? 0),
            ':payload' => json_encode($product, JSON_UNESCAPED_UNICODE),
        ]);

        return $product;
    }

    public function replaceAll(array $products): void
    {
        $this->pdo->beginTransaction();
        $this->pdo->exec('DELETE FROM products');
        foreach ($products as $product) {
            $this->upsert($product);
        }
        $this->pdo->commit();
    }

    public function delete(string $id): void
    {
        $stmt = $this->pdo->prepare('DELETE FROM products WHERE id = :id');
        $stmt->execute([':id' => $id]);
    }
}
