<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\KategoriProgramKerja;
use Illuminate\Http\Request;

class KategoriProgramKerjaController extends Controller
{
    public function index()
    {
        return response()->json(KategoriProgramKerja::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $kategori = KategoriProgramKerja::create([
            'name' => $request->name,
        ]);

        return response()->json($kategori, 201);
    }

    public function show($id)
    {
        return response()->json(KategoriProgramKerja::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $kategori = KategoriProgramKerja::findOrFail($id);

        if ($request->has('name')) {
            $kategori->name = $request->name;
        }

        $kategori->save();

        return response()->json($kategori);
    }

    public function destroy($id)
    {
        try {
            KategoriProgramKerja::destroy($id);
            return response()->json(['message' => 'Deleted']);
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json(['message' => 'Gagal menghapus data Kategori Program Kerja.'], 500);
        }
    }
}
