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

        /* Courses module */
        Route::get("/courses", [Admin\Courses::class, 'index']);
        Route::get("/courses/{id}", [Admin\Courses::class, 'show']);
        Route::post("/courses", [Admin\Courses::class, 'store']);
        Route::put("/courses/{id}", [Admin\Courses::class, 'update']);
        Route::delete("/courses/{id}", [Admin\Courses::class, 'destroy']);
        Route::get("/professors", [Admin\Professors::class, 'indexCourses']);
    });

    /* User routes */
    Route::prefix('user')->middleware('role:student')->group(function () {
        Route::get("/courses", [User\Courses::class, 'index']);
        Route::get("/courses/{id}", [User\Courses::class, 'show']);
    });
});