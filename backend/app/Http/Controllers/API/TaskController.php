<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Task;

class TaskController extends Controller
{
    public function index(Request $request) {
        $query = Task::with(['pic', 'board', 'department', 'labels', 'checklists', 'comments.user']);
        
        if ($request->boardId) {
            $query->where('board_id', $request->boardId);
        }
        
        return response()->json($query->orderBy('position')->get());
    }

    public function store(Request $request) {
        $data = $request->validate([
            'title' => 'required',
            'description' => 'required',
            'boardId' => 'required',
            'departmentId' => 'required',
            'picId' => 'nullable',
            'priority' => 'nullable',
            'requestDate' => 'nullable',
            'dueDate' => 'nullable',
        ]);

        $task = Task::create([
            'title' => $data['title'],
            'description' => $data['description'],
            'board_id' => $data['boardId'],
            'department_id' => $data['departmentId'],
            'pic_id' => $data['picId'] ?? null,
            'priority' => $data['priority'] ?? 'low',
            'request_date' => $data['requestDate'] ?? null,
            'due_date' => $data['dueDate'] ?? null,
            'position' => Task::where('board_id', $data['boardId'])->max('position') + 1,
        ]);

        return response()->json($task, 201);
    }

    public function update(Request $request, $id) {
        $task = Task::findOrFail($id);
        
        $data = $request->all();
        $updateData = [];
        if(isset($data['title'])) $updateData['title'] = $data['title'];
        if(isset($data['description'])) $updateData['description'] = $data['description'];
        if(isset($data['boardId'])) $updateData['board_id'] = $data['boardId'];
        if(isset($data['columnId'])) $updateData['column_id'] = $data['columnId'];
        if(isset($data['position'])) $updateData['position'] = $data['position'];
        
        $task->update($updateData);

        return response()->json($task);
    }

    public function destroy($id) {
        Task::destroy($id);
        return response()->json(['message' => 'Task deleted']);
    }

    public function myJobs(Request $request) {
        $tasks = Task::with(['board'])->where('pic_id', $request->user()->id)->get();
        return response()->json($tasks);
    }
}
