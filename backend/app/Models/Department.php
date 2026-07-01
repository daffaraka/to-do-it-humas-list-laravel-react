<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasUuids;

    protected $fillable = [
        'id', 'name'
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
    public function boards()
    {
        return $this->hasMany(Board::class);
    }
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
    public function kpis()
    {
        return $this->hasMany(Kpi::class);
    }
}
