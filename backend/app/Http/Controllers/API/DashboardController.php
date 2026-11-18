<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\Department;
use App\Models\Task;
use App\Models\User;
use App\Support\DepartmentVisibility;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Lightweight dataset for executive and workload dashboards.
     * The normal /tasks endpoint intentionally includes every task relation for Kanban,
     * which is unnecessary and expensive for summary screens.
     */
    public function summary(Request $request)
    {
        $user = $request->user();

        $tasks = DepartmentVisibility::apply(
            Task::query()->select([
                'id', 'title', 'pic_id', 'board_id', 'department_id',
                'column_id', 'due_date', 'created_at'
            ]),
            $user
        )->orderBy('due_date')->get();

        // Avoid Task's computed recurrence attributes on this compact response.
        $tasks->each(fn (Task $task) => $task->setAppends([]));

        $boards = DepartmentVisibility::apply(
            Board::query()->select(['id', 'title', 'department_id']),
            $user
        )->get();

        $departmentQuery = Department::query()->select(['id', 'name']);
        $visibleDepartmentIds = DepartmentVisibility::ids($user);
        if ($visibleDepartmentIds !== null) {
            $departmentQuery->whereIn('id', $visibleDepartmentIds);
        }
        $departments = $departmentQuery->get();

        $users = DepartmentVisibility::apply(
            User::query()->with('department:id,name')->select(['id', 'name', 'department_id']),
            $user
        )->get();

        return response()->json(compact('tasks', 'boards', 'departments', 'users'));
    }
}
