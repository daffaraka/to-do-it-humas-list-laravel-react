<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Board extends Model
{
    use HasUuids;

    protected $guarded = [];

    public function user() { return $this->belongsTo(User::class); }
    public function department() { return $this->belongsTo(Department::class); }
    public function kpi() { return $this->belongsTo(Kpi::class); }
    public function tasks() { return $this->hasMany(Task::class)->orderBy('position'); }
}