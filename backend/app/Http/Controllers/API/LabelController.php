<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Label;
use Illuminate\Http\Request;

class LabelController extends Controller
{
    public function index()
    {
        return response()->json(Label::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:255',
        ]);

        $data['id'] = uniqid('l_'); // Create unique ID for label

        $label = Label::create($data);

        return response()->json($label, 201);
    }

    public function show($id)
    {
        $label = Label::findOrFail($id);
        return response()->json($label);
    }

    public function update(Request $request, $id)
    {
        $label = Label::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'color' => 'sometimes|required|string|max:255',
        ]);

        $label->update($data);

        return response()->json($label);
    }

    public function destroy($id)
    {
        Label::destroy($id);
        return response()->json(['message' => 'Label deleted']);
    }
}
