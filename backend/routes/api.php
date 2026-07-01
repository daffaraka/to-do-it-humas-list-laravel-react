<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\TaskController;
use App\Http\Controllers\API\BoardController;
use App\Http\Controllers\API\DepartmentController;
use App\Http\Controllers\API\RoleController;
use App\Http\Controllers\API\ChecklistController;
use App\Http\Controllers\API\TaskLabelController;
use App\Http\Controllers\API\CommentController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\KpiController;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'getMe']);
    
    Route::get('/tasks/my-jobs', [TaskController::class, 'myJobs']);
    Route::apiResource('tasks', TaskController::class);
    Route::apiResource('boards', BoardController::class);
    Route::apiResource('departments', DepartmentController::class);
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('checklists', ChecklistController::class);
    Route::apiResource('task-labels', TaskLabelController::class);
    Route::apiResource('comments', CommentController::class);
    Route::apiResource('notifications', NotificationController::class);
    Route::apiResource('kpis', KpiController::class);

    // Custom Routes for Frontend compatibility
    Route::get('/users', function () {
        return response()->json(\App\Models\User::with(['role', 'department'])->get());
    });

    Route::get('/tasks/{task}/comments', function ($taskId) {
        return response()->json(
            \App\Models\Comment::with('user')->where('task_id', $taskId)->latest()->get()
        );
    });

    Route::post('/tasks/{task}/comments', function (Request $request, $taskId) {
        $comment = \App\Models\Comment::create([
            'task_id' => $taskId,
            'user_id' => $request->user()->id,
            'text' => $request->text,
        ]);
        return response()->json($comment->load('user'), 201);
    });
});
