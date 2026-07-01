<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Checklist extends Model
{
    use HasUuids;

    protected $guarded = [];

    protected $casts = [
        'completed' => 'boolean',
    ];

    public function task() { return $this->belongsTo(Task::class); }
}