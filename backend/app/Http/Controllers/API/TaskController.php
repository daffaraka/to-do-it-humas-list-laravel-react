<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        if ($request->has('start_date') && $request->has('end_date')) {
            // Lightweight eager loading for Calendar — only columns needed by frontend
            $query = Task::without(['taskWeight'])
                ->with(['pic:id,name', 'labels:id,name,color', 'collaborators:id,name', 'board:id,kpi_id'])
                ->select([
                    'id', 'title', 'pic_id', 'board_id', 'department_id',
                    'request_date', 'due_date', 'column_id', 'priority',
                    'position', 'created_at'
                ]);

            // Filter only by indexed date columns (due_date OR request_date)
            // Removed: orWhereBetween created_at — caused full table scan on unindexed column
            $query->where(function($q) use ($request) {
                $q->whereBetween('due_date', [$request->start_date, $request->end_date])
                  ->orWhereBetween('request_date', [$request->start_date, $request->end_date]);
            });
        } else {
            // Full eager loading for Kanban boards (taskWeight now explicit since removed from $with)
            $query = Task::with(['pic', 'board', 'department', 'labels', 'checklists', 'comments.user', 'collaborators', 'histories.user', 'taskWeight']);
        }

        if ($request->boardId) {
            $query->where('board_id', $request->boardId);
        }

        return response()->json($query->orderBy('position')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required',
            'description' => 'required',
            'boardId' => 'required',
            'departmentId' => 'nullable',
            'picId' => 'nullable',
            'priority' => 'nullable',
            'requestDate' => 'nullable',
            'dueDate' => 'nullable',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,doc,docx,xls,xlsx,ppt,pptx,pdf|max:10240',
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('attachments', 'public');
        }

        $task = DB::transaction(function () use ($data, $request, $attachmentPath) {
            $maxPosition = Task::where('board_id', $data['boardId'])->lockForUpdate()->max('position');

            $task = Task::create([
                'title' => $data['title'],
                'description' => $data['description'],
                'board_id' => $data['boardId'],
                'department_id' => $request->user()->department_id,
                'pic_id' => $data['picId'] ?? $request->user()->id,
                'priority' => $data['priority'] ?? 'low',
                'request_date' => $data['requestDate'] ?? null,
                'due_date' => $data['dueDate'] ?? null,
                'position' => $maxPosition + 1,
                'attachment' => $attachmentPath,
                'new_date' => now(),
                'column_id' => 'new',
            ]);

            if (isset($data['collaborator_ids']) && is_array($data['collaborator_ids'])) {
                $task->collaborators()->sync($data['collaborator_ids']);
            }

            if ($request->has('label_ids') && is_array($request->input('label_ids'))) {
                $currentLabels = $task->labels()->pluck('labels.id')->toArray();
                $newLabels = $request->input('label_ids');
                
                $toAttach = array_diff($newLabels, $currentLabels);
                $toDetach = array_diff($currentLabels, $newLabels);
                
                if (!empty($toDetach)) {
                    $task->labels()->detach($toDetach);
                }
                if (!empty($toAttach)) {
                    $attachData = [];
                    foreach ($toAttach as $labelId) {
                        $attachData[$labelId] = ['id' => (string) \Illuminate\Support\Str::uuid()];
                    }
                    $task->labels()->attach($attachData);
                }
            }

            $task->histories()->create([
                'user_id' => $request->user()->id,
                'action' => 'new'
            ]);

            return $task;
        });

        return response()->json($task, 201);
    }

    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        $data = $request->all();
        $updateData = [];
        if (isset($data['title'])) $updateData['title'] = $data['title'];
        if (isset($data['description'])) $updateData['description'] = $data['description'];

        $boardId = $data['board_id'] ?? $data['boardId'] ?? null;
        if ($boardId) $updateData['board_id'] = $boardId;

        if (isset($data['position'])) $updateData['position'] = $data['position'];

        if (array_key_exists('request_date', $data)) $updateData['request_date'] = $data['request_date'];
        if (array_key_exists('requestDate', $data)) $updateData['request_date'] = $data['requestDate'];

        if (array_key_exists('due_date', $data)) $updateData['due_date'] = $data['due_date'];
        if (array_key_exists('dueDate', $data)) $updateData['due_date'] = $data['dueDate'];

        if (array_key_exists('priority', $data)) $updateData['priority'] = $data['priority'];

        if (array_key_exists('document_link', $data)) $updateData['document_link'] = $data['document_link'];
        if (array_key_exists('documentLink', $data)) $updateData['document_link'] = $data['documentLink'];

        if ($request->hasFile('attachment')) {
            $updateData['attachment'] = $request->file('attachment')->store('attachments', 'public');
        }

        $columnId = $data['column_id'] ?? $data['columnId'] ?? null;
        $isCompleted = false;
        if ($columnId && $columnId !== $task->column_id) {
            $updateData['column_id'] = $columnId;
            if ($columnId === 'new') {
                $updateData['new_date'] = now();
            } elseif ($columnId === 'progress') {
                $updateData['proses_date'] = now();
            } elseif ($columnId === 'done') {
                $updateData['end_date'] = now();
                $isCompleted = true;
            }
        }

        if (isset($data['collaborator_ids']) && is_array($data['collaborator_ids'])) {
            $task->collaborators()->sync($data['collaborator_ids']);
        }

        if ($request->has('label_ids') && is_array($request->input('label_ids'))) {
            $currentLabels = $task->labels()->pluck('labels.id')->toArray();
            $newLabels = $request->input('label_ids');
            
            $toAttach = array_diff($newLabels, $currentLabels);
            $toDetach = array_diff($currentLabels, $newLabels);
            
            if (!empty($toDetach)) {
                $task->labels()->detach($toDetach);
            }
            if (!empty($toAttach)) {
                $attachData = [];
                foreach ($toAttach as $labelId) {
                    $attachData[$labelId] = ['id' => (string) \Illuminate\Support\Str::uuid()];
                }
                $task->labels()->attach($attachData);
            }
        }

        $task->update($updateData);

        $task->histories()->create([
            'user_id' => $request->user()->id,
            'action' => $isCompleted ? 'selesai' : 'update'
        ]);

        return response()->json(['id' => $task->id, 'status' => 'success']);
    }

    public function destroy($id)
    {
        Task::destroy($id);
        return response()->json(['message' => 'Task deleted']);
    }

    public function myJobs(Request $request)
    {
        $tasks = Task::with(['board', 'taskWeight'])
            ->select(['id', 'title', 'pic_id', 'board_id', 'column_id', 'priority', 'due_date', 'request_date', 'created_at'])
            ->where('pic_id', $request->user()->id)
            ->where('column_id', '!=', 'done')
            ->get();
        return response()->json($tasks);
    }
}
