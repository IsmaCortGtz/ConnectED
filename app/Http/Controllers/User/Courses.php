<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;

class Courses extends Controller {
    public function index() {
    
        $courses = Course::where('status', 'active')
            ->with('professor')
            ->withCount('lessons')
            ->get()
            ->map(function ($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'image' => $course->image,
                    'rating' => $course->rating(),
                    'lessons_count' => $course->lessons_count,
                    'professor' => $course->professor->name . ' ' . $course->professor->last_name,
                ];
            });

        return response()->json($courses);    
    }
}
