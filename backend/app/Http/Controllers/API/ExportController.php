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
            $tasks = Task::with(['board:id,title', 'department:id,name'])
                ->where('pic_id', $user->id)
                ->orderByRaw('request_date IS NULL, request_date ASC')
                ->orderBy('created_at', 'ASC')
                ->get()
                ->map(function ($task) {
                    $reqDate = $task->request_date ? Carbon::parse($task->request_date) : null;
                    $dueDate = $task->due_date ? Carbon::parse($task->due_date) : null;

                    $durationDays = null;
                    if ($reqDate && $dueDate) {
                        $diff = $dueDate->diffInDays($reqDate);
                        $durationDays = $diff === 0 ? 1 : $diff;
                    }

                    $statusMap = [
                        'done' => 'Selesai',
                        'progress' => 'Dalam Proses',
                        'new' => 'Belum Dimulai',
                    ];

                    $statusLabel = $statusMap[$task->column_id] ?? ($task->column_id ?: '-');
                    $boardTitle = $task->board?->title ?? '';

                    $keterangan = $boardTitle 
                        ? "{$statusLabel} | Proyek: {$boardTitle}" 
                        : $statusLabel;

                    return [
                        'id' => $task->id,
                        'title' => trim($task->title),
                        'request_date' => $task->request_date ? $task->request_date->format('Y-m-d') : null,
                        'due_date' => $task->due_date ? $task->due_date->format('Y-m-d') : null,
                        'priority' => $task->priority,
                        'column_id' => $task->column_id,
                        'status_label' => $statusLabel,
                        'board_title' => $boardTitle,
                        'duration_days' => $durationDays,
                        'keterangan' => $keterangan,
                    ];
                });

            $result[] = [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'short_name' => explode(' ', $user->name)[0],
                    'email' => $user->email,
                    'department' => $user->department?->name ?? '-',
                ],
                'total_tasks' => $tasks->count(),
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
