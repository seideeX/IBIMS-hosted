<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreResidentRequest extends FormRequest
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
        $rules =  [
            // SECTION 1: Personal Information
            'resident_image' => ['nullable', 'image', 'max:5120'], // 5MB max
            'lastname' => ['required', 'string', 'max:55'],
            'firstname' => ['required', 'string', 'max:55'],
            'middlename' => ['nullable', 'string', 'max:55'],
            'suffix' => ['nullable', Rule::in(['Jr.', 'Sr.', 'I', 'II', 'III', 'IV'])],
            'birthdate' => ['required', 'date', 'before:today'],
            'birthplace' => ['required', 'string', 'max:150'],
            'civil_status' => ['required', Rule::in(['single', 'married', 'widowed', 'divorced', 'separated', 'annulled'])],
            'sex' => ['required', Rule::in(['male', 'female'])],
            'gender' => ['required', 'string', 'max:55'],
            'maiden_middle_name' => ['nullable', 'string', 'max:100'],
            'citizenship' => ['required', 'string', 'max:55'],
            'religion' => ['required', 'string', 'max:55'],
            'ethnicity' => ['nullable', 'string', 'max:55'],
            'contactNumber' => ['nullable', 'string', 'max:15'],
            'email' => ['nullable','email','min:10','max:55','unique:residents,email'],
            'residency_type' => ['nullable', Rule::in(['permanent', 'temporary', 'immigrant'])],
            'residency_date' => ['nullable', 'digits:4', 'integer', 'min:1900', 'max:' . now()->year],
            'is_household_head' => ['required', Rule::in([0, 1])],
            'is_family_head' => ['required', Rule::in([0, 1])],
            'is_4ps_beneficiary' => ['nullable', Rule::in([0, 1])],
            'is_solo_parent' => ['nullable', Rule::in([0, 1])],
            'solo_parent_id_number' => ['nullable', 'string', 'max:55'],
            'purok_number' => ['required', 'integer'],
            'philsys_card_number' => ['nullable', 'max:16'],
            'purok_id' => ['nullable', 'exists:puroks,id'],
            'registered_voter' => ['nullable', Rule::in([0, 1])],
            'registered_barangay' => ['nullable', 'exists:barangays,id'],
            'voting_status' => ['nullable', Rule::in(['active', 'inactive', 'disqualified', 'medical', 'overseas', 'detained', 'deceased'])],
            'voter_id_number' => ['nullable', 'string', 'max:55'],
            'is_pensioner' => ['nullable', Rule::in(['yes', 'no', 'pending'])],
            'pension_type' => ['nullable', Rule::in(['SSS', 'GSIS', 'DSWD', 'private', 'none'])],
            'osca_id_number' => ['nullable', 'string', 'max:55'],
            'living_alone' => ['nullable', Rule::in([0, 1])],
            'verified' => ['required', Rule::in([0, 1])],

            // SECTION 1.1: Vehicle Information
            'has_vehicle' => ['nullable', Rule::in([1, 0])],
            'vehicles' => ['nullable', 'array'],
            'vehicles.*.vehicle_type' => ['nullable', 'string', 'max:55'],
            'vehicles.*.vehicle_class' => ['nullable', 'string', 'max:55'],
            'vehicles.*.usage_status' => ['nullable', 'string', 'max:55'],
            'vehicles.*.is_registered' => ['nullable', Rule::in([1, 0])],


            // SECTION 2: Educational Information
            'educational_histories' => ['nullable', 'array'],
            'educational_histories.*.school_name'        => ['nullable', 'string', 'max:155'],
            'educational_histories.*.school_type'        => ['nullable', Rule::in(['public', 'private'])],
            'educational_histories.*.education'      => ['nullable', Rule::in([
                'no_education_yet','no_formal_education','prep_school','kindergarten','elementary',
                'high_school','senior_high_school','college','als','tesda','vocational','post_graduate',
            ])],
            'educational_histories.*.education_status'   => ['nullable', Rule::in(['graduated', 'incomplete', 'enrolled', 'dropped_out'])],
            'educational_histories.*.year_started'       => ['nullable', 'digits:4', 'integer', 'min:1900', 'max:' . now()->year],
            'educational_histories.*.year_ended'         => ['nullable', 'digits:4', 'integer', 'min:1900', 'max:' . now()->year],
            'educational_histories.*.program'            => ['nullable', 'string', 'max:100'],

            // SECTION 3: Occupational Information
            'occupations' => ['nullable', 'array'],
            'employment_status' => [
                'required_with:occupations.*.occupation',
                Rule::in(['employed', 'unemployed', 'student','child','retired','homemaker', 'not_applicable']),
            ],
            'occupations.*.occupation' => ['nullable', 'string', 'max:100'],
            'occupations.*.employment_type' => [
                'nullable',
                Rule::in(['full_time', 'part_time', 'seasonal', 'contractual', 'self_employed', 'under_employed']),
            ],
            'occupations.*.occupation_status' => [
                'nullable',
                Rule::in(['active', 'inactive', 'ended', 'retired', 'terminated', 'resigned']),
            ],
            'occupations.*.work_arrangement' => [
                'nullable',
                Rule::in(['remote', 'on_site', 'hybrid']),
            ],
            'occupations.*.employer' => ['nullable', 'string', 'max:255'],
            'occupations.*.started_at' => ['nullable', 'integer', 'min:1900', 'max:' . now()->year],
            'occupations.*.ended_at' => ['nullable', 'integer', 'min:1900', 'max:' . now()->year],
            'occupations.*.income' => ['nullable', 'numeric', 'min:0'],
            'occupations.*.income_frequency' => ['nullable',  Rule::in(['weekly', 'monthly', 'annually', 'daily', 'bi_weekly'])],
            'occupations.*.is_main_livelihood' => ['nullable', 'boolean'],
            'occupations.*.is_ofw' => ['nullable', 'boolean'],

            // SECTION 4: Health Information
            'weight_kg' => ['nullable', 'numeric', 'min:0', 'max:300'],
            'height_cm' => ['nullable', 'numeric', 'min:0', 'max:500'],
            'bmi' => ['nullable', 'numeric'],
            'nutrition_status' => ['nullable', Rule::in([
                'normal', 'underweight', 'severly_underweight', 'overweight', 'obese'
            ])],

            'emergency_contact_number' => ['nullable', 'string', 'max:11'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_relationship' => ['nullable', 'string', 'max:100'],
            'blood_type' => ['nullable', Rule::in([
                'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
            ])],

            'has_philhealth' => ['nullable', Rule::in([0, 1])],
            'philhealth_id_number' => ['nullable', 'string', 'max:50'],

            'is_alcohol_user' => ['nullable', Rule::in([0, 1])],
            'is_smoker' => ['nullable', Rule::in([0, 1])],

            'is_pwd' => ['nullable', Rule::in([0, 1])],
            'pwd_id_number' => ['required_if:is_pwd,1', 'nullable', 'string', 'max:15'],

            'disabilities' => ['required_if:is_pwd,1', 'array'],
            'disabilities.*.disability_type' => ['required_with:disabilities', 'string', 'max:100'],

            // SECTION 5: Housing Information
            'housenumber' => ['nullable', 'string', 'max:100'],
            'new_housenumber' => ['nullable', 'integer', 'min:1', 'max:9999'],
            'street_id' => ['nullable', 'exists:streets,id'],
            'subdivision' => ['nullable', 'string', 'max:100'],
            'relationship_to_head' => ['nullable', 'string', 'max:100'],
            'household_position' => ['nullable', 'string', 'max:100'],
        ];
        return $rules;
    }
    public function attributes()
    {
        $attributes = [];

        foreach ($this->input('occupations', []) as $index => $occupation) {
            $attributes["occupations.$index.occupation"] = "Occupation #".($index + 1);
            $attributes["occupations.$index.employer"] = "Employer Name #".($index + 1);
            $attributes["occupations.$index.employment_type"] = "Employment Type #".($index + 1);
            $attributes["occupations.$index.occupation_status"] = "Occupation Status #".($index + 1);
            $attributes["occupations.$index.work_arrangement"] = "Work Arrangement #".($index + 1);
            $attributes["occupations.$index.started_at"] = "Started At #".($index + 1);
            $attributes["occupations.$index.ended_at"] = "Ended At #".($index + 1);
            $attributes["occupations.$index.income"] = "Income #".($index + 1);
            $attributes["occupations.$index.income_frequency"] = "Income Frequency #".($index + 1);
            // Add others as needed
        }

        foreach ($this->input('educational_histories', []) as $index => $occupation) {
            $attributes["educational_histories.$index.school_name"] = "School Name #".($index + 1);
            $attributes["educational_histories.$index.school_type"] = "School Type #".($index + 1);
            $attributes["educational_histories.$index.education"] = "Education #".($index + 1);
            $attributes["educational_histories.$index.education_status"] = "Education Status #".($index + 1);
            $attributes["educational_histories.$index.year_started"] = "Year Started #".($index + 1);
            $attributes["educational_histories.$index.year_ended"] = "Year Ended #".($index + 1);
            $attributes["educational_histories.$index.program"] = "Program #".($index + 1);
            // Add others as needed
        }

        // Disabilities
        foreach ((array) $this->input('disabilities', []) as $index => $disability) {
            $num = $index + 1;
            $attributes["disabilities.$index.disability_type"] = "Disability Type #$num";
        }

        // Livestock and Pets
        foreach ((array) $this->input('livestocks', []) as $index => $disability) {
            $num = $index + 1;
            $attributes["livestocks.$index.livestock_type"] = "Livestock Type #$num";
        }
        foreach ((array) $this->input('pets', []) as $index => $disability) {
            $num = $index + 1;
            $attributes["pets.$index.pet_type"] = "Pet Type #$num";
        }
        return $attributes;
    }

}
