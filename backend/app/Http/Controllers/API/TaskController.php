<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::with(['pic', 'board', 'department', 'labels', 'checklists', 'comments.user', 'collaborators', 'histories.user']);

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

        $task = Task::create([
            'title' => $data['title'],
            'description' => $data['description'],
            'board_id' => $data['boardId'],
            'department_id' => $request->user()->department_id,
            'pic_id' => $data['picId'] ?? $request->user()->id,
            'priority' => $data['priority'] ?? 'low',
            'request_date' => $data['requestDate'] ?? null,
            'due_date' => $data['dueDate'] ?? null,
            'position' => Task::where('board_id', $data['boardId'])->max('position') + 1,
            'attachment' => $attachmentPath,
            'new_date' => now(),
            'column_id' => 'new',
        ]);

        if (isset($data['collaborator_ids']) && is_array($data['collaborator_ids'])) {
            $task->collaborators()->sync($data['collaborator_ids']);
        }

        $task->histories()->create([
            'user_id' => $request->user()->id,
            'action' => 'new'
        ]);

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

        $task->update($updateData);

        $task->histories()->create([
            'user_id' => $request->user()->id,
            'action' => $isCompleted ? 'selesai' : 'update'
        ]);

        return response()->json($task->fresh());
    }

    public function destroy($id)
    {
        Task::destroy($id);
        return response()->json(['message' => 'Task deleted']);
    }

    public function myJobs(Request $request)
    {
        $tasks = Task::with(['board'])->where('pic_id', $request->user()->id)->get();
        return response()->json($tasks);
    }
}
