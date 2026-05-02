<?php

declare(strict_types=1);

namespace App\Domain\Products;

final class ProductService
{
    public function __construct(private ProductRepository $repository)
    {
    }

    public function list(): array { return $this->repository->all(); }
    public function save(array $data): array { return $this->repository->upsert($data); }
    public function replace(array $data): void { $this->repository->replaceAll($data); }
    public function delete(string $id): void { $this->repository->delete($id); }
}
