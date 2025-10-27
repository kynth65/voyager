<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@voyager.com',
            'password' => bcrypt('password'),
            'first_name' => 'Admin',
            'last_name' => 'User',
            'role' => 'super_admin',
            'status' => 'active',
        ]);

        // Create agent user
        User::create([
            'name' => 'Agent User',
            'email' => 'agent@voyager.com',
            'password' => bcrypt('password'),
            'first_name' => 'Agent',
            'last_name' => 'User',
            'role' => 'agent',
            'status' => 'active',
        ]);

        // Create customer user
        User::create([
            'name' => 'Customer User',
            'email' => 'customer@voyager.com',
            'password' => bcrypt('password'),
            'first_name' => 'Customer',
            'last_name' => 'User',
            'role' => 'customer',
            'status' => 'active',
        ]);
    }
}
