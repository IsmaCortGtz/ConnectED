<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin;
use App\Http\Controllers\User;

Route::middleware('auth:sanctum')->group(function () {

    Route::get("/user", [AuthController::class, 'me']);
    
    /* Admin routes */
    Route::prefix('admin')->middleware('role:administrator')->group(function () {
        /* Users module */
        Route::get("/users", [Admin\Users::class, 'index']);
        Route::get("/users/{id}", [Admin\Users::class, 'show']);
        Route::post("/users", [Admin\Users::class, 'store']);
        Route::put("/users/{id}", [Admin\Users::class, 'update']);
        Route::delete("/users/{id}", [Admin\Users::class, 'destroy']);
        Route::patch("/users/{id}/restore", [Admin\Users::class, 'restore']);

        /* Courses module */
        Route::get("/courses/professors", [Admin\Professors::class, 'indexCourses']);
        Route::get("/courses", [Admin\Courses::class, 'index']);
        Route::get("/courses/{id}", [Admin\Courses::class, 'show']);
        Route::post("/courses", [Admin\Courses::class, 'store']);
        Route::put("/courses/{id}", [Admin\Courses::class, 'update']);
        Route::delete("/courses/{id}", [Admin\Courses::class, 'destroy']);
        Route::patch("/courses/{id}/restore", [Admin\Courses::class, 'restore']);

        /* Lessons module */
        Route::get("/lessons/courses", [Admin\Courses::class, 'indexLessons']);
        Route::get("/lessons", [Admin\Lessons::class, 'index']);
        Route::get("/lessons/{id}", [Admin\Lessons::class, 'show']);
        Route::post("/lessons", [Admin\Lessons::class, 'store']);
        Route::put("/lessons/{id}", [Admin\Lessons::class, 'update']);
        Route::delete("/lessons/{id}", [Admin\Lessons::class, 'destroy']);
        Route::patch("/lessons/{id}/restore", [Admin\Lessons::class, 'restore']);
    });

    /* User routes */
    Route::prefix('user')->middleware('role:student')->group(function () {
        Route::get("/courses", [User\Courses::class, 'index']);
        Route::get("/courses/{id}", [User\Courses::class, 'show']);

        Route::post("/lessons/{lesson}/payment", [User\StripeController::class, 'init']);
    });
});