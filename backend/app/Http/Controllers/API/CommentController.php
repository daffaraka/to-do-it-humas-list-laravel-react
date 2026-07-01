<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Comment;

class CommentController extends Controller
{
    public function index() {
        return response()->json(Comment::all());
    }

    public function store(Request $request) {
        return response()->json(Comment::create($request->all()), 201);
    }

    public function show($id) {
        return response()->json(Comment::findOrFail($id));
    }

    public function update(Request $request, $id) {
        $model = Comment::findOrFail($id);
        $model->update($request->all());
        return response()->json($model);
    }

    public function destroy($id) {
        Comment::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}
