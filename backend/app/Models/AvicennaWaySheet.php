<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AvicennaWaySheet extends Model
{
    use HasUuids;

    protected $fillable = ['user_id', 'category', 'columns', 'rows'];

    protected $casts = [
        'columns' => 'array',
        'rows' => 'array',
    ];
}
