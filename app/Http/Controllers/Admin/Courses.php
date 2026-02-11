<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;

class Courses extends Controller {

    public function index(Request $request) {
        $perPage = $request->query('per_page', 10);
        $perPage = min($perPage, 100);

        $courses = Course::query()
            ->orderBy('created_at', 'asc')
            ->paginate($perPage);
        
        return response()->json($courses);
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'title' => 'required|string|max:255|min:3',
            'description' => 'required|string',
            'professor_id' => 'required|exists:users,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:4096',
        ]);

        $course = new Course();
        $course->title = $validated['title'];
        $course->description = $validated['description'];
        $course->professor_id = $validated['professor_id'];

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . $course->id . '.' . $file->getClientOriginalExtension();
            $request->file('image')->storeAs('courses', $filename, 'public');
            $course->image = $filename;
        }

        $course->save();
        return response()->json($course, 201);
    }
}
