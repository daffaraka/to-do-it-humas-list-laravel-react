<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class DepartmentVisibility
{
    /**
     * Return null for unrestricted users, otherwise the department IDs visible to the user.
     */
    public static function ids(User $user): ?array
    {
        $user->loadMissing('role.viewDepartments');

        if (strtolower((string) $user->role?->name) === 'admin') {
            return null;
        }

        $ids = $user->role?->viewDepartments?->pluck('id')->all() ?? [];
        if (!$ids && $user->department_id) {
            $ids = [$user->department_id];
        }

        return $ids;
    }

    public static function apply(Builder $query, User $user, string $column = 'department_id'): Builder
    {
        $ids = self::ids($user);
        return $ids === null ? $query : $query->whereIn($column, $ids);
    }
}
