<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Lesson extends Model {
    use SoftDeletes;

    protected $fillable = [
        'key',
        'price',
        'discount',
        'date',
    ];

    public function course() {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function ratings() {
        return $this->hasMany(Rating::class, 'lesson_id');
    }

    public function purchases() {
        return $this->hasMany(Purchase::class, 'lesson_id');
    }

    public function rating() {
        return DB::table('ratings')
            ->join('lessons', 'ratings.lesson_id', '=', 'lessons.id')
            ->where('lessons.id', $this->id)
            ->avg('rate') ?: 0;
    }
}
