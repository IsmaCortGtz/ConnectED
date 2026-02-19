<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf as PDF;

class PDFController extends Controller {
    public function generateUsersPDF() {
        $users = User::all();
        
        $pdf = Pdf::loadView('pdf.users', ['users' => $users])
            ->setPaper('a4', 'portrait')
            ->setOption('defaultFont', 'Arial');
        
        return $pdf->stream('users-report.pdf');
    }

    // For Courses PDF
    public function generateCoursesPDF() {
        $courses = Course::withCount('lessons')->get();

        $pdf = Pdf::loadView('pdf.courses', ['courses' => $courses])
            ->setPaper('a4', 'portrait')
            ->setOption('defaultFont', 'Arial');
        
        return $pdf->stream('courses-report.pdf');
    }

    // For Lessons PDF
    public function generateLessonsPDF() {
        $lessons = Lesson::with('course')->get();

        $pdf = Pdf::loadView('pdf.lessons', ['lessons' => $lessons])
            ->setPaper('a4', 'landscape')
            ->setOption('defaultFont', 'Arial');
        
        return $pdf->stream('lessons-report.pdf');
    }
}
