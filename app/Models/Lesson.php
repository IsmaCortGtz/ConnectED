<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lesson extends Model {
    protected $fillable = [
        'key',
        'price',
        'discount',
        'date',
    ];

    public function course() {
        return $this->belongsTo(Course::class, 'course_id');
    }
}
