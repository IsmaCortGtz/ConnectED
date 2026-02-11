<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;

class Professors extends Controller {
    public function indexCourses(Request $request) {
        $professors = User::where('role', 'professor')->get(['id', 'name', 'last_name']);

        return response()->json($professors);
    }
}
