<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AuthController extends Controller {

    public function login(Request $request) {
        $credenciales = $request->validate([
            "email" => "required|email|max:255|min:5",
            "password" => "required|min:8|max:255",
        ]);

        if (Auth::attempt($credenciales)) {
            $request->session()->regenerate();
            $user = [
                "id" => Auth::user()->id,
                "name" => Auth::user()->name,
                "last_name" => Auth::user()->last_name,
                "email" => Auth::user()->email,
                "role" => Auth::user()->role,
                "status" => Auth::user()->status,
            ];
            
            return response()->json([
                "message" => "Login successful",
                "user" => $user,
            ], 200);
        }

        return response()->json([
            "message" => "Wrong credentials",
        ], 401);
    }

    public function register(Request $request) {
        $userData = $request->validate([
            "name" => "required|string|max:255|min:2",
            "last_name" => "required|string|max:255|min:2",
            "email" => "required|email|max:255|min:5|unique:users,email",
            "password" => "required|min:8|max:255|confirmed",
        ]);

        $user = User::create($userData);
        $user->refresh();
        Auth::login($user);

        $request->session()->regenerate();
        $request->session()->regenerateToken();

        $res = [
            "id" => Auth::user()->id,
            "name" => Auth::user()->name,
            "last_name" => Auth::user()->last_name,
            "email" => Auth::user()->email,
            "role" => Auth::user()->role,
            "status" => Auth::user()->status,
        ];

        return response()->json([
            "message" => "Registration successful",
            "user" => $res,
        ], 201);
    }

    public function logout(Request $request) {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerate();
        $request->session()->regenerateToken();

        return response()->json([
            "message" => "Logout successful",
        ], 200);
    }
}
