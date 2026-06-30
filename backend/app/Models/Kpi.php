<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Kpi extends Model
{
    use HasUuids;

    protected \ = [];
    
    protected \ = [
        'target_date' => 'datetime',
    ];

    public function department() { return \->belongsTo(Department::class); }
    public function user() { return \->belongsTo(User::class); }
    public function boards() { return \->hasMany(Board::class); }
}