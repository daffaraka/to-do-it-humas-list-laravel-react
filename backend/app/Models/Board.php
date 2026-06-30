<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Board extends Model
{
    use HasUuids;

    protected \ = [];

    public function user() { return \->belongsTo(User::class); }
    public function department() { return \->belongsTo(Department::class); }
    public function kpi() { return \->belongsTo(Kpi::class); }
    public function tasks() { return \->hasMany(Task::class)->orderBy('position'); }
}