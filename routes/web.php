<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\AuthController;

Route::get('/images', [App\Http\Controllers\Admin\LandingController::class, 'index']);

Route::get('/print/users', [App\Http\Controllers\Admin\PDFController::class, 'generateUsersPDF']);
Route::get('/print/courses', [App\Http\Controllers\Admin\PDFController::class, 'generateCoursesPDF']);
Route::get('/print/lessons', [App\Http\Controllers\Admin\PDFController::class, 'generateLessonsPDF']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::post('/logout', [AuthController::class, 'logout']);

Route::view('/{any}', 'app')->where('any', '.*');