<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Checklist extends Model
{
    use HasUuids;

    protected \ = [];

    protected \ = [
        'completed' => 'boolean',
    ];

    public function task() { return \->belongsTo(Task::class); }
}