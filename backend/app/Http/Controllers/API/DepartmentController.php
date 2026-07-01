<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Department;

class DepartmentController extends Controller
{
    public function index() {
        return response()->json(Department::all());
    }

    public function store(Request $request) {
        return response()->json(Department::create($request->all()), 201);
    }

    public function show($id) {
        return response()->json(Department::findOrFail($id));
    }

    public function update(Request $request, $id) {
        $model = Department::findOrFail($id);
        $model->update($request->all());
        return response()->json($model);
    }

    public function destroy($id) {
        Department::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}
