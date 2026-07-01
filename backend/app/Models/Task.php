<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasUuids;

    protected $fillable = [
        'id', 'title', 'description', 'document_link', 'pic_id', 'board_id', 'request_date', 'due_date', 'priority', 'column_id', 'department_id', 'position', 'attachment', 'new_date', 'proses_date', 'end_date'
    ];

    protected $casts = [
        'request_date' => 'date',
        'due_date' => 'date',
        'new_date' => 'date',
        'proses_date' => 'date',
        'end_date' => 'date',
    ];

    public function pic()
    {
        return $this->belongsTo(User::class, 'pic_id');
    }
    public function board()
    {
        return $this->belongsTo(Board::class);
    }
    public function department()
    {
        return $this->belongsTo(Department::class);
    }
    public function checklists()
    {
        return $this->hasMany(Checklist::class);
    }
    public function labels()
    {
        return $this->hasMany(TaskLabel::class);
    }
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
