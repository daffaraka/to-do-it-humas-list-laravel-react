<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasUuids;

    protected $fillable = [
        'id',
        'title',
        'description',
        'document_link',
        'pic_id',
        'board_id',
        'request_date',
        'due_date',
        'recurrence',
        'recurrence_statuses',
        'priority',
        'column_id',
        'department_id',
        'position',
        'attachment',
        'new_date',
        'proses_date',
        'end_date'
    ];

    protected $casts = [
        'request_date' => 'date',
        'due_date' => 'date',
        'new_date' => 'datetime',
        'proses_date' => 'datetime',
        'end_date' => 'datetime',
        'recurrence_statuses' => 'array',
    ];

    protected $appends = ['recurrence_count', 'done_recurrence_count'];

    /**
     * Number of logical task occurrences represented by this task.
     * A recurring task remains one database row, but each occurrence counts
     * toward workload and KPI weight.
     */
    public function getRecurrenceCountAttribute(): int
    {
        if (!$this->recurrence || !$this->request_date) return 1;

        $start = Carbon::parse($this->request_date)->startOfDay();
        $end = $this->due_date
            ? Carbon::parse($this->due_date)->startOfDay()
            : null;

        // A recurring task with the same start/target date still gets a useful
        // schedule horizon instead of collapsing to a single occurrence.
        if (!$end || !$end->gt($start)) {
            $end = match ($this->recurrence) {
                'daily' => $start->copy()->addDays(29),
                'weekly' => $start->copy()->addWeeks(11),
                'monthly' => $start->copy()->addMonths(11),
                default => $start->copy(),
            };
        }

        if ($end->lt($start)) return 1;

        return match ($this->recurrence) {
            'daily' => $start->diffInDays($end) + 1,
            'weekly' => intdiv($start->diffInDays($end), 7) + 1,
            'monthly' => $this->countMonthlyOccurrences($start, $end),
            default => 1,
        };
    }

    private function countMonthlyOccurrences(Carbon $start, Carbon $end): int
    {
        $dayOfMonth = $start->day;
        $cursor = $start->copy()->startOfMonth();
        $count = 0;

        while ($cursor->lte($end)) {
            if ($dayOfMonth <= $cursor->daysInMonth) $count++;
            $cursor->addMonth();
        }

        return max(1, $count);
    }

    public function getDoneRecurrenceCountAttribute(): int
    {
        $occurrences = max(1, (int) $this->recurrence_count);
        $statuses = is_array($this->recurrence_statuses) ? $this->recurrence_statuses : [];

        if (!$statuses) return $this->column_id === 'done' ? $occurrences : 0;

        $explicitDone = collect($statuses)->filter(fn ($status) => $status === 'done')->count();
        $explicitCount = count($statuses);
        $missingCount = max(0, $occurrences - $explicitCount);

        return min($occurrences, $explicitDone + ($this->column_id === 'done' ? $missingCount : 0));
    }

    public function pic()
    {
        return $this->belongsTo(User::class, 'pic_id');
    }

    public function taskWeight()
    {
        return $this->belongsTo(TaskWeight::class, 'priority', 'level');
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
    public function collaborators()
    {
        return $this->belongsToMany(User::class);
    }
    public function histories()
    {
        return $this->hasMany(TaskUserHistory::class)->orderBy('created_at', 'desc');
    }
    public function labels()
    {
        return $this->belongsToMany(Label::class, 'task_labels', 'task_id', 'label_id');
    }
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
