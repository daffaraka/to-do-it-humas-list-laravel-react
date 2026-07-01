<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasUuids, Notifiable;

    protected $guarded = [];

    protected $hidden = [
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

    public function department() { return $this->belongsTo(Department::class); }
    public function role() { return $this->belongsTo(Role::class); }
    public function tasks() { return $this->hasMany(Task::class, 'pic_id'); }
    public function boards() { return $this->hasMany(Board::class); }
    public function kpis() { return $this->hasMany(Kpi::class); }
    public function comments() { return $this->hasMany(Comment::class); }
    public function notifications() { return $this->hasMany(Notification::class); }
}