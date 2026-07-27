<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Kpi;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;

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
            'bobot_kpi' => $request->has('bobot_kpi') ? $request->bobot_kpi : 100,
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
        if ($request->has('targetDate')) $data['target_date'] = $request->targetDate;

        if ($request->has('department_id')) $data['department_id'] = $request->department_id;
        if ($request->has('departmentId')) $data['department_id'] = $request->departmentId;

        if ($request->has('bobot_kpi')) $data['bobot_kpi'] = $request->bobot_kpi;

        $model->update($data);
        return response()->json($model);
    }

    public function destroy($id)
    {
        try {
            Kpi::destroy($id);
            return response()->json(['message' => 'Deleted']);
        } catch (QueryException $e) {
            if ($e->getCode() === '23000') {
                return response()->json(['message' => 'Gagal menghapus: Main Project ini masih terkait dengan data lain.'], 400);
            }
            return response()->json(['message' => 'Gagal menghapus data Main Project.'], 500);
        }
    }
}
