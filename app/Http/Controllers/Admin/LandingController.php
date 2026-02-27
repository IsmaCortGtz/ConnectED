<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LandingAsset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class LandingController extends Controller {
    public function index() {
        
        // List all images
        $images = LandingAsset::where('type', 'image')
            ->select('id', 'description')
            ->get()
            ->map(function ($asset) {
                return [
                    'url' => url('/landing/file/' . $asset->id),
                    'description' => $asset->description,
                ];
            });

        // Get the most recent video
        $video = LandingAsset::where('type', 'video')
            ->orderBy('created_at', 'desc')
            ->select('id', 'description')
            ->first();

        return response()->json([
            'images' => $images,
            'video' => [
                'url' => $video ? url('/landing/file/' . $video->id) : null,
                'description' => $video ? $video->description : null,
            ],
        ]);
    }

    public function get($id) {
        $asset = LandingAsset::findOrFail($id);

        if ($asset->type === 'image') {
            return response()->file(storage_path('app/images/' . $asset->url));
        } else if ($asset->type === 'video') {
            return response()->file(storage_path('app/images/' . $asset->url));
        }
    }

    public function store(Request $request) {
        $request->validate([
            'type' => 'required|in:image,video',
            'file' => 'required|file|mimes:jpg,jpeg,png,mp4,mov,avi|max:10240',
            'description' => 'nullable|string',
        ]);

        // Save in private storage
        $file = $request->file('file');
        $path = time() . '_' . uniqid() . '.' . $file->getClientOriginalName();
        
        Storage::disk('images')->put($path, File::get($file));

        $asset = LandingAsset::create([
            'type' => $request->type,
            'url' => $path,
            'description' => $request->description,
        ]);

        return response()->json($asset, 201);
    }
}
