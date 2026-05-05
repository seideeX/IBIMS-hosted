<?php

namespace Database\Factories;

use App\Models\Household;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Family>
 */
class FamilyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $familyMonthlyIncome = $this->faker->randomElement([
            $this->faker->numberBetween(5000, 12029),
            $this->faker->numberBetween(12030, 24060),
            $this->faker->numberBetween(24061, 48120),
            $this->faker->numberBetween(48121, 84210),
            $this->faker->numberBetween(84211, 144360),
            $this->faker->numberBetween(144361, 240600),
            $this->faker->numberBetween(240601, 350000),
        ]);

        $incomeBracket = match (true) {
            $familyMonthlyIncome < 12030 => 'poor',
            $familyMonthlyIncome <= 24060 => 'low_income_non_poor',
            $familyMonthlyIncome <= 48120 => 'lower_middle_income',
            $familyMonthlyIncome <= 84210 => 'middle_middle_income',
            $familyMonthlyIncome <= 144360 => 'upper_middle_income',
            $familyMonthlyIncome <= 240600 => 'upper_income',
            default => 'rich',
        };

        $incomeCategory = match ($incomeBracket) {
            'poor',
            'low_income_non_poor' => 'low_income',

            'lower_middle_income',
            'middle_middle_income',
            'upper_middle_income' => 'middle_income',

            'upper_income',
            'rich' => 'high_income',
        };

        return [
            'barangay_id' => 1,
            'household_id' => Household::inRandomOrder()->first()?->id ?? Household::factory(),

            'family_monthly_income' => $familyMonthlyIncome,
            'income_bracket' => $incomeBracket,
            'income_category' => $incomeCategory,

            'family_name' => $this->faker->randomElement([
                'Dela Cruz', 'Reyes', 'Santos', 'Garcia', 'Lopez',
                'Mendoza', 'Torres', 'Ramos', 'Gonzales', 'Fernandez',
                'Castro', 'Gutierrez', 'Pascual', 'Domingo', 'Villanueva',
                'Agbayani', 'Buenaventura', 'Cabrera', 'Lagman', 'Soriano',
                'Salazar', 'Alcantara', 'Yap', 'Chua', 'Tan',
                'Lim', 'Co', 'Ong', 'Bautista', 'Padilla',
                'Aquino', 'Marquez', 'Navarro', 'Del Rosario', 'Calderon',
                'Mercado', 'Rosales', 'Abad', 'Esquivel', 'Balagtas',
                'Alejo', 'Balila', 'Quiling', 'Carreon', 'Cariño',
                'Medico', 'Agtarap', 'Baingan', 'Dela Rosa', 'Paril',
                'Rivera', 'Bermudez', 'Barrio', 'Aguinaldo', 'Agriam',
                'Aguilar',
            ]),

            'family_type' => $this->faker->randomElement([
                'nuclear',
                'single_parent',
                'extended',
                'stepfamilies',
                'grandparent',
                'childless',
                'cohabiting_partners',
                'one_person_household',
                'roommates',
            ]),
        ];
    }
}
