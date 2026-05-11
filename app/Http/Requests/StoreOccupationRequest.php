<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOccupationRequest extends FormRequest
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
            'resident_id' => ['required', 'exists:residents,id'],
            'employment_status' => [
                'required_with:occupations.*.occupation',
                Rule::in(['employed', 'unemployed', 'under_employed', 'retired', 'student']),
            ],
            'occupations' => ['required', 'array', 'min:1'],
            'occupations.*.occupation' => ['nullable', 'string', 'max:255'],
            'occupations.*.employment_type' => ['nullable', 'in:full_time,part_time,seasonal,contractual,self_employed,under_employed'],
            'occupations.*.occupation_status' => ['required', 'in:active,inactive,ended,retired,terminated,resigned'],
            'occupations.*.work_arrangement' => ['nullable', 'in:remote,on_site,hybrid'],
            'occupations.*.employer' => ['nullable', 'string', 'max:255'],
            'occupations.*.started_at' => ['required', 'digits:4', 'integer'],
            'occupations.*.ended_at' => ['nullable', 'digits:4', 'integer', 'gte:occupations.*.started_at'],
            'occupations.*.income' => ['nullable', 'numeric', 'min:0'],
            'occupations.*.income_frequency' => ['nullable', 'in:daily,bi_weekly,weekly,monthly,annually'],
            'occupations.*.is_ofw' => ['nullable', 'boolean'],
            'occupations.*.is_main_livelihood' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'resident_id.required' => 'Selecting a resident is required.',
            'occupations.required' => 'At least one occupation entry is required.',
            'occupations.*.employment_status.in' => 'Employment status must be one of the allowed values.',

            'occupations.*.occupation.string' => 'Occupation must be a valid string.',
            'occupations.*.occupation.max' => 'Occupation cannot exceed 255 characters.',

            'occupations.*.employment_type.in' => 'Select a valid employment type.',

            'occupations.*.occupation_status.required' => 'Occupation status is required.',
            'occupations.*.occupation_status.in' => 'Occupation status must be valid.',

            'occupations.*.work_arrangement.in' => 'Work arrangement must be remote, on-site, or hybrid.',

            'occupations.*.employer.string' => 'Employer name must be a string.',
            'occupations.*.employer.max' => 'Employer name cannot exceed 255 characters.',

            'occupations.*.started_at.required' => 'Start year is required.',
            'occupations.*.started_at.digits' => 'Start year must be a 4-digit year.',

            'occupations.*.ended_at.digits' => 'End year must be a 4-digit year.',
            'occupations.*.ended_at.gte' => 'End year cannot be earlier than start year.',

            'occupations.*.income.numeric' => 'Income must be a number.',
            'occupations.*.income.min' => 'Income must be zero or more.',

            'occupations.*.income_frequency.in' => 'Choose a valid income frequency.',
            'occupations.*.is_ofw.boolean' => 'OFW status must be true or false.',
            'occupations.*.is_main_livelihood.boolean' => 'Is Main Livelihood status must be true or false.',
        ];
    }

}
