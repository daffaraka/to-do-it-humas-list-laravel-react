<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Meeting extends Model
{
    protected $fillable = [
        'meeting_name',
        'meeting_description',
        'meeting_notes',
        'meeting_document',
        'meeting_date_start',
    ];

    protected $casts = [
        'meeting_date_start' => 'datetime',
    ];
}
