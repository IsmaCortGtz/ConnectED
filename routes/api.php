<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/test', function (Request $request) {
        return response()->json(['message' => 'Authenticated access granted.']);
    });

    Route::get("/user", function (Request $request) {
        // wait 1 second to simulate delay only for this route (not sleep the whole app)
        usleep(1000000);
        
        return $request->user();
    });
});