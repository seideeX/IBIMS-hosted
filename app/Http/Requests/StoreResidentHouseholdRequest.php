<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreResidentHouseholdRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            //Household Info
            'housenumber' => ['required', 'integer'],
            'subdivision' => ['nullable', 'string', 'max:100'],
            'street' => ['nullable', 'integer', 'min:1'],
            'purok' => ['required', 'integer', 'min:1'],
            'household.household_count' => ['required', 'integer', 'min:1'],
            'household.household_type' => ['required', Rule::in(['nuclear', 'extended', 'single_parent', 'stepfamilies', 'grandparent', 'childless', 'cohabiting_partners', 'one_person_household', 'roommates'])],

            //Family Info
            //'household.family_name' => ['required', 'string', 'max:100'],
            'household.families.*.family_type' => ['required', Rule::in(['nuclear', 'extended', 'single_parent', 'stepfamilies', 'grandparent', 'childless', 'cohabiting_partners', 'one_person_household', 'roommates'])],
            'household.families.*.family_monthly_income' => ['required', 'numeric', 'min:0'],

            'household.families.*.income_bracket' => [
                'required',
                Rule::in([
                    'poor',
                    'low_income_non_poor',
                    'lower_middle_income',
                    'middle_middle_income',
                    'upper_middle_income',
                    'upper_income',
                    'rich',
                ])
            ],

            'household.families.*.income_category' => [
                'required',
                Rule::in([
                    'low_income',
                    'middle_income',
                    'high_income',
                ])
            ],

            //Housing Structure
            'ownership_type' => ['nullable', 'string', 'max:100'],
            'housing_condition' => ['nullable', Rule::in(['good', 'needs_repair', 'dilapidated'])],
            'house_structure' => ['nullable', Rule::in(['concrete', 'semi_concrete', 'wood', 'makeshift'])],
            'year_established' => ['nullable', 'digits:4', 'integer', 'min:1900', 'max:' . now()->year],
            'number_of_rooms' => ['nullable', 'integer', 'min:1', 'max:100'],
            'number_of_floors' => ['nullable', 'integer', 'min:1', 'max:10'],
            'bath_and_wash_area' => ['nullable', 'string', 'max:100'],
            'type_of_internet' => ['nullable', 'string', 'max:100'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],

            // Utilities
            'toilets' => ['nullable', 'array'],
            'toilets.*.toilet_type' => ['nullable', 'string', 'max:100'],

            'electricity_types' => ['nullable', 'array'],
            'electricity_types.*.electricity_type' => ['nullable', 'string', 'max:100'],

            'water_source_types' => ['nullable', 'array'],
            'water_source_types.*.water_source_type' => ['nullable', 'string', 'max:100'],

            'waste_management_types' => ['nullable', 'array'],
            'waste_management_types.*.waste_management_type' => ['nullable', 'string', 'max:100'],

            // Pets
            'has_pets' => ['nullable', Rule::in([0, 1])],
            'pets' => ['nullable', 'array'],
            'pets.*.pet_type' => ['nullable', 'string', 'max:100'],
            'pets.*.is_vaccinated' => ['nullable', Rule::in([0, 1])],

            // Livestock
            'has_livestock' => ['nullable', Rule::in([0, 1])],
            'livestocks' => ['nullable', 'array'],
            'livestocks.*.livestock_type' => ['nullable', 'string', 'max:100'],
            'livestocks.*.quantity' => ['nullable', 'integer', 'min:0', 'max:999'],
            'livestocks.*.purpose' => ['nullable', Rule::in(['personal_consumption', 'commercial', 'both'])],


            // Verification
            'verified' => ['required', Rule::in([0, 1])],

            // Members (residents of the household)
            'household.families.*.members' => ['required', 'array', 'min:1'],
            'household.families.*.members.*.resident_image' => ['nullable', 'image', 'max:5120'],
            'household.families.*.members.*.siblingGroupKey' => ['nullable'],
            'household.families.*.members.*.lastname' => ['required', 'string', 'max:55'],
            'household.families.*.members.*.firstname' => ['required', 'string', 'max:55'],
            'household.families.*.members.*.middlename' => ['nullable', 'string', 'max:55'],
            'household.families.*.members.*.suffix' => ['nullable', Rule::in(['Jr.', 'Sr.', 'I', 'II', 'III', 'IV'])],
            'household.families.*.members.*.birthdate' => ['required', 'date', 'before:today'],
            'household.families.*.members.*.birthplace' => ['required', 'string', 'max:150'],
            'household.families.*.members.*.civil_status' => ['required', Rule::in(['single', 'married', 'widowed', 'divorced', 'separated', 'annulled'])],
            'household.families.*.members.*.sex' => ['required', Rule::in(['male', 'female'])],
            'household.families.*.members.*.gender' => ['required', 'string', 'max:55'],
            'household.families.*.members.*.maiden_middle_name' => ['nullable', 'string', 'max:100'],
            'household.families.*.members.*.citizenship' => ['required', 'string', 'max:55'],
            'household.families.*.members.*.religion' => ['nullable', 'string', 'max:55'],
            'household.families.*.members.*.ethnicity' => ['nullable', 'string', 'max:55'],
            'household.families.*.members.*.contactNumber' => ['nullable', 'string', 'max:15'],
            'household.families.*.members.*.email' => ['nullable','email','min:10','max:55','unique:residents,email'],
            'household.families.*.members.*.is_pensioner' => ['nullable', Rule::in(['yes', 'no'])],
            'household.families.*.members.*.is_family_head' => ['nullable', Rule::in([1, 0])],
            'household.families.*.members.*.osca_id_number' => ['nullable', 'string', 'max:55'],
            'household.families.*.members.*.pension_type' => ['nullable', Rule::in(['SSS', 'GSIS', 'DSWD', 'private', 'none'])],
            'household.families.*.members.*.living_alone' => ['nullable', Rule::in([0, 1])],
            'household.families.*.members.*.residency_type' => ['nullable', Rule::in(['permanent', 'temporary', 'immigrant'])],
            'household.families.*.members.*.residency_date' => ['nullable', 'digits:4', 'integer', 'min:1900', 'max:' . now()->year],
            'household.families.*.members.*.relation_to_household_head' => ['nullable', Rule::in(['self', 'spouse', 'child', 'sibling', 'parent', 'parent_in_law','grandparent', 'spouse-sibling', 'spouse-of-sibling-of-spouse','niblings', 'sibling-of-spouse'])],
            'household.families.*.members.*.registered_voter' => ['nullable', Rule::in([0, 1])],
            'household.families.*.members.*.registered_barangay' => ['required_if:members.*.registered_voter,1'],
            'household.families.*.members.*.voter_id_number' => ['nullable', 'string', 'max:55'],
            'household.families.*.members.*.voting_status' => ['nullable', Rule::in(['active', 'inactive', 'disqualified', 'medical', 'overseas', 'detained', 'deceased'])],
            'household.families.*.members.*.is_household_head' => ['required', Rule::in([0, 1])],
            'household.families.*.members.*.household_position' => ['nullable', 'string', 'max:55'],
            'household.families.*.members.*.is_4ps_benificiary' => ['nullable', Rule::in([0, 1])],
            'household.families.*.members.*.is_solo_parent' => ['nullable', Rule::in([0, 1])],
            'household.families.*.members.*.solo_parent_id_number' => ['nullable', 'string', 'max:55'],
            'household.families.*.members.*.philsys_card_number' => ['nullable', 'max:16'],
            'household.families.*.members.*.has_vehicle' => ['nullable', Rule::in([0, 1])],
            'household.families.*.members.*.vehicles.*.vehicle_type' => ['nullable', 'string', 'max:55'],
            'household.families.*.members.*.vehicles.*.vehicle_class' => ['nullable', 'string', 'max:55'],
            'household.families.*.members.*.vehicles.*.usage_status' => ['nullable', 'string', 'max:55'],
            'household.families.*.members.*.vehicles.*.is_registered' => ['nullable', Rule::in([1, 0])],

            // educaiton
            'household.families.*.members.*.educations' => ['nullable', 'array'],
            'household.families.*.members.*.educations.*.education' => ['nullable', Rule::in(['no_education_yet','no_formal_education','prep_school','kindergarten','elementary',
            'high_school','senior_high_school','college','als','tesda','vocational','post_graduate',])],
            'household.families.*.members.*.educations.*.educational_status' => ['nullable', Rule::in(['graduated', 'incomplete', 'enrolled', 'dropped_out'])],
            'household.families.*.members.*.educations.*.school_name' => ['nullable', 'string', 'max:150'],
            'household.families.*.members.*.educations.*.school_type' => ['nullable', Rule::in(['public', 'private'])],
            'household.families.*.members.*.educations.*.year_started' => ['nullable', 'digits:4', 'integer', 'min:1900', 'max:' . now()->year],
            'household.families.*.members.*.educations.*.year_ended' => ['nullable', 'digits:4', 'integer', 'min:1900', 'max:' . now()->year],
            'household.families.*.members.*.educations.*.program' => ['nullable', 'string', 'max:150'],

            // occupations
            'household.families.*.members.*.occupations' => ['nullable', 'array'],
            'household.families.*.members.*.occupations.*.employment_status' => ['nullable', Rule::in(['employed', 'unemployed', 'student','child','retired','homemaker', 'not_applicable'])],
            'household.families.*.members.*.occupations.*.occupation' => ['nullable', 'string', 'max:100'],
            'household.families.*.members.*.occupations.*.employment_type' => ['nullable', Rule::in(['full_time', 'part_time', 'seasonal', 'contractual', 'self_employed', 'under_employed'])],
            'household.families.*.members.*.occupations.*.occupation_status' => ['nullable', Rule::in(['active', 'inactive', 'ended', 'retired','terminated', 'resigned'])],
            'household.families.*.members.*.occupations.*.work_arrangement' => ['nullable', Rule::in(['remote', 'on_site', 'hybrid'])],
            'household.families.*.members.*.occupations.*.employer' => ['nullable', 'string', 'max:100'],
            'household.families.*.members.*.occupations.*.started_at' => ['nullable', 'digits:4', 'integer', 'min:1900', 'max:' . now()->year],
            'household.families.*.members.*.occupations.*.ended_at' => ['nullable', 'digits:4', 'integer', 'min:1900', 'max:' . now()->year],
            'household.families.*.members.*.occupations.*.frequency' => ['nullable', Rule::in(['daily', 'weekly', 'bi-weekly', 'monthly', 'annually'])],
            'household.families.*.members.*.occupations.*.income' => ['nullable', 'numeric', 'min:0'],
            'household.families.*.members.*.occupations.*.monthly_income' => ['nullable', 'numeric', 'min:0'],
            'household.families.*.members.*.occupations.*.is_ofw' => ['nullable', Rule::in([0, 1])],
            'household.families.*.members.*.occupations.*.is_main_source' => ['nullable', Rule::in([0, 1])],
            'household.families.*.members.*.weight_kg' => ['nullable', 'numeric', 'min:0', 'max:300'],
            'household.families.*.members.*.height_cm' => ['nullable', 'numeric', 'min:0', 'max:300'],
            'household.families.*.members.*.bmi' => ['nullable', 'numeric', 'min:0', 'max:300'],
            'household.families.*.members.*.nutrition_status' => ['nullable', 'string', 'max:100'],
            'household.families.*.members.*.emergency_contact_number' => ['nullable', 'string', 'max:11'],
            'household.families.*.members.*.emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'household.families.*.members.*.emergency_contact_relationship' => ['nullable', 'string', 'max:100'],
            'household.families.*.members.*.blood_type' => ['nullable', Rule::in(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])],
            'household.families.*.members.*.has_philhealth' => ['nullable', Rule::in([0, 1])],
            'household.families.*.members.*.philhealth_id_number' => ['nullable', 'string', 'max:50'],
            'household.families.*.members.*.is_alcohol_user' => ['nullable', Rule::in([0, 1])],
            'household.families.*.members.*.is_smoker' => ['nullable', Rule::in([0, 1])],
            'household.families.*.members.*.is_pwd' => ['nullable', Rule::in([0, 1])],
            'household.families.*.members.*.pwd_id_number' => ['required_if:is_pwd,1', 'nullable', 'string', 'max:15'],
            'household.families.*.members.*.disabilities' => ['required_if:is_pwd,1', 'array'],
            'household.families.*.members.*.disabilities.*.disability_type' => ['required_with:disabilities', 'string', 'max:100'],


            // SECTION 6: Livelihoods
            // 'household.families.*.members.*.livelihoods' => ['nullable', 'array'],
            // 'household.families.*.members.*.livelihoods.*.livelihood_type' => ['nullable', 'string', 'max:155'],
            // 'household.families.*.members.*.livelihoods.*.description' => ['nullable', 'string', 'max:255'],

            // 'household.families.*.members.*.livelihoods.*.status' => [
            //     'nullable',
            //     Rule::in(['active', 'inactive', 'seasonal', 'ended']),
            // ],

            // 'household.families.*.members.*.livelihoods.*.is_main_livelihood' => ['nullable', 'boolean'],

            // 'household.families.*.members.*.livelihoods.*.started_at' => ['nullable', 'date', 'before_or_equal:today'],
            // 'household.families.*.members.*.livelihoods.*.ended_at' => ['nullable', 'date', 'after:started_at'],

            // 'household.families.*.members.*.livelihoods.*.income' => ['nullable', 'numeric', 'min:0'],
            // 'household.families.*.members.*.livelihoods.*.income_frequency' => [
            //     'nullable',
            //     Rule::in(['daily', 'bi_weekly', 'weekly', 'monthly', 'annually'])]
        ];
    }

    public function attributes()
    {
        $attributes = [];

        // Families & Members
        foreach ((array) $this->input('household.families', []) as $fIndex => $family) {
            $fNum = $fIndex + 1;

            foreach ((array) ($family['members'] ?? []) as $mIndex => $member) {
                $n = $mIndex + 1;
                $base = "household.families.$fIndex.members.$mIndex";

                $attributes["$base.lastname"] = "Last name of household member #$n (family #$fNum)";
                $attributes["$base.firstname"] = "First name of household member #$n (family #$fNum)";
                $attributes["$base.middlename"] = "Middle name of household member #$n (family #$fNum)";
                $attributes["$base.suffix"] = "Suffix of household member #$n (family #$fNum)";
                $attributes["$base.birthdate"] = "Birthdate of household member #$n (family #$fNum)";
                $attributes["$base.birthplace"] = "Birthplace of household member #$n (family #$fNum)";
                $attributes["$base.civil_status"] = "Civil status of household member #$n (family #$fNum)";
                $attributes["$base.gender"] = "Gender of household member #$n (family #$fNum)";
                $attributes["$base.maiden_middle_name"] = "Maiden middle name of household member #$n (family #$fNum)";
                $attributes["$base.citizenship"] = "Citizenship of household member #$n (family #$fNum)";
                $attributes["$base.religion"] = "Religion of household member #$n (family #$fNum)";
                $attributes["$base.ethnicity"] = "Ethnicity of household member #$n (family #$fNum)";
                $attributes["$base.contactNumber"] = "Contact number of household member #$n (family #$fNum)";
                $attributes["$base.email"] = "Email of household member #$n (family #$fNum)";
                $attributes["$base.residency_type"] = "Residency type of household member #$n (family #$fNum)";
                $attributes["$base.residency_date"] = "Residency year of household member #$n (family #$fNum)";
                $attributes["$base.relation_to_household_head"] = "Relation to head of household member #$n (family #$fNum)";
                $attributes["$base.registered_voter"] = "Voter registration of household member #$n (family #$fNum)";
                $attributes["$base.registered_barangay"] = "Voter status of household member #$n (family #$fNum)";
                $attributes["$base.voter_id_number"] = "Voter ID number of household member #$n (family #$fNum)";
                $attributes["$base.voting_status"] = "Voting status of household member #$n (family #$fNum)";
                $attributes["$base.is_household_head"] = "Is household head for household member #$n (family #$fNum)";
                $attributes["$base.household_position"] = "Household position for household member #$n (family #$fNum)";
                $attributes["$base.is_4ps_benificiary"] = "4Ps beneficiary of household member #$n (family #$fNum)";
                $attributes["$base.is_solo_parent"] = "Solo parent status of household member #$n (family #$fNum)";
                $attributes["$base.solo_parent_id_number"] = "Solo parent ID of household member #$n (family #$fNum)";
                $attributes["$base.has_vehicle"] = "Has vehicle status for household member #$n (family #$fNum)";
                $attributes["$base.resident_image"] = "Profile photo of household member #$n (family #$fNum)";
                $attributes["$base.weight_kg"] = "Weight of household member #$n (family #$fNum)";
                $attributes["$base.height_cm"] = "Height of household member #$n (family #$fNum)";
                $attributes["$base.bmi"] = "BMI of household member #$n (family #$fNum)";
                $attributes["$base.nutrition_status"] = "Nutrition status of household member #$n (family #$fNum)";
                $attributes["$base.emergency_contact_number"] = "Emergency number of household member #$n (family #$fNum)";
                $attributes["$base.emergency_contact_name"] = "Contact name of household member #$n (family #$fNum)";
                $attributes["$base.emergency_contact_relationship"] = "Contact relationship of household member #$n (family #$fNum)";
                $attributes["$base.blood_type"] = "Blood type of household member #$n (family #$fNum)";
                $attributes["$base.has_philhealth"] = "PhilHealth status of household member #$n (family #$fNum)";
                $attributes["$base.philhealth_id_number"] = "PhilHealth ID Number of household member #$n (family #$fNum)";
                $attributes["$base.is_alcohol_user"] = "Alcohol usage status of household member #$n (family #$fNum)";
                $attributes["$base.is_smoker"] = "Smoking status of household member #$n (family #$fNum)";
                $attributes["$base.is_pwd"] = "Disability status of household member #$n (family #$fNum)";
                $attributes["$base.pwd_id_number"] = "PWD ID of household member #$n (family #$fNum)";

                // Member Vehicles
                foreach ((array) ($member['vehicles'] ?? []) as $vIndex => $vehicle) {
                    $attributes["$base.vehicles.$vIndex.vehicle_type"] = "Vehicle type of member #$n (family #$fNum, vehicle #".($vIndex + 1).")";
                    $attributes["$base.vehicles.$vIndex.vehicle_class"] = "Vehicle class of member #$n (family #$fNum, vehicle #".($vIndex + 1).")";
                    $attributes["$base.vehicles.$vIndex.usage_status"] = "Vehicle usage status of member #$n (family #$fNum, vehicle #".($vIndex + 1).")";
                    $attributes["$base.vehicles.$vIndex.quantity"] = "Vehicle quantity of member #$n (family #$fNum, vehicle #".($vIndex + 1).")";
                }

                // Member Educations
                foreach ((array) ($member['educations'] ?? []) as $eduIndex => $edu) {
                    $attributes["$base.educations.$eduIndex.education"] = "Educational attainment of member #$n (family #$fNum, education #" . ($eduIndex + 1) . ")";
                    $attributes["$base.educations.$eduIndex.educational_status"] = "Educational status of member #$n (family #$fNum, education #" . ($eduIndex + 1) . ")";
                    $attributes["$base.educations.$eduIndex.school_name"] = "School name of member #$n (family #$fNum, education #" . ($eduIndex + 1) . ")";
                    $attributes["$base.educations.$eduIndex.school_type"] = "School type of member #$n (family #$fNum, education #" . ($eduIndex + 1) . ")";
                    $attributes["$base.educations.$eduIndex.year_started"] = "Year started of member #$n (family #$fNum, education #" . ($eduIndex + 1) . ")";
                    $attributes["$base.educations.$eduIndex.year_ended"] = "Year ended of member #$n (family #$fNum, education #" . ($eduIndex + 1) . ")";
                    $attributes["$base.educations.$eduIndex.program"] = "Finished course of member #$n (family #$fNum, education #" . ($eduIndex + 1) . ")";
                }

                // Member Occupations
                foreach ((array) ($member['occupations'] ?? []) as $oIndex => $occupation) {
                    $attributes["$base.occupations.$oIndex.employment_status"] = "Employment status of member #$n (family #$fNum, occupation #" . ($oIndex + 1) . ")";
                    $attributes["$base.occupations.$oIndex.occupation"] = "Occupation of member #$n (family #$fNum, occupation #" . ($oIndex + 1) . ")";
                    $attributes["$base.occupations.$oIndex.employment_type"] = "Employment type of member #$n (family #$fNum, occupation #" . ($oIndex + 1) . ")";
                    $attributes["$base.occupations.$oIndex.occupation_status"] = "Occupation status of member #$n (family #$fNum, occupation #" . ($oIndex + 1) . ")";
                    $attributes["$base.occupations.$oIndex.work_arrangement"] = "Work arrangement of member #$n (family #$fNum, occupation #" . ($oIndex + 1) . ")";
                    $attributes["$base.occupations.$oIndex.employer"] = "Employer of member #$n (family #$fNum, occupation #" . ($oIndex + 1) . ")";
                    $attributes["$base.occupations.$oIndex.started_at"] = "Start year of member #$n (family #$fNum, occupation #" . ($oIndex + 1) . ")";
                    $attributes["$base.occupations.$oIndex.ended_at"] = "End year of member #$n (family #$fNum, occupation #" . ($oIndex + 1) . ")";
                    $attributes["$base.occupations.$oIndex.frequency"] = "Income frequency of member #$n (family #$fNum, occupation #" . ($oIndex + 1) . ")";
                    $attributes["$base.occupations.$oIndex.income"] = "Income of member #$n (family #$fNum, occupation #" . ($oIndex + 1) . ")";
                    $attributes["$base.occupations.$oIndex.monthly_income"] = "Monthly income of member #$n (family #$fNum, occupation #" . ($oIndex + 1) . ")";
                    $attributes["$base.occupations.$oIndex.is_ofw"] = "OFW status of member #$n (family #$fNum, occupation #" . ($oIndex + 1) . ")";
                    $attributes["$base.occupations.$oIndex.is_main_source"] = "OFW status of member #$n (family #$fNum, occupation #" . ($oIndex + 1) . ")";
                }

                // Member Disabilities
                foreach ((array) ($member['disabilities'] ?? []) as $dIndex => $disability) {
                    $attributes["$base.disabilities.$dIndex.disability_type"] = "Disability type of household member #$n (family #$fNum, disability #".($dIndex + 1).")";
                }
            }
        }

        // Toilets
        foreach ((array) $this->input('toilets', []) as $index => $toilet) {
            $attributes["toilets.$index.toilet_type"] = "Toilet type #".($index + 1);
        }

        // Electricity
        foreach ((array) $this->input('electricity_types', []) as $index => $item) {
            $attributes["electricity_types.$index.electricity_type"] = "Electricity type #".($index + 1);
        }

        // Water Sources
        foreach ((array) $this->input('water_source_types', []) as $index => $item) {
            $attributes["water_source_types.$index.water_source_type"] = "Water source type #".($index + 1);
        }

        // Waste Management
        foreach ((array) $this->input('waste_management_types', []) as $index => $item) {
            $attributes["waste_management_types.$index.waste_management_type"] = "Waste management type #".($index + 1);
        }

        // Pets
        foreach ((array) $this->input('pets', []) as $index => $item) {
            $attributes["pets.$index.pet_type"] = "Pet type #".($index + 1);
            $attributes["pets.$index.is_vaccinated"] = "Vaccination status of pet #".($index + 1);
        }

        // Livestocks
        foreach ((array) $this->input('livestocks', []) as $index => $livestock) {
            $n = $index + 1;
            $attributes["livestocks.$index.livestock_type"] = "Livestock type #$n";
            $attributes["livestocks.$index.quantity"] = "Quantity of livestock #$n";
            $attributes["livestocks.$index.purpose"] = "Purpose of livestock #$n";
        }

        return $attributes;
    }

   public function messages()
    {
        $messages = [
            'housenumber.required' => 'The house number is required.',
            'street.required' => 'Please select a street.',
            'purok.required' => 'Please select a purok.',
            'family_name.required' => 'The family name is required.',
            'members.required' => 'At least one household member is required.',

            // Basic member rules
            'members.*.lastname.required' => 'Last name is required for all members.',
            'members.*.firstname.required' => 'First name is required for all members.',
            'members.*.middlename.required' => 'Middle name is required for all members.',
            'members.*.suffix.max' => 'The suffix must not exceed :max characters.',
            'members.*.gender.required' => 'Gender is required for all members.',
            'members.*.birthdate.required' => 'Birthdate is required for all members.',
            'members.*.birthdate.before' => 'Birthdate must be before today.',
            'members.*.email.email' => 'The email address must be valid.',
            'members.*.email.unique' => 'The email has already been taken.',
            'members.*.contact_number.regex' => 'The contact number must be a valid format.',
            'members.*.relation_to_household_head.required' => 'Relation to household head is required.',

            // Nested rules
            'members.*.educations.*.education.required' => 'The education level is required for all education entries.',
            'members.*.educations.*.school_name.required' => 'The school name is required for each education entry.',
            'members.*.educations.*.year_level.required' => 'The year level is required for each education entry.',

            'members.*.occupations.*.employment_status.required' => 'Employment status is required for all occupations.',
            'members.*.occupations.*.occupation_name.required' => 'Occupation name is required for each occupation.',
            'members.*.occupations.*.monthly_income.required' => 'Monthly income is required for each occupation.',

            'members.*.vehicles.*.vehicle_type.required' => 'Each vehicle must have a type.',
            'members.*.vehicles.*.plate_number.required' => 'Each vehicle must have a plate number.',

            'members.*.disabilities.*.disability_type.required_with' => 'Each disability must have a type when present.',
            'members.*.disabilities.*.severity.required' => 'Each disability must have a severity level.',
        ];

        // Dynamic custom messages for nested arrays
        foreach ((array) $this->input('members', []) as $index => $member) {
            $memberNum = $index + 1;

            $nestedRules = [
                'educations'   => ['education', 'school_name', 'year_level'],
                'occupations'  => ['employment_status', 'occupation_name', 'monthly_income'],
                'vehicles'     => ['vehicle_type', 'plate_number'],
                'disabilities' => ['disability_type', 'severity'],
            ];

            foreach ($nestedRules as $relation => $fields) {
                if (!empty($member[$relation])) {
                    foreach ($member[$relation] as $subIndex => $sub) {
                        foreach ($fields as $field) {
                            $messages["members.$index.$relation.$subIndex.$field.required"] =
                                ucfirst(str_replace('_', ' ', $field)) .
                                " is required for member #$memberNum ($relation #" . ($subIndex + 1) . ")";
                        }
                    }
                }
            }
        }

        return $messages;
    }
}
