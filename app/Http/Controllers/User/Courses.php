<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
                    'image' => $course->image ? url('storage/courses/' . $course->image) : null,
                    'rating' => $course->rating(),
                    'lessons_count' => $course->lessons_count,
                    'professor' => $course->professor->name . ' ' . $course->professor->last_name,
                ];
            });

        return response()->json($courses);    
    }

    public function show($id) {
        $course = Course::where('id', $id)
            ->with('professor')
            ->with(['lessons' => function($query) {
                $query->orderBy('date', 'desc');
            }])
            ->firstOrFail();

        return response()->json([
            'id' => $course->id,
            'title' => $course->title,
            'description' => $course->description,
            'image' => $course->image ? url('storage/courses/' . $course->image) : null,
            'rating' => $course->rating(),
            'lessons_count' => $course->lessons()->count(),
            'professor' => [
                'name' => $course->professor->name . ' ' . $course->professor->last_name,
                'image' => $course->professor->image ? url('storage/users/' . $course->professor->image) : null,
            ],
            'lessons' => $course->lessons,
        ]);
    }
}
