<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Lessons extends Controller {

    public function index(Request $request) {
        $perPage = $request->query('per_page', 10);
        $perPage = min($perPage, 100);

        $lessons = Lesson::query()
            ->with(['course:id,title'])
            ->orderBy('created_at', 'asc')
            ->paginate($perPage)
            ->through(function ($lesson) {
                return [
                    'id' => $lesson->id,
                    'key' => $lesson->key,
                    'course' => $lesson->course->title ?? null,
                    'price' => $lesson->price,
                    'discount' => $lesson->discount,
                    'date' => $lesson->date,
                    'status' => $lesson->status,
                ];
            });
        
        return response()->json($lessons);
    }

    public function show($id) {
        $lesson = Lesson::find($id);
        if (!$lesson) {
            return response()->json(['message' => 'Lesson not found'], 404);
        }
        return response()->json($lesson);
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'price' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0|max:100',
            'date' => 'required|date',
        ]);

        $lesson = new Lesson();
        $lesson->key = Str::uuid()->toString();
        $lesson->course_id = $validated['course_id'];
        $lesson->price = $validated['price'];
        $lesson->discount = $validated['discount'];
        $lesson->date = $validated['date'];
        $lesson->status = "active";

        $lesson->save();
        return response()->json($lesson, 201);
    }

    public function update(Request $request, $id) {
        $lesson = Lesson::find($id);
        if (!$lesson) {
            return response()->json(['message' => 'Lesson not found'], 404);
        }

        $validated = $request->validate([

            'course_id' => 'sometimes|required|exists:courses,id',
            'price' => 'sometimes|required|numeric|min:0',
            'discount' => 'sometimes|nullable|numeric|min:0|max:100',
            'date' => 'sometimes|required|date',
        ]);

        if (isset($validated['course_id'])) {
            $lesson->course_id = $validated['course_id'];
        }
        if (isset($validated['price'])) {
            $lesson->price = $validated['price'];
        }
        if (isset($validated['discount'])) {
            $lesson->discount = $validated['discount'];
        }
        if (isset($validated['date'])) {
            $lesson->date = $validated['date'];
        }

        $lesson->save();
        return response()->json($lesson);
    }

    public function destroy($id) {
        $lesson = Lesson::find($id);
        if (!$lesson) {
            return response()->json(['message' => 'Lesson not found'], 404);
        }

        $lesson->delete();
        return response()->json(['message' => 'Lesson deleted']);
    }
}
