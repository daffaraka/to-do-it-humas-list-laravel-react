<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasUuids;

    protected \ = [];

    protected \ = [
        'request_date' => 'datetime',
        'due_date' => 'datetime',
    ];

    public function pic() { return \->belongsTo(User::class, 'pic_id'); }
    public function board() { return \->belongsTo(Board::class); }
    public function department() { return \->belongsTo(Department::class); }
    public function checklists() { return \->hasMany(Checklist::class); }
    public function labels() { return \->hasMany(TaskLabel::class); }
    public function comments() { return \->hasMany(Comment::class); }
}