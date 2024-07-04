<?php

use Illuminate\Database\Seeder;
use App\Model\HubspotType;

class HubspotTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $types = ['Contacts', 'Deals', 'Users'];

        foreach ($types as $key => $type) {
            HubspotType::create([
                'trigger_type' => $type
            ]);
        }
    }
}
