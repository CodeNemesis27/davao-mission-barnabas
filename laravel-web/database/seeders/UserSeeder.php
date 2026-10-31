<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name'  => 'Richard Sombrio',
                'email' => 'richard.sombrio27@gmail.com',
                'role'  => 'Admin',
            ],
            [
                'name'  => 'Claire Redfield',
                'email' => 'claireredfield@gmail.com',
                'role'  => 'Clerk',
            ],
            [
                'name'  => 'Leon Kennedy',
                'email' => 'leonkennedy@gmail.com',
                'role'  => 'Member',
            ],
        ];

        foreach ($users as $data) {
            User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name'              => $data['name'],
                    'password'          => Hash::make('password'),
                    'role'              => $data['role'],
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
