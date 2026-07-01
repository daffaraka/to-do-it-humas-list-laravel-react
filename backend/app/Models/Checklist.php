<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Checklist extends Model
{
    use HasUuids;

    protected $fillable = [
        'id', 'task_id', 'text', 'completed'
    ];

    protected $casts = [
        'completed' => 'boolean',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}
