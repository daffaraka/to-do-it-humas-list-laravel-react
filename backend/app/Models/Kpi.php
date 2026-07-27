<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Kpi extends Model
{
    use HasUuids;

    protected $fillable = [
        'id',
        'title',
        'description',
        'department_id',
        'user_id',
        'target_date',
        'bobot_kpi'
    ];

    protected $casts = [
        'target_date' => 'date',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function boards()
    {
        return $this->hasMany(Board::class);
    }
}
