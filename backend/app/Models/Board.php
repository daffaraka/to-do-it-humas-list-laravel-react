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

    public function getScoreAttribute()
    {
        // Only calculate score if tasks are already eager-loaded.
        // This prevents N+1 lazy-loading which caused 9.4 MB response on calendar.
        if (!$this->relationLoaded('tasks')) return 0;
        $tasks = $this->getRelation('tasks');
        if (!$tasks || $tasks->isEmpty()) return 0;

        $maxScore = 0;
        $completedScore = 0;


        foreach ($tasks as $task) {
            // Menggunakan langsung dari Task -> priority (hardcoded)
            $priority = strtolower(trim((string) ($task->priority ?: 'low')));
            $weight = match ($priority) {
                'medium' => 3,
                'high' => 5,
                default => 1,
            };

            $occurrenceCount = max(1, (int) ($task->recurrence_count ?? 1));
            $maxScore += $weight * $occurrenceCount;
            
            $completedOccurrences = $task->recurrence
                ? (int) ($task->done_recurrence_count ?? 0)
                : ($task->column_id === 'done' ? 1 : 0);
            $completedScore += $weight * $completedOccurrences;
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
