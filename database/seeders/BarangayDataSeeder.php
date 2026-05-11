<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{
    Barangay,
    Purok,
    Street,
    Resident,
    User,
    BarangayOfficialTerm,
    BarangayOfficial,
    Household,
    Livestock,
    HouseholdToilet,
    HouseholdElectricitySource,
    HouseholdWasteManagement,
    HouseholdWaterSource,
    Family,
    Occupation,
    EducationalHistory,
    ResidentVoterInformation,
    SocialWelfareProfile,
    SeniorCitizen,
    MedicalInformation,
    Disability,
    ResidentMedicalCondition,
    ResidentMedication,
    ResidentVaccination,
    Allergy,
    PregnancyRecords,
    ChildHealthMonitoringRecord,
    Deceased,
    BlotterReport,
    CaseParticipant,
    Summon,
    SummonTake,
    SummonParticipantAttendance,
    BodiesOfWater,
    BodiesOfLand
};
use Illuminate\Support\Facades\Hash;

class BarangayDataSeeder extends Seeder
{
    public function run(): void
    {
        // Roles must be created before running this seeder
        $adminRole = 'admin';
        $barangayOfficerRole = 'barangay_officer';
        $residentRole = 'resident';

        // ----- Bodies of Water -----
        $waterTypes = [
            'Sea (Dagat)',
            'River (Ilog)',
            'Gulf (Golpo)',
            'Bay (Look)',
            'Strait (Kipot)',
            'Lagoon (Latian / Lawaing maalat)',
            'Lake (Lawa)',
            'Spring (Bukal)',
            'Falls (Talon)',
            'Creek (Sapa)',
            'Stream (Batis)',
            'Canal (Kanal)',
            'Estuary (Bunganga ng ilog)',
            'Swamp (Latian)',
            'Marsh (Lambak na latian)',
            'Reservoir (Imbakan ng tubig)',
            'Irrigation Canal (Patubig)',
            'Fishpond (Palaisdaan)',
            'Coral Reef Area (Bahura)',
            'Coastal Waters (Baybaying dagat)',
            'Mangrove Area (Bakawan)',
            'Floodplain (Kapatagang binabaha)',
            'Not mentioned above (Specify)',
        ];

        $waterNames = [
            'Sea (Dagat)' => ['Philippine Sea', 'West Philippine Sea', 'Sulu Sea'],
            'River (Ilog)' => ['Cagayan River', 'Magat River', 'Pinacanauan River'],
            'Gulf (Golpo)' => ['Lingayen Gulf', 'Davao Gulf', 'Moro Gulf'],
            'Bay (Look)' => ['Manila Bay', 'Lamon Bay', 'San Miguel Bay'],
            'Strait (Kipot)' => ['San Bernardino Strait', 'Surigao Strait', 'Tablas Strait'],
            'Lagoon (Latian / Lawaing maalat)' => ['Coastal Lagoon', 'Mangrove Lagoon'],
            'Lake (Lawa)' => ['Laguna de Bay', 'Lake Lanao', 'Taal Lake'],
            'Spring (Bukal)' => ['Cold Spring', 'Mountain Spring', 'Natural Spring'],
            'Falls (Talon)' => ['Pagsanjan Falls', 'Maria Cristina Falls', 'Tinuy-an Falls'],
            'Creek (Sapa)' => ['San Isidro Creek', 'Malinao Creek', 'Bucal Creek'],
            'Stream (Batis)' => ['Malamig na Batis', 'Mountain Stream', 'Forest Stream'],
            'Canal (Kanal)' => ['Irrigation Canal', 'Drainage Canal'],
            'Estuary (Bunganga ng ilog)' => ['River Estuary', 'Coastal Estuary'],
            'Swamp (Latian)' => ['Freshwater Swamp', 'Lowland Swamp'],
            'Marsh (Lambak na latian)' => ['Marshland Area', 'Wet Marsh'],
            'Reservoir (Imbakan ng tubig)' => ['Magat Reservoir', 'Angat Reservoir'],
            'Irrigation Canal (Patubig)' => ['National Irrigation Canal', 'Barangay Irrigation Line'],
            'Fishpond (Palaisdaan)' => ['Tilapia Fishpond', 'Milkfish Fishpond'],
            'Coral Reef Area (Bahura)' => ['Protected Reef Area', 'Coastal Reef'],
            'Coastal Waters (Baybaying dagat)' => ['Municipal Coastal Waters', 'Fishing Coastal Area'],
            'Mangrove Area (Bakawan)' => ['Mangrove Forest', 'Bakawan Zone'],
            'Floodplain (Kapatagang binabaha)' => ['River Floodplain', 'Low Floodplain Area'],
            'Not mentioned above (Specify)' => ['Unnamed Water Feature'],
        ];
        // ----- Bodies of Land -----
        $landTypes = [
            'Mountain (Bundok)',
            'Hill (Burol)',
            'Plateau (Talampas)',
            'Valley (Lambak)',
            'Plain (Kapatagan)',
            'Forest (Kagubatan)',
            'Cave (Kuweba)',
            'Volcano (Bulkan)',
            'Cliff (Bangin)',
            'Grassland (Damuhan)',
            'Wetland (Basang lupa)',
            'Rice Field (Palayan)',
            'Agricultural Land (Lupang sakahan)',
            'Residential Area (Pamayanan)',
            'Urban Area (Kalungsuran)',
            'Not mentioned above (Specify)',
        ];

        $landNames = [
            'Mountain (Bundok)' => [
                'Sierra Madre Range',
                'Cordillera Mountain',
                'Mt. Isarog',
                'Mt. Apo',
            ],
            'Hill (Burol)' => [
                'Rolling Hills',
                'Chocolate Hills Area',
                'Green Hill Zone',
            ],
            'Plateau (Talampas)' => [
                'Bukidnon Plateau',
                'Highland Plateau',
            ],
            'Valley (Lambak)' => [
                'Cagayan Valley',
                'Valley Lowlands',
            ],
            'Plain (Kapatagan)' => [
                'Central Plain',
                'Floodplain Area',
            ],
            'Forest (Kagubatan)' => [
                'Protected Forest',
                'Secondary Forest',
                'Rainforest Area',
            ],
            'Cave (Kuweba)' => [
                'Limestone Cave',
                'Underground Cave',
            ],
            'Volcano (Bulkan)' => [
                'Mayon Volcano Area',
                'Taal Volcano Zone',
            ],
            'Cliff (Bangin)' => [
                'Rock Cliff',
                'Steep Cliffside',
            ],
            'Grassland (Damuhan)' => [
                'Open Grassland',
                'Savanna Grass Area',
            ],
            'Wetland (Basang lupa)' => [
                'Wetland Reserve',
                'Protected Wetland',
            ],
            'Rice Field (Palayan)' => [
                'Irrigated Rice Field',
                'Rainfed Rice Field',
            ],
            'Agricultural Land (Lupang sakahan)' => [
                'Corn Field',
                'Mixed Cropland',
            ],
            'Residential Area (Pamayanan)' => [
                'Barangay Proper',
                'Housing Area',
            ],
            'Urban Area (Kalungsuran)' => [
                'Town Center',
                'Commercial Zone',
            ],
            'Not mentioned above (Specify)' => [
                'Unnamed Land Feature',
            ],
        ];

        // Seed ONLY one barangay for testing
        $barangays = Barangay::take(1)->get();
        //$barangays = Barangay::all();
        foreach ($barangays as $barangay) {
            /**
             * ADMIN USERS
             */
            $resident = Resident::factory()->create(['barangay_id' => $barangay->id]);
            $officer = User::factory()->create([
                'resident_id' => $resident->id,
                'barangay_id' => $barangay->id,
                'username' => $barangay->barangay_name . ' Barangay Officer',
                'email' => 'barangayofficer' . $barangay->id . '@example.com',
                'password' => Hash::make('admin123'),
                'email_verified_at' => now(),
                'role' => $barangayOfficerRole,
                'status' => 'inactive',
                'is_disabled' => false,
            ]);
            $officer->assignRole($barangayOfficerRole);

            /**
             * OFFICIAL TERM & SECRETARY
             */
            // $term = BarangayOfficialTerm::factory()->create([
            //     'barangay_id' => $barangay->id,
            //     'term_start' => 2022,
            //     'term_end' => 2025,
            //     'status' => 'inactive',
            // ]);

            // BarangayOfficial::factory()->create([
            //     'resident_id' => $resident->id,
            //     'term_id' => $term->id,
            //     'position' => 'barangay_secretary',
            //     'status' => 'inactive',
            //     'appointment_type' => 'appointed',
            // ]);

            /**
             * HOUSEHOLDS & FAMILIES
             */
            // Household::factory()
            //     ->count(5)
            //     ->for($barangay, 'barangay')
            //     ->create()
            //     ->each(function ($household) {
            //         Livestock::factory()
            //             ->count(rand(0, 5))
            //             ->for($household, 'household')
            //             ->create();

            //         HouseholdToilet::factory()
            //             ->count(rand(1, 2))
            //             ->for($household, 'household')
            //             ->create();

            //         HouseholdElectricitySource::factory()
            //             ->for($household, 'household')
            //             ->create();

            //         HouseholdWasteManagement::factory()
            //             ->for($household, 'household')
            //             ->create();

            //         HouseholdWaterSource::factory()
            //             ->count(rand(1, 3))
            //             ->for($household, 'household')
            //             ->create();
            //     });

            // Family::factory(5)->create(['barangay_id' => $barangay->id]);

            /**
             * RESIDENTS + RELATED DATA
             */
            // $residents = Resident::factory(20)->create(['barangay_id' => $barangay->id]);

            // foreach ($residents as $res) {
            //     Occupation::factory(rand(1, 3))->create(['resident_id' => $res->id]);
            //     EducationalHistory::factory(rand(1, 2))->create(['resident_id' => $res->id]);
            //     ResidentVoterInformation::factory()->create(['resident_id' => $res->id]);
            //     SocialWelfareProfile::factory()->create(['resident_id' => $res->id]);

            //     if ($res->birthdate <= now()->subYears(60)) {
            //         SeniorCitizen::factory()->create(['resident_id' => $res->id]);
            //     }

            //     $medical = MedicalInformation::factory()->create(['resident_id' => $res->id]);

            //     if (!empty($medical->pwd_id_number)) {
            //         Disability::factory()->create(['resident_id' => $res->id]);
            //         $res->update(['is_pwd' => 1]);
            //     }

            //     ResidentMedicalCondition::factory(rand(0, 3))->create(['resident_id' => $res->id]);
            //     ResidentMedication::factory(rand(0, 2))->create(['resident_id' => $res->id]);
            //     ResidentVaccination::factory(rand(0, 5))->create(['resident_id' => $res->id]);
            //     Allergy::factory(rand(0, 2))->create(['resident_id' => $res->id]);

            //     if ($res->gender === 'female' && $res->birthdate >= now()->subYears(45) && $res->birthdate <= now()->subYears(15)) {
            //         PregnancyRecords::factory(rand(0, 2))->create(['resident_id' => $res->id]);
            //     }

            //     if ($res->birthdate >= now()->subYears(5)) {
            //         ChildHealthMonitoringRecord::factory(rand(1, 3))->create(['resident_id' => $res->id]);
            //     }

            //     if ($res->is_deceased == 1) {
            //         Deceased::factory()->create(['resident_id' => $res->id]);
            //     }
            // }

            // Resident::where('barangay_id', $barangay->id)
            //     ->orderBy('household_id')
            //     ->chunkById(100, function ($group) {
            //         $group->groupBy('household_id')->each(
            //             fn($g) =>
            //             $g->first()->update(['is_household_head' => 1, 'is_family_head' => 1])
            //         );
            //     });

            /**
             * SAMPLE USERS
             */
            // foreach ($residents->take(15) as $i => $res) {
            //     $user = User::factory()->create([
            //         'barangay_id' => $barangay->id,
            //         'resident_id' => $res->id,
            //         'username' => 'Sample Resident ' . $i,
            //         'email' => 'user' . $barangay->id . '_' . ($i + 1) . '@example.com',
            //         'password' => Hash::make('user123'),
            //         'email_verified_at' => now(),
            //         'role' => $residentRole,
            //         'status' => 'inactive',
            //         'is_disabled' => false,
            //     ]);
            //     $user->assignRole($residentRole);
            // }

            // /**
            //  * BLOTTERS / SUMMONS / HEARINGS
            //  */
            // BlotterReport::factory(20)
            //     ->create(['barangay_id' => $barangay->id])
            //     ->each(function ($blotter) {
            //         $participants = CaseParticipant::factory(rand(2, 5))->state(['blotter_id' => $blotter->id])->create();
            //         $summon = Summon::factory()->state(['blotter_id' => $blotter->id])->create();

            //         $previous = null;
            //         for ($i = 1; $i <= rand(1, 3); $i++) {
            //             $date = $i === 1
            //                 ? fake()->dateTimeBetween('-2 months', '+1 month')
            //                 : fake()->dateTimeBetween($previous, $previous->modify('+1 month'));

            //             $status = $date > now()
            //                 ? fake()->randomElement(['scheduled', 'cancelled'])
            //                 : fake()->randomElement(['completed', 'adjourned', 'no_show']);

            //             $remarks = fake()->optional()->randomElement([
            //                 'Initial summons issued',
            //                 'Case still under mediation',
            //                 'Escalated to higher authority',
            //                 'Case resolved',
            //                 'Dismissed'
            //             ]);

            //             $take = SummonTake::factory()->create([
            //                 'summon_id' => $summon->id,
            //                 'session_number' => $i,
            //                 'hearing_date' => $date->format('Y-m-d'),
            //                 'session_status' => $status,
            //                 'session_remarks' => $remarks,
            //             ]);

            //             foreach ($participants as $p) {
            //                 SummonParticipantAttendance::factory()->create([
            //                     'take_id' => $take->id,
            //                     'participant_id' => $p->id,
            //                 ]);
            //             }

            //             $previous = $date;
            //         }
            //     });

            // /**
            //  * GEOGRAPHICAL DATA
            //  */
            // $this->generateLandWater($barangay, $waterTypes, $waterNames, $landTypes, $landNames);
        }
    }

    private function generateLandWater($barangay, $waterTypes, $waterNames, $landTypes, $landNames)
    {
        $numWaters = rand(0, 4);

        if ($numWaters === 0) {
            BodiesOfWater::create([
                'barangay_id' => $barangay->id,
                'type' => 'None',
                'exists' => false,
                'name' => 'N/A',
            ]);
        } else {
            foreach (collect($waterTypes)->random($numWaters) as $type) {
                BodiesOfWater::create([
                    'barangay_id' => $barangay->id,
                    'type' => $type,
                    'exists' => true,
                    'name' => fake()->randomElement($waterNames[$type] ?? ['Unknown Water Feature']),
                ]);
            }
        }

        $numLands = rand(0, 4);

        if ($numLands === 0) {
            BodiesOfLand::create([
                'barangay_id' => $barangay->id,
                'type' => 'None',
                'exists' => false,
                'name' => 'N/A',
            ]);
        } else {
            foreach (collect($landTypes)->random($numLands) as $type) {
                BodiesOfLand::create([
                    'barangay_id' => $barangay->id,
                    'type' => $type,
                    'exists' => true,
                    'name' => fake()->randomElement($landNames[$type] ?? ['Unknown Land Feature']),
                ]);
            }
        }
    }
}
