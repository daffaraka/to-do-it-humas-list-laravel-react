<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Board extends Model
{
    use HasUuids;

    protected $fillable = [
        'id',
        'title',
        'description',
        'user_id',
        'department_id',
        'kpi_id',
        'kategori_program_id',
        'start_date',
        'target_date',
        'kondisi_aktual',
        'target_akhir_tahun',
        'output_akhir',
        'prioritas',
        'bobot_board'
    ];

    protected $casts = [
        'start_date' => 'date',
        'target_date' => 'date',
    ];

    protected $appends = ['score'];

    public function getScoreAttribute()
    {
        // Prevent loading tasks if they are not already loaded to avoid N+1,
        // but since this is usually appended, it's safer to just check relationLoaded
        // Or we can just sum it if tasks are loaded. Let's just calculate it.
        $tasks = $this->tasks;
        if (!$tasks || $tasks->isEmpty()) return 0;

        $maxScore = 0;
        $completedScore = 0;


        foreach ($tasks as $task) {
            // Menggunakan langsung dari Task -> priority (hardcoded)
            $weight = 0;
            if ($task->priority === 'low') $weight = 1;
            elseif ($task->priority === 'medium') $weight = 3;
            elseif ($task->priority === 'high') $weight = 5;

            $maxScore += $weight;
            
            if ($task->column_id === 'done') {
                $completedScore += $weight;
            }
        }

        if ($maxScore == 0) return 0;

        $score = ($completedScore / $maxScore) * ($this->bobot_board ?? 0);
        return round($score, 2);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function department()
    {
        return $this->belongsTo(Department::class);
    }
    public function kpi()
    {
        return $this->belongsTo(Kpi::class);
    }
    public function tasks()
    {
        return $this->hasMany(Task::class)->orderBy('position');
    }
    public function kategoriProgram()
    {
        return $this->belongsTo(KategoriProgramKerja::class, 'kategori_program_id');
    }
}
