<?php

namespace Database\Factories;

use App\Models\Family;
use App\Models\Household;
use App\Models\Purok;
use App\Models\Resident;
use App\Models\Street;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;


/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Resident>
 */
class ResidentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
public function definition(): array
{
    $suffixes = ['Jr.', 'Sr.', 'II', 'III', 'IV'];

    $randomFamily = Family::inRandomOrder()->first() ?? Family::factory()->create();

    $household = $randomFamily->household_id
        ? Household::find($randomFamily->household_id)
        : Household::inRandomOrder()->first() ?? Household::factory()->create();

    if (!$randomFamily->household_id) {
        $randomFamily->update(['household_id' => $household->id]);
    }

    $lname = trim(preg_replace('/family/i', '', $randomFamily->family_name));

    $street = Street::inRandomOrder()->first() ?? Street::factory()->create();

    $lastNames = [
        'Dela Cruz', 'Reyes', 'Santos', 'Garcia', 'Lopez', 'Mendoza',
        'Torres', 'Ramos', 'Gonzales', 'Fernandez', 'Castro', 'Bautista',
        'Aquino', 'Villanueva', 'Domingo', 'Pascual', 'Agbayani',
        'Cabrera', 'Soriano', 'Salazar', 'Alcantara', 'Navarro',
        'Del Rosario', 'Mercado', 'Rosales', 'Cariño', 'Agtarap',
        'Quiling', 'Balila', 'Carreon', 'Medico', 'Baingan',
    ];

    $maleNames = [
        'Jose', 'Juan', 'Pedro', 'Antonio', 'Ramon', 'Manuel', 'Pablo',
        'Arnel', 'Jerome', 'Jayson', 'Alvin', 'Rey', 'Christian',
        'Mark Anthony', 'Ronald', 'Marvin', 'Bryan', 'Kevin', 'Francis',
        'Harold', 'Prince', 'Russel', 'Jethro', 'Kian', 'Axel', 'Renz',
        'Enzo', 'Drei', 'Jio',
    ];

    $femaleNames = [
        'Maria', 'Josefina', 'Rosalinda', 'Corazon', 'Amelia', 'Teresita',
        'Lourdes', 'Marilou', 'Rowena', 'Angelica', 'Charmaine',
        'Kristine', 'Rhea', 'Analyn', 'Lovely', 'Jeanette', 'Aubrey',
        'Mikaela', 'Alexa', 'Andrea', 'Ysabel', 'Thea', 'Janelle',
        'Grace', 'Bea', 'Miah',
    ];

    $sex = $this->faker->randomElement([
        ...array_fill(0, 49, 'male'),
        ...array_fill(0, 49, 'female'),
    ]);

    $gender = $this->faker->randomElement([
        ...array_fill(0, 48, 'male'),
        ...array_fill(0, 48, 'female'),
        ...array_fill(0, 4, 'lgbtq'),
    ]);

    $firstName = $sex === 'female'
        ? $this->faker->randomElement($femaleNames)
        : $this->faker->randomElement($maleNames);

    $middleName = $this->faker->randomElement($lastNames);

    $birthdateObj = $this->faker->dateTimeBetween('-90 years', 'now');
    $birthdate = $birthdateObj->format('Y-m-d');
    $age = $birthdateObj->diff(now())->y;

    $employmentStatus = match (true) {
        $age < 5 => 'not_applicable',
        $age <= 17 => $this->faker->randomElement([
            ...array_fill(0, 85, 'student'),
            ...array_fill(0, 10, 'child'),
            ...array_fill(0, 5, 'not_applicable'),
        ]),
        $age >= 60 => $this->faker->randomElement([
            ...array_fill(0, 45, 'retired'),
            ...array_fill(0, 25, 'employed'),
            ...array_fill(0, 15, 'homemaker'),
            ...array_fill(0, 10, 'unemployed'),
            ...array_fill(0, 5, 'not_applicable'),
        ]),
        default => $this->faker->randomElement([
            ...array_fill(0, 55, 'employed'),
            ...array_fill(0, 18, 'unemployed'),
            ...array_fill(0, 12, 'homemaker'),
            ...array_fill(0, 10, 'student'),
            ...array_fill(0, 5, 'not_applicable'),
        ]),
    };

    return [
        'barangay_id' => 1,

        'firstname' => $firstName,
        'middlename' => $middleName,
        'lastname' => $lname ?: $this->faker->randomElement($lastNames),
        'maiden_name' => $sex === 'female'
            ? $this->faker->optional(0.25)->randomElement($lastNames)
            : null,
        'suffix' => $sex === 'male'
            ? $this->faker->optional(0.08)->randomElement($suffixes)
            : null,

        'sex' => $sex,
        'gender' => $gender,
        'birthdate' => $birthdate,
        'birthplace' => $this->faker->randomElement([
            'Ilagan City, Isabela',
            'Cauayan City, Isabela',
            'Santiago City, Isabela',
            'Tumauini, Isabela',
            'Cabagan, Isabela',
            'Roxas, Isabela',
            'Tuguegarao City, Cagayan',
            'Quezon City, Metro Manila',
            'Manila, Metro Manila',
            'Baguio City, Benguet',
        ]),

        'civil_status' => match (true) {
            $age < 18 => 'single',
            $age < 25 => $this->faker->randomElement([
                ...array_fill(0, 75, 'single'),
                ...array_fill(0, 20, 'married'),
                ...array_fill(0, 5, 'separated'),
            ]),
            $age >= 60 => $this->faker->randomElement([
                ...array_fill(0, 45, 'married'),
                ...array_fill(0, 30, 'widowed'),
                ...array_fill(0, 15, 'single'),
                ...array_fill(0, 7, 'separated'),
                ...array_fill(0, 3, 'annulled'),
            ]),
            default => $this->faker->randomElement([
                ...array_fill(0, 55, 'married'),
                ...array_fill(0, 30, 'single'),
                ...array_fill(0, 8, 'separated'),
                ...array_fill(0, 4, 'widowed'),
                ...array_fill(0, 3, 'annulled'),
            ]),
        },

        'registered_voter' => $age >= 18
            ? $this->faker->boolean(82)
            : false,

        'employment_status' => $employmentStatus,

        'citizenship' => 'Filipino',

        'religion' => $this->faker->randomElement([
            ...array_fill(0, 75, 'Roman Catholic'),
            ...array_fill(0, 8, 'Iglesia ni Cristo'),
            ...array_fill(0, 7, 'Evangelical'),
            ...array_fill(0, 5, 'Protestant'),
            ...array_fill(0, 3, 'Islam'),
            ...array_fill(0, 2, 'Others'),
        ]),

        'contact_number' => $age >= 13
            ? $this->faker->numerify('09#########')
            : null,

        'email' => $age >= 13 && $this->faker->boolean(45)
            ? strtolower(
                preg_replace(
                    '/[^a-z0-9]/i',
                    '',
                    $firstName . '.' . substr($middleName, 0, 1) . '.' . $lname
                )
            ) . '@example.com'
            : null,

        'purok_number' => $this->faker->numberBetween(1, 7),
        'street_id' => $street->id,

        'residency_date' => $this->faker->numberBetween(
            max(1950, now()->year - min($age, 60)),
            now()->year
        ),

        'residency_type' => $this->faker->randomElement([
            ...array_fill(0, 82, 'permanent'),
            ...array_fill(0, 13, 'temporary'),
            ...array_fill(0, 5, 'immigrant'),
        ]),

        'resident_picture_path' => null,

        'ethnicity' => $this->faker->randomElement([
            ...array_fill(0, 45, 'Ilocano'),
            ...array_fill(0, 25, 'Tagalog'),
            ...array_fill(0, 12, 'Ibanag'),
            ...array_fill(0, 8, 'Yogad'),
            ...array_fill(0, 5, 'Gaddang'),
            ...array_fill(0, 3, 'Bisaya'),
            ...array_fill(0, 2, 'Kapampangan'),
        ]),

        'is_deceased' => $age >= 70
            ? $this->faker->boolean(8)
            : $this->faker->boolean(1),

        'is_household_head' => false,
        'is_family_head' => false,

        'family_id' => null,
        'household_id' => null,

        'verified' => $this->faker->boolean(92),
    ];
}
}
