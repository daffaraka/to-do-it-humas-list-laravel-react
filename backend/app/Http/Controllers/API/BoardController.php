<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Board;

class BoardController extends Controller
{
    public function index() {
        return response()->json(Board::with(['tasks', 'user', 'kategoriProgram'])->get());
    }

    public function store(Request $request) {
        $user = $request->user();
        
        $startDate = $request->start_date ? \Carbon\Carbon::parse($request->start_date)->toFormattedDateString() : null;
        $targetDate = $request->target_date ? \Carbon\Carbon::parse($request->target_date)->toFormattedDateString() : null;

        $kpiId = $request->kpi_id ?? $request->kpiId;
        $departmentId = $user->department_id;

        if (!$kpiId && ($request->has('department_id') || $request->has('departmentId'))) {
            $departmentId = $request->department_id ?? $request->departmentId;
        }

        $board = Board::create([
            'title' => $request->title,
            'description' => $request->description,
            'kpi_id' => $kpiId,
            'user_id' => $user->id,
            'department_id' => $departmentId,
            'start_date' => $startDate,
            'target_date' => $targetDate,
            'kategori_program_id' => $request->kategori_program_id ?? $request->kategoriProgramId,
            'kondisi_aktual' => $request->kondisi_aktual,
            'target_akhir_tahun' => $request->target_akhir_tahun,
            'output_akhir' => $request->output_akhir,
            'prioritas' => $request->prioritas,
        ]);
        return response()->json($board, 201);
    }

    public function show($id) {
        return response()->json(Board::with(['tasks', 'user', 'kategoriProgram'])->findOrFail($id));
    }

    public function update(Request $request, $id) {
        $model = Board::findOrFail($id);
        
        $data = [];
        if ($request->has('title')) $data['title'] = $request->title;
        if ($request->has('description')) $data['description'] = $request->description;
        if ($request->has('kpi_id')) $data['kpi_id'] = $request->kpi_id;
        if ($request->has('kpiId')) $data['kpi_id'] = $request->kpiId; // Support both just in case
        
        if ($request->has('start_date')) $data['start_date'] = $request->start_date;
        if ($request->has('startDate')) $data['start_date'] = $request->startDate;
        
        if ($request->has('target_date')) $data['target_date'] = $request->target_date;
        if ($request->has('targetDate')) $data['target_date'] = $request->targetDate;
        
        if ($request->has('kategori_program_id')) $data['kategori_program_id'] = $request->kategori_program_id;
        if ($request->has('kategoriProgramId')) $data['kategori_program_id'] = $request->kategoriProgramId;

        if ($request->has('kondisi_aktual')) $data['kondisi_aktual'] = $request->kondisi_aktual;
        if ($request->has('target_akhir_tahun')) $data['target_akhir_tahun'] = $request->target_akhir_tahun;
        if ($request->has('output_akhir')) $data['output_akhir'] = $request->output_akhir;
        if ($request->has('prioritas')) $data['prioritas'] = $request->prioritas;

        $model->update($data);
        return response()->json($model);
    }

    public function destroy($id) {
        Board::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}
