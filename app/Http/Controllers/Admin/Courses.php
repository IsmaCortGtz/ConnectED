<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class Courses extends Controller {

    public function index(Request $request) {
        $perPage = $request->query('per_page', 10);
        $perPage = min($perPage, 100);

        $courses = Course::query()
            ->orderBy('created_at', 'asc')
            ->paginate($perPage);
        
        return response()->json($courses);
    }

    public function show($id) {
        $course = Course::find($id);
        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }
        return response()->json($course);
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

    public function update(Request $request, $id) {
        $course = Course::find($id);
        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255|min:3',
            'description' => 'sometimes|required|string',
            'professor_id' => 'sometimes|required|exists:users,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:4096',
        ]);

        if (isset($validated['title'])) {
            $course->title = $validated['title'];
        }
        if (isset($validated['description'])) {
            $course->description = $validated['description'];
        }
        if (isset($validated['professor_id'])) {
            $course->professor_id = $validated['professor_id'];
        }

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($course->image) {
                Storage::disk('public')->delete('courses/' . $course->image);
            }
            $file = $request->file('image');
            $filename = time() . '_' . $course->id . '.' . $file->getClientOriginalExtension();
            $request->file('image')->storeAs('courses', $filename, 'public');
            $course->image = $filename;
        }

        $course->save();
        return response()->json($course);
    }

    public function destroy($id) {
        $course = Course::find($id);
        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        $course->delete();
        return response()->json(['message' => 'Course deleted']);
    }
}
