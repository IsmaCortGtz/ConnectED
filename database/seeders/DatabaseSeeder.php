<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void {

        User::factory()->create([
            'name' => 'Administrator 1',
            'last_name' => 'ConnectED',
            'email' => 'admin1@connected.com',
            'password' => bcrypt('password'),
            'role' => 'administrator',
        ]);

        User::factory(2)->create([
            'role' => 'student',
        ]);

        User::factory(2)->create([
            'role' => 'professor',
        ]);

        Course::create([
            'title' => 'Mathematics 101',
            'description' => 'An introductory course to Mathematics.',
            'professor_id' => User::where('role', 'professor')->first()->id,
        ]);

        Course::create([
            'title' => 'Physics 101',
            'description' => 'An introductory course to Physics.',
            'professor_id' => User::where('role', 'professor')->skip(1)->first()->id,
        ]);
    }
}
