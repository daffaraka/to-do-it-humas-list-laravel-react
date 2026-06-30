<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasUuids, Notifiable;

    protected \ = [];

    protected \ = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function department() { return \->belongsTo(Department::class); }
    public function role() { return \->belongsTo(Role::class); }
    public function tasks() { return \->hasMany(Task::class, 'pic_id'); }
    public function boards() { return \->hasMany(Board::class); }
    public function kpis() { return \->hasMany(Kpi::class); }
    public function comments() { return \->hasMany(Comment::class); }
    public function notifications() { return \->hasMany(Notification::class); }
}