<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Vessel;
use App\Models\Route;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create superadmin user
        User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@voyager.com',
            'password' => bcrypt('password'),
            'first_name' => 'Super',
            'last_name' => 'Admin',
            'role' => 'superadmin',
            'status' => 'active',
        ]);

        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@voyager.com',
            'password' => bcrypt('password'),
            'first_name' => 'Admin',
            'last_name' => 'User',
            'role' => 'admin',
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

        // Create sample vessels
        $ferry1 = Vessel::create([
            'name' => 'Ocean Star',
            'type' => 'ferry',
            'capacity' => 150,
            'description' => 'Large passenger ferry with comfortable seating and air conditioning.',
            'status' => 'active',
        ]);

        $ferry2 = Vessel::create([
            'name' => 'Island Hopper',
            'type' => 'ferry',
            'capacity' => 100,
            'description' => 'Medium-sized ferry perfect for island hopping tours.',
            'status' => 'active',
        ]);

        $speedboat1 = Vessel::create([
            'name' => 'Wave Rider',
            'type' => 'speedboat',
            'capacity' => 20,
            'description' => 'Fast speedboat for quick trips between islands.',
            'status' => 'active',
        ]);

        $speedboat2 = Vessel::create([
            'name' => 'Sea Breeze',
            'type' => 'speedboat',
            'capacity' => 25,
            'description' => 'Modern speedboat with premium amenities.',
            'status' => 'active',
        ]);

        // Create sample routes for ferries
        Route::create([
            'vessel_id' => $ferry1->id,
            'origin' => 'Manila',
            'destination' => 'Batangas',
            'price' => 500.00,
            'duration' => 120, // 2 hours in minutes
            'schedule' => [
                'days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                'departure_times' => ['08:00', '12:00', '16:00'],
            ],
            'status' => 'active',
        ]);

        Route::create([
            'vessel_id' => $ferry1->id,
            'origin' => 'Batangas',
            'destination' => 'Manila',
            'price' => 500.00,
            'duration' => 120,
            'schedule' => [
                'days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                'departure_times' => ['10:00', '14:00', '18:00'],
            ],
            'status' => 'active',
        ]);

        Route::create([
            'vessel_id' => $ferry2->id,
            'origin' => 'Cebu',
            'destination' => 'Bohol',
            'price' => 350.00,
            'duration' => 90,
            'schedule' => [
                'days' => ['Monday', 'Wednesday', 'Friday', 'Sunday'],
                'departure_times' => ['09:00', '15:00'],
            ],
            'status' => 'active',
        ]);

        Route::create([
            'vessel_id' => $ferry2->id,
            'origin' => 'Bohol',
            'destination' => 'Cebu',
            'price' => 350.00,
            'duration' => 90,
            'schedule' => [
                'days' => ['Tuesday', 'Thursday', 'Saturday', 'Sunday'],
                'departure_times' => ['11:00', '17:00'],
            ],
            'status' => 'active',
        ]);

        Route::create([
            'vessel_id' => $speedboat1->id,
            'origin' => 'Boracay',
            'destination' => 'Caticlan',
            'price' => 200.00,
            'duration' => 15,
            'schedule' => [
                'days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                'departure_times' => ['07:00', '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
            ],
            'status' => 'active',
        ]);

        Route::create([
            'vessel_id' => $speedboat1->id,
            'origin' => 'Caticlan',
            'destination' => 'Boracay',
            'price' => 200.00,
            'duration' => 15,
            'schedule' => [
                'days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                'departure_times' => ['07:30', '08:30', '09:30', '10:30', '11:30', '13:30', '14:30', '15:30', '16:30', '17:30'],
            ],
            'status' => 'active',
        ]);

        Route::create([
            'vessel_id' => $speedboat2->id,
            'origin' => 'Puerto Galera',
            'destination' => 'Batangas',
            'price' => 400.00,
            'duration' => 45,
            'schedule' => [
                'days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                'departure_times' => ['08:00', '10:00', '14:00', '16:00'],
            ],
            'status' => 'active',
        ]);
    }
}
