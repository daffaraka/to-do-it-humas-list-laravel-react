<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TaskLabel;

class TaskLabelController extends Controller
{
    public function index() {
        return response()->json(TaskLabel::all());
    }

    public function store(Request $request) {
        return response()->json(TaskLabel::create($request->all()), 201);
    }

    public function show($id) {
        return response()->json(TaskLabel::findOrFail($id));
    }

    public function update(Request $request, $id) {
        $model = TaskLabel::findOrFail($id);
        $model->update($request->all());
        return response()->json($model);
    }

    public function destroy($id) {
        TaskLabel::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}
