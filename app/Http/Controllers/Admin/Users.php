<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class Users extends Controller {

    public function index(Request $request) {
        $perPage = $request->query('per_page', 10);
        $perPage = min($perPage, 100);

        $users = User::query()
            ->orderBy('created_at', 'asc')
            ->paginate($perPage);
        
        return response()->json($users);
    }

    public function show($id) {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        return response()->json($user);
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|string|in:administrator,professor,student',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:4096',
        ]);

        $user = new User();
        $user->name = $validated['name'];
        $user->last_name = $validated['last_name'];
        $user->email = $validated['email'];
        $user->password = bcrypt($validated['password']);
        $user->role = $validated['role'];

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . $user->id . '.' . $file->getClientOriginalExtension();
            $request->file('image')->storeAs('avatars', $filename, 'public');
            $user->image = $filename;
        }

        $user->save();
        return response()->json($user, 201);
    }

    public function update(Request $request, $id) {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'sometimes|required|string|min:8|confirmed',
            'role' => 'sometimes|required|string|in:administrator,professor,student',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:4096',
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }
        if (isset($validated['last_name'])) {
            $user->last_name = $validated['last_name'];
        }
        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }
        if (isset($validated['password'])) {
            $user->password = bcrypt($validated['password']);
        }
        if (isset($validated['role'])) {
            $user->role = $validated['role'];
        }

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($user->image) {
                Storage::disk('public')->delete('avatars/' . $user->image);
            }
            $file = $request->file('image');
            $filename = time() . '_' . $user->id . '.' . $file->getClientOriginalExtension();
            $request->file('image')->storeAs('avatars', $filename, 'public');
            $user->image = $filename;
        }

        $user->save();
        return response()->json($user);
    }

    public function destroy($id) {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // No borro la imagen ya que al ser borrado logico,
        // el usuario podria ser restaurado y la imagen seguiria siendo necesaria

        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}
