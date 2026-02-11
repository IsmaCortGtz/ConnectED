<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model {

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
