<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Task;
use Carbon\Carbon;

class ExportController extends Controller
{
    /**
     * Get timeline data for all users (or selected user_ids) for spreadsheet export.
     */
    public function timelineData(Request $request)
    {
        $userIds = $request->input('user_ids');
        $includeEmpty = $request->boolean('include_empty', false);

        $query = User::with(['department:id,name', 'role:id,name'])
            ->withCount('tasks');

        if (!empty($userIds) && is_array($userIds)) {
            $query->whereIn('id', $userIds);
        } elseif (!$includeEmpty) {
            // By default, include all users who have tasks as PIC
            $query->has('tasks');
        }

        $users = $query->orderBy('name', 'asc')->get();

        $result = [];

        foreach ($users as $user) {
            $tasks = Task::with(['board:id,title,kpi_id', 'department:id,name'])
                ->where('pic_id', $user->id)
                ->get()
                ->map(function ($task) {
                    $reqDate = $task->request_date ? Carbon::parse($task->request_date) : null;
                    $dueDate = $task->due_date ? Carbon::parse($task->due_date) : null;

                    $durationDays = null;
                    if ($reqDate && $dueDate) {
                        $diff = abs((int) $dueDate->diffInDays($reqDate, false));
                        $durationDays = $diff === 0 ? 1 : $diff;
                    }

                    $statusHariIni = match (strtolower($task->column_id ?? '')) {
                        'done', 'selesai' => 'Done',
                        'progress', 'dalam proses' => 'Progress',
                        default => 'New',
                    };

                    $board = $task->board;
                    $boardTitle = $board?->title ?? '';
                    $isWig = (bool) $board?->kpi_id;
                    $projectType = $board ? ($isWig ? 'WIG' : 'Program Kerja') : null;
                    $keterangan = $boardTitle ? "{$projectType}: {$boardTitle}" : '-';

                    $reqFormatted = $reqDate ? $reqDate->format('Y-m-d') : null;
                    $dueFormatted = $dueDate ? $dueDate->format('Y-m-d') : null;

                    return [
                        'id' => $task->id,
                        'title' => trim($task->title),
                        'request_date' => $reqFormatted,
                        'requestDate' => $reqFormatted,
                        'due_date' => $dueFormatted,
                        'dueDate' => $dueFormatted,
                        'priority' => $task->priority,
                        'column_id' => $task->column_id,
                        'columnId' => $task->column_id,
                        'status_hari_ini' => $statusHariIni,
                        'statusHariIni' => $statusHariIni,
                        'status_label' => $statusHariIni,
                        'statusLabel' => $statusHariIni,
                        'board_title' => $boardTitle,
                        'boardTitle' => $boardTitle,
                        'is_wig' => $isWig,
                        'isWig' => $isWig,
                        'project_type' => $projectType ?? '-',
                        'projectType' => $projectType ?? '-',
                        'duration_days' => $durationDays,
                        'durationDays' => $durationDays,
                        'keterangan' => $keterangan,
                        'program' => $keterangan,
                    ];
                })
                ->sort(function ($a, $b) {
                    $progA = $a['program'] ?? '-';
                    $progB = $b['program'] ?? '-';

                    if ($progA === '-' && $progB !== '-') return 1;
                    if ($progA !== '-' && $progB === '-') return -1;

                    $isWigA = (bool) ($a['is_wig'] ?? false);
                    $isWigB = (bool) ($b['is_wig'] ?? false);
                    if ($isWigA !== $isWigB) {
                        return $isWigA ? -1 : 1;
                    }

                    $progCmp = strcasecmp($progA, $progB);
                    if ($progCmp !== 0) return $progCmp;

                    $reqA = $a['request_date'] ?? '9999-12-31';
                    $reqB = $b['request_date'] ?? '9999-12-31';
                    $reqCmp = strcmp($reqA, $reqB);
                    if ($reqCmp !== 0) return $reqCmp;

                    $dueA = $a['due_date'] ?? '9999-12-31';
                    $dueB = $b['due_date'] ?? '9999-12-31';
                    return strcmp($dueA, $dueB);
                })
                ->values();

            $result[] = [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'short_name' => explode(' ', $user->name)[0],
                    'shortName' => explode(' ', $user->name)[0],
                    'email' => $user->email,
                    'department' => $user->department?->name ?? '-',
                ],
                'total_tasks' => $tasks->count(),
                'totalTasks' => $tasks->count(),
                'tasks' => $tasks,
            ];
        }

        return response()->json([
            'status' => 'success',
            'generated_at' => now()->toIso8601String(),
            'total_users' => count($result),
            'data' => $result,
        ]);
    }

    /**
     * Get list of all users available for timeline export with task counts.
     */
    public function availableUsers()
    {
        $users = User::with('department:id,name')
            ->withCount('tasks')
            ->orderBy('name', 'asc')
            ->get()
            ->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'department' => $u->department?->name ?? '-',
                'tasks_count' => $u->tasks_count,
            ]);

        return response()->json([
            'status' => 'success',
            'data' => $users,
        ]);
    }
}
