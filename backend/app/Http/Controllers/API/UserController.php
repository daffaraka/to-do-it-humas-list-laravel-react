<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index() {
        return response()->json(User::with(['role', 'department'])->get());
    }

    public function store(Request $request) {
        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'department_id' => 'required|exists:departments,id',
            'role_id' => 'required|exists:roles,id',
        ]);
        
        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);
        
        return response()->json($user->load(['role', 'department']), 201);
    }

    public function show($id) {
        return response()->json(User::with(['role', 'department'])->findOrFail($id));
    }

    public function update(Request $request, $id) {
        $user = User::findOrFail($id);
        
        $rules = [
            'name' => 'sometimes|string',
            'email' => 'sometimes|email|unique:users,email,'.$id,
            'department_id' => 'sometimes|exists:departments,id',
            'role_id' => 'sometimes|exists:roles,id',
        ];
        
        if ($request->filled('password')) {
            $rules['password'] = 'string|min:6';
        }
        
        $data = $request->validate($rules);
        
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }
        
        $user->update($data);
        return response()->json($user->load(['role', 'department']));
    }

    public function destroy($id) {
        try {
            User::destroy($id);
            return response()->json(['message' => 'Deleted']);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() === '23000') {
                return response()->json(['message' => 'Gagal menghapus: Pengguna ini masih terkait dengan data lain (Task, Project, dll).'], 400);
            }
            return response()->json(['message' => 'Gagal menghapus data pengguna.'], 500);
        }
    }
}
