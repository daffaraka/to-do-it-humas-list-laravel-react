<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;

use App\Models\TaskWeight;
use Illuminate\Http\Request;

class TaskWeightController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(TaskWeight::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(TaskWeight $taskWeight)
    {
        //
    }

    public function update(Request $request, $id)
    {
        $taskWeight = TaskWeight::findOrFail($id);
        $request->validate([
            'weight' => 'required|integer|min:1',
        ]);
        
        $taskWeight->update([
            'weight' => $request->weight,
        ]);

        return response()->json($taskWeight);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TaskWeight $taskWeight)
    {
        //
    }
}
