<?php

namespace Database\Seeders;

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

        User::factory(50)->create([
            'role' => 'student',
        ]);

        User::factory(50)->create([
            'role' => 'professor',
        ]);
    }
}
