<?php

declare(strict_types=1);

namespace App\Domain\PriceLists;

final class PriceListService
{
    public function __construct(private PriceListRepository $repository) {}

    public function list(): array
    {
        return $this->repository->all();
    }

    public function save(array $data): array
    {
        return $this->repository->save($data);
    }

    public function delete(int $id): void
    {
        $this->repository->delete($id);
    }

    public function replaceAll(array $lists): void
    {
        $this->repository->replaceAll($lists);
    }
}
