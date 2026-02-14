<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Rating extends Model {
    use SoftDeletes;

    public function student() {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function lesson() {
        return $this->belongsTo(Lesson::class, 'lesson_id');
    }
}
