<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasUuids;

    protected $guarded = [];

    protected $casts = [
        'request_date' => 'datetime',
        'due_date' => 'datetime',
    ];

    public function pic() { return $this->belongsTo(User::class, 'pic_id'); }
    public function board() { return $this->belongsTo(Board::class); }
    public function department() { return $this->belongsTo(Department::class); }
    public function checklists() { return $this->hasMany(Checklist::class); }
    public function labels() { return $this->hasMany(TaskLabel::class); }
    public function comments() { return $this->hasMany(Comment::class); }
}