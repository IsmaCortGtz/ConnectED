<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Course extends Model {
    use SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'image',
    ];

    public function professor() {
        return $this->belongsTo(User::class, 'professor_id')->withTrashed();
    }

    public function lessons() {
        return $this->hasMany(Lesson::class, 'course_id');
    }

    public function rating() {
        return DB::table('ratings')
            ->join('lessons', 'ratings.lesson_id', '=', 'lessons.id')
            ->where('lessons.course_id', $this->id)
            ->avg('rate') ?: 0;
    }
}
