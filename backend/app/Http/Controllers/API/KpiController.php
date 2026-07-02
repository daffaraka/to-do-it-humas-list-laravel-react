<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Kpi;
use Carbon\Carbon;

class KpiController extends Controller
{
    public function index()
    {
        return response()->json(Kpi::with(['boards.tasks', 'boards.user', 'department'])->get());
    }

    public function store(Request $request)
    {

        $user = $request->user();

        $date = $request->target_date ? Carbon::parse($request->target_date)->toFormattedDateString() : null;
        $kpi = Kpi::create([
            'title' => $request->title,
            'description' => $request->description,
            'target_date' => $date,
            'department_id' => $request->filled('department_id') ? $request->department_id : $user->department_id,
            'user_id' => $user->id,
        ]);
        return response()->json($kpi, 201);
    }

    public function show($id)
    {
        return response()->json(Kpi::with(['boards.tasks', 'boards.user'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $model = Kpi::findOrFail($id);

        $data = [];
        if ($request->has('title')) $data['title'] = $request->title;
        if ($request->has('description')) $data['description'] = $request->description;
        if ($request->has('target_date')) $data['target_date'] = $request->target_date;
        if ($request->has('department_id')) $data['department_id'] = $request->department_id;

        $model->update($data);
        return response()->json($model);
    }

    public function destroy($id)
    {
        try {
            Kpi::destroy($id);
            return response()->json(['message' => 'Deleted']);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() === '23000') {
                return response()->json(['message' => 'Gagal menghapus: Main Project ini masih terkait dengan data lain.'], 400);
            }
            return response()->json(['message' => 'Gagal menghapus data Main Project.'], 500);
        }
    }
}
