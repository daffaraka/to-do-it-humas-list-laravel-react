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
        $query = Task::with(['pic', 'board', 'department', 'labels', 'checklists', 'comments.user']);

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
            'departmentId' => 'required',
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
            'department_id' => Auth::user()->id,
            'pic_id' => $data['picId'] ?? $request->user()->id,
            'priority' => $data['priority'] ?? 'low',
            'request_date' => $data['requestDate'] ?? null,
            'due_date' => $data['dueDate'] ?? null,
            'position' => Task::where('board_id', $data['boardId'])->max('position') + 1,
            'attachment' => $attachmentPath,
            'new_date' => now(),
            'column_id' => 'new',
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

        if ($request->hasFile('attachment')) {
            $updateData['attachment'] = $request->file('attachment')->store('attachments', 'public');
        }

        $columnId = $data['column_id'] ?? $data['columnId'] ?? null;
        if ($columnId && $columnId !== $task->column_id) {
            $updateData['column_id'] = $columnId;
            if ($columnId === 'new') {
                $updateData['new_date'] = now();
            } elseif ($columnId === 'progress') {
                $updateData['proses_date'] = now();
            } elseif ($columnId === 'done') {
                $updateData['end_date'] = now();
            }
        }

        $task->update($updateData);

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
