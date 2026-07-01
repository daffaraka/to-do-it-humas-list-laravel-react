<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Checklist;

class ChecklistController extends Controller
{
    public function index() {
        return response()->json(Checklist::all());
    }

    public function store(Request $request) {
        return response()->json(Checklist::create($request->all()), 201);
    }

    public function show($id) {
        return response()->json(Checklist::findOrFail($id));
    }

    public function update(Request $request, $id) {
        $model = Checklist::findOrFail($id);
        $model->update($request->all());
        return response()->json($model);
    }

    public function destroy($id) {
        Checklist::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}
