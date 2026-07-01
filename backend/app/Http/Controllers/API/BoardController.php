<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Board;

class BoardController extends Controller
{
    public function index() {
        return response()->json(Board::with(['tasks', 'user'])->get());
    }

    public function store(Request $request) {
        $user = $request->user();
        $board = Board::create([
            'title' => $request->title,
            'description' => $request->description,
            'kpi_id' => $request->kpi_id ?? $request->kpiId,
            'user_id' => $user->id,
            'department_id' => $user->department_id,
        ]);
        return response()->json($board, 201);
    }

    public function show($id) {
        return response()->json(Board::with(['tasks', 'user'])->findOrFail($id));
    }

    public function update(Request $request, $id) {
        $model = Board::findOrFail($id);
        
        $data = [];
        if ($request->has('title')) $data['title'] = $request->title;
        if ($request->has('description')) $data['description'] = $request->description;
        if ($request->has('kpiId')) $data['kpi_id'] = $request->kpiId;
        
        $model->update($data);
        return response()->json($model);
    }

    public function destroy($id) {
        Board::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}
