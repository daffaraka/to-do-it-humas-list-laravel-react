<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Kpi;

class KpiController extends Controller
{
    public function index() {
        return response()->json(Kpi::with(['boards.tasks', 'boards.user'])->get());
    }

    public function store(Request $request) {
        $user = $request->user();
        $kpi = Kpi::create([
            'title' => $request->title,
            'description' => $request->description,
            'target_date' => $request->targetDate,
            'department_id' => $request->departmentId ?? $user->department_id,
            'user_id' => $user->id,
        ]);
        return response()->json($kpi, 201);
    }

    public function show($id) {
        return response()->json(Kpi::with(['boards.tasks', 'boards.user'])->findOrFail($id));
    }

    public function update(Request $request, $id) {
        $model = Kpi::findOrFail($id);
        
        $data = [];
        if ($request->has('title')) $data['title'] = $request->title;
        if ($request->has('description')) $data['description'] = $request->description;
        if ($request->has('targetDate')) $data['target_date'] = $request->targetDate;
        if ($request->has('departmentId')) $data['department_id'] = $request->departmentId;
        
        $model->update($data);
        return response()->json($model);
    }

    public function destroy($id) {
        Kpi::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}
