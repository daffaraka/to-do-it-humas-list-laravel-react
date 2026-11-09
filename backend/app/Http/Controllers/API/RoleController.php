<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Role;

class RoleController extends Controller
{
    public function index() {
        return response()->json(Role::with('viewDepartments:id,name')->get());
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'department_ids' => ['sometimes', 'array'],
            'department_ids.*' => ['uuid', 'exists:departments,id'],
        ]);
        $role = Role::create(['name' => $validated['name']]);
        $role->viewDepartments()->sync($validated['department_ids'] ?? []);
        return response()->json($role->load('viewDepartments:id,name'), 201);
    }

    public function show($id) {
        return response()->json(Role::with('viewDepartments:id,name')->findOrFail($id));
    }

    public function update(Request $request, $id) {
        $model = Role::findOrFail($id);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name,' . $model->id],
            'department_ids' => ['sometimes', 'array'],
            'department_ids.*' => ['uuid', 'exists:departments,id'],
        ]);
        $model->update(['name' => $validated['name']]);
        if (array_key_exists('department_ids', $validated)) {
            $model->viewDepartments()->sync($validated['department_ids']);
        }
        return response()->json($model->load('viewDepartments:id,name'));
    }

    public function destroy($id) {
        try {
            Role::destroy($id);
            return response()->json(['message' => 'Deleted']);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() === '23000') {
                return response()->json(['message' => 'Gagal menghapus: Jabatan ini sedang digunakan oleh Pengguna.'], 400);
            }
            return response()->json(['message' => 'Gagal menghapus data jabatan.'], 500);
        }
    }
}
