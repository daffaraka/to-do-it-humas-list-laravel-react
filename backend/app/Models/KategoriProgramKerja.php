<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class KategoriProgramKerja extends Model
{
    use HasUuids;

    protected $fillable = [
        'name'
    ];

    public function kpis()
    {
        return $this->hasMany(Kpi::class, 'kategori_program_id');
    }
}
