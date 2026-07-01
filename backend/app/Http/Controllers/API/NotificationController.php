<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notification;

class NotificationController extends Controller
{
    public function index() {
        return response()->json(Notification::all());
    }

    public function store(Request $request) {
        return response()->json(Notification::create($request->all()), 201);
    }

    public function show($id) {
        return response()->json(Notification::findOrFail($id));
    }

    public function update(Request $request, $id) {
        $model = Notification::findOrFail($id);
        $model->update($request->all());
        return response()->json($model);
    }

    public function destroy($id) {
        Notification::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}
