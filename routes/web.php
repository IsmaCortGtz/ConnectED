<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\AuthController;

Route::get('/imprimir', [App\Http\Controllers\GeneradorController::class, 'imprimir'])->name('imprimir');

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::post('/logout', [AuthController::class, 'logout']);

Route::view('/{any}', 'app')->where('any', '.*');