<?php

use Illuminate\Database\Seeder;
use App\Model\Role;
use Carbon\Carbon;

class RoleTableSeeder extends Seeder
{

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        foreach(Role::roleList() as $index => $roleItme)
        {
            $now = Carbon::now();
            DB::table('roles')->insert(array(
                array('id' => $index, 'name' => $roleItme, 'guard_name' => 'api', 'created_at' => $now, 'updated_at' => $now)
            ));
        }
    }
}
