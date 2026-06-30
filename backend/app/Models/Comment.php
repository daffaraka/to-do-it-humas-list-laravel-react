<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasUuids;

    protected \ = [];

    public function task() { return \->belongsTo(Task::class); }
    public function user() { return \->belongsTo(User::class); }
}