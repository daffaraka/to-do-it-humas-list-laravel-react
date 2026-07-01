<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Role;

class RoleController extends Controller
{
    public function index() {
        return response()->json(Role::all());
    }

    public function store(Request $request) {
        return response()->json(Role::create($request->all()), 201);
    }

    public function show($id) {
        return response()->json(Role::findOrFail($id));
    }

    public function update(Request $request, $id) {
        $model = Role::findOrFail($id);
        $model->update($request->all());
        return response()->json($model);
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
