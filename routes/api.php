<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin;

Route::middleware('auth:sanctum')->group(function () {

    Route::get("/user", [AuthController::class, 'me']);
    
    /* Admin routes */
    Route::prefix('admin')->middleware('role:administrator')->group(function () {
        /* Users module */
        Route::get("/users", [Admin\Users::class, 'index']);
        Route::post("/users", [Admin\Users::class, 'store']);

        /* Courses module */
        Route::get("/courses", [Admin\Courses::class, 'index']);
        Route::post("/courses", [Admin\Courses::class, 'store']);
        Route::get("/professors", [Admin\Professors::class, 'indexCourses']);
    });

});