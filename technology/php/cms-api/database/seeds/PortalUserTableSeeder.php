<?php

use Illuminate\Database\Seeder;
use App\Model\PortalUser;
use App\Enums\{Roles, Permissions};
use Carbon\Carbon;

class PortalUserTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $now = Carbon::now();
        $superadmin = PortalUser::create([
            'first_name' => 'admin',
            'last_name' => 'admin',
            'email' => 'admin@carblip.com',
            'password' => bcrypt('testuser'),
            'created_at' => $now,
            'updated_at' => $now
        ]);
        $superadmin->assignRole(Roles::SuperAdmin);
    }
}
