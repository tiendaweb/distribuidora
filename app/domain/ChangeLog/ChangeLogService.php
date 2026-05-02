<?php

declare(strict_types=1);

namespace App\Domain\ChangeLog;

final class ChangeLogService
{
    public function __construct(private readonly ChangeLogRepository $repository) {}

    public function list(): array
    {
        return $this->repository->list();
    }

    public function replaceAll(array $entries): void
    {
        $this->repository->replaceAll($entries);
    }
}
