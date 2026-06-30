<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasUuids;

    protected \ = [];

    public function users() { return \->hasMany(User::class); }
    public function boards() { return \->hasMany(Board::class); }
    public function tasks() { return \->hasMany(Task::class); }
    public function kpis() { return \->hasMany(Kpi::class); }
}