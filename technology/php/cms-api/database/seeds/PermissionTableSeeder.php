<?php

use Illuminate\Database\Seeder;
use App\Model\{Role, Permission};
use App\Enums\{Roles, Permissions};
use Carbon\Carbon;

class PermissionTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        foreach(Permission::permissionList() as $index => $roleItme)
        {
            $now = Carbon::now();
            DB::table('permissions')->insert(array(
                array('id' => $index, 'name' => $roleItme, 'guard_name' => 'api', 'created_at' => $now, 'updated_at' => $now)
            ));
        }

        /** Admin Role
          * Access to create, view, modify, and delete anything
          */

        $roleSuperAdmin = Role::where('name', Roles::SuperAdmin)->first();
        $roleSuperAdmin->givePermissionTo([
            Permissions::Create,
            Permissions::Update,
            Permissions::View,
            Permissions::Delete,
            Permissions::ManagePortalUser,
        ]);

        /** Admin Role
          * Access to create, view, modify, and delete anything
          */

        $roleAdmin = Role::where('name', Roles::Admin)->first();
        $roleAdmin->givePermissionTo([
            Permissions::Create,
            Permissions::Update,
            Permissions::View,
            Permissions::Delete,
            Permissions::ManagePortalUser,
        ]);

        /** Administrative Role
          * Access to create, view modify for ALL locations
          */

        $roleAdministrative = Role::where('name', Roles::Administrative)->first();
        $roleAdministrative->givePermissionTo([
            Permissions::Create,
            Permissions::Update,
            Permissions::View,
        ]);

        /** Manager Role
          * Access to create, view, modify, and delete ONLY for their location
          */

        $roleManager = Role::where('name', Roles::Manager)->first();
        $roleManager->givePermissionTo([
            Permissions::CreateLocal,
            Permissions::UpdateLocal,
            Permissions::ViewLocal,
            Permissions::DeleteLocal,
            Permissions::ManagePortalSalespersonUserLocal,
        ]);

        /** Salesperson Role
          * Access to create, view, modify ONLY for their location
          */

        $roleSalesperson = Role::where('name', Roles::Salesperson)->first();
        $roleSalesperson->givePermissionTo([
            Permissions::CreateLocal,
            Permissions::UpdateLocal,
            Permissions::ViewLocal,
        ]);


        
        /** Concierge Role
          * Access to create, view, modify ONLY for their location
          */

          $roleConcierge = Role::where('name', Roles::Concierge)->first();
          $roleConcierge->givePermissionTo([
              Permissions::CreateLocal,
              Permissions::UpdateLocal,
              Permissions::ViewLocal,
          ]);
    }
}
