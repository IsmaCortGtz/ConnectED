<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

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
}
