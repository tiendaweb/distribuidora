<?php

declare(strict_types=1);

namespace App\Domain\Images;

final class ImageService
{
    public function __construct(private ImageRepository $repository) {}

    public function all(): array
    {
        return $this->repository->all();
    }

    public function save(array $data): array
    {
        return $this->repository->save($data);
    }

    public function delete(int $id): ?string
    {
        return $this->repository->delete($id);
    }

    public function findById(int $id): array
    {
        return $this->repository->findById($id);
    }
}
