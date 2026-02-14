<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model {
    use SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'image',
    ];

    public function professor() {
        return $this->belongsTo(User::class, 'professor_id');
    }

    public function lessons() {
        return $this->hasMany(Lesson::class, 'course_id');
    }
}
