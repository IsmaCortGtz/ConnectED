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
                    'id' => $asset->id,
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
                'id' => $video ? $video->id : null,
                'description' => $video ? $video->description : null,
            ],
        ]);
    }

    public function get($id) {
        $asset = LandingAsset::findOrFail($id);
        $disk = $asset->type === 'image' ? 'images' : 'videos';

        if (!Storage::disk($disk)->exists($asset->url)) {
            return response()->json(['message' => 'File not found'], 404);    
        }

        $file = Storage::disk($disk)->get($asset->url);
        $mimeType = File::mimeType(Storage::disk($disk)->path($asset->url));

        return response($file, 200)->header('Content-Type', $mimeType);
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
        $disk = $request->type === 'image' ? 'images' : 'videos';

        Storage::disk($disk)->put($path, File::get($file));

        $asset = LandingAsset::create([
            'type' => $request->type,
            'url' => $path,
            'description' => $request->description,
        ]);

        return response()->json($asset, 201);
    }

    public function destroy($id) {
        $asset = LandingAsset::findOrFail($id);

        // Delete the file from storage
        if ($asset->type === 'image') {
            Storage::disk('images')->delete($asset->url);
        } else if ($asset->type === 'video') {
            Storage::disk('videos')->delete($asset->url);
        }

        // Delete the database record
        $asset->delete();

        return response()->json(['message' => 'Asset deleted successfully']);
    }
}
