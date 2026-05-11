<?php

namespace App\Http\Controllers\BarangayAdmin\MedicalInformation;
use App\Helpers\ActivityLogHelper;
use App\Http\Controllers\Controller;
use App\Models\Allergy;
use App\Models\MedicalInformation;
use App\Http\Requests\StoreMedicalInformationRequest;
use App\Http\Requests\UpdateMedicalInformationRequest;
use App\Models\Purok;
use App\Models\Resident;
use Inertia\Inertia;

class MedicalInformationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $brgy_id = auth()->user()->barangay_id;

        $query = MedicalInformation::query()
            ->with([
                'resident:id,firstname,middlename,lastname,suffix,purok_number,barangay_id,sex',
                'resident.disabilities'
            ])
            ->whereHas('resident', function ($q) use ($brgy_id) {
                $q->where('barangay_id', $brgy_id)->where('is_deceased', false);
            });

        // 🔹 Fetch puroks in the barangay
        $puroks = Purok::where('barangay_id', $brgy_id)
            ->orderBy('purok_number', 'asc')
            ->pluck('purok_number');

        // 🔹 Fetch residents list for dropdowns, etc.
        $residents = Resident::where('barangay_id', $brgy_id)
            ->select('id', 'firstname', 'lastname', 'middlename', 'suffix', 'resident_picture_path', 'purok_number', 'birthdate')
            ->get();

        // ------------------- FILTERS -------------------
        if (request('name')) {
            $search = request('name');
            $query->whereHas('resident', function ($q) use ($search) {
                $q->where('firstname', 'like', '%' . $search . '%')
                    ->orWhere('lastname', 'like', '%' . $search . '%')
                    ->orWhere('middlename', 'like', '%' . $search . '%')
                    ->orWhere('suffix', 'like', '%' . $search . '%')
                    ->orWhereRaw("CONCAT(firstname, ' ', lastname) LIKE ?", ['%' . $search . '%'])
                    ->orWhereRaw("CONCAT(firstname, ' ', middlename, ' ', lastname) LIKE ?", ['%' . $search . '%'])
                    ->orWhereRaw("CONCAT(firstname, ' ', middlename, ' ', lastname, ' ', suffix) LIKE ?", ['%' . $search . '%']);
            });
        }

        // 🔹 Filter by purok (resident table)
        if (request()->filled('purok') && request('purok') !== 'All') {
            $query->whereHas('resident', function ($q) {
                $q->where('purok_number', request('purok'));
            });
        }

        if (request()->filled('sex') && request('sex') !== 'All') {
            $query->whereHas('resident', function ($q) {
                $q->where('sex', request('sex'));
            });
        }

        if (request()->filled('is_pwd') && request('is_pwd') !== 'All') {
            $query->whereHas('resident', function ($q) {
                $q->where('is_pwd', request('is_pwd'));
            });
        }

        // 🔹 Filter by blood type
        if (request()->filled('blood_type') && request('blood_type') !== 'All') {
            $query->where('blood_type',  request('blood_type'));
        }

        // 🔹 Filter by nutritional status
        if (request()->filled('nutritional_status') && request('nutritional_status') !== 'All') {
            $query->where('nutrition_status', request('nutritional_status'));
        }

        // 🔹 Filter by smoker
        if (request()->filled('is_smoker') && request('is_smoker') !== 'All') {
            $query->where('is_smoker', request('is_smoker'));
        }

        // 🔹 Filter by alcohol user
        if (request()->filled('alcohol_user') && request('alcohol_user') !== 'All') {
            $query->where('is_alcohol_user', request('alcohol_user'));
        }

        // 🔹 Filter by PhilHealth
        if (request()->filled('has_philhealth') && request('has_philhealth') !== 'All') {
            $query->where('has_philhealth', request('has_philhealth'));
        }

        // ------------------- PAGINATION -------------------
        $medical_information = $query->paginate(10)->withQueryString();

        return Inertia::render("BarangayOfficer/MedicalInformation/Index", [
            'medical_information' => $medical_information,
            'queryParams' => request()->query() ?: null,
            'puroks' => $puroks,
            'residents' => $residents,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $brgy_id = auth()->user()->barangay_id;
        // 🔹 Fetch puroks in the barangay
        $puroks = Purok::where('barangay_id', $brgy_id)
            ->orderBy('purok_number', 'asc')
            ->pluck('purok_number');

        // 🔹 Fetch residents list for dropdowns, etc.
        $residents = Resident::where('barangay_id', $brgy_id)
        ->whereDoesntHave('medicalInformation') // no record in medical_informations
        ->select('id', 'firstname', 'lastname', 'middlename', 'suffix', 'resident_picture_path', 'purok_number', 'sex','birthdate')
        ->get();

        return Inertia::render("BarangayOfficer/MedicalInformation/Create", [
            'puroks' => $puroks,
            'residents' => $residents,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMedicalInformationRequest $request)
    {
        try {
            $data = $request->validated();
            $resident = Resident::findOrFail($data['resident_id']);
            $residentMedicalInformation = [
                'weight_kg' => $data['weight_kg'] ?? 0,
                'height_cm' => $data['height_cm'] ?? 0,
                'bmi' => $data['bmi'] ?? 0,
                'nutrition_status' => $data['nutrition_status'] ?? null,
                'emergency_contact_number' => $data['emergency_contact_number'] ?? null,
                'emergency_contact_name' => $data['emergency_contact_name'] ?? null,
                'emergency_contact_relationship' => $data['emergency_contact_relationship'] ?? null,
                'is_smoker' => $data['is_smoker'] ?? 0,
                'is_alcohol_user' => $data['is_alcohol_user'] ?? 0,
                'blood_type' => $data['blood_type'] ?? null,
                'has_philhealth' => $data['has_philhealth'] ?? 0,
                'philhealth_id_number' => $data['philhealth_id_number'] ?? null,
                'pwd_id_number'  => $data['pwd_id_number'] ?? null,
            ];

            // save medical info
            $resident->medicalInformation()->create($residentMedicalInformation);
            // save disabilities if resident is PWD
            if (!empty($data['is_pwd']) && $data['is_pwd'] == '1') {
                foreach ($data['disabilities'] ?? [] as $disability) {
                    $resident->disabilities()->create([
                        'disability_type' => $disability['disability_type'] ?? null,
                    ]);
                }
            }

            // allergy
            if (!empty($data['allergies'])) {
                foreach ($data['allergies'] ?? [] as $allergy) {
                    $resident->allergies()->create([
                        'allergy_name' => $allergy['allergy_name'] ?? null,
                        'reaction_description' => $allergy['reaction_description'] ?? null,
                    ]);
                }
            }

            // medications
            if (!empty($data['medications'])) {
                foreach ($data['medications'] ?? [] as $medic) {
                    $resident->medications()->create([
                        'medication' => $medic['medication'] ?? null,
                        'start_date' => $medic['start_date'] ?? null,
                        'end_date' => $medic['end_date'] ?? null,
                    ]);
                }
            }

            // medical information
            if (!empty($data['medical_conditions'])) {
                foreach ($data['medical_conditions'] ?? [] as $condition) {
                    $resident->medicalConditions()->create([
                        'condition' => $condition['condition'] ?? null,
                        'status' => $condition['status'] ?? null,
                        'diagnosed_date' => $condition['diagnosed_date'] ?? null,
                        'resolved_date' => $condition['resolved_date'] ?? null,
                    ]);
                }
            }

            // vaccinations
            if (!empty($data['vaccinations'])) {
                foreach ($data['vaccinations'] ?? [] as $vaccine) {
                    $resident->vaccinations()->create([
                        'vaccine' => $vaccine['vaccine'] ?? null,
                        'vaccination_date' => $vaccine['vaccination_date'] ?? null,
                    ]);
                }
            }
            ActivityLogHelper::log(
                'Medical Information',
                'create',
                "Created Medical Information for Resident ID: {$data['resident_id']}"
            );
            return redirect()
                ->route('medical.index')
                ->with('success', 'Medical Information saved successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'An error occurred while saving medical information: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(MedicalInformation $medicalInformation)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $medicalInformation = MedicalInformation::with([
            'resident:id,firstname,middlename,lastname,suffix,purok_number,barangay_id,birthdate,sex',
            'resident.disabilities',
            'resident.allergies',
            'resident.medicalConditions',
            'resident.medications',
            'resident.vaccinations',
        ])->findOrFail($id);

        return Inertia::render("BarangayOfficer/MedicalInformation/Edit", [
            'res_med_info' => $medicalInformation
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMedicalInformationRequest $request, $id)
    {
        try {
            $data = $request->validated();

            $medicalInformation = MedicalInformation::findOrFail($id);
            $resident = $medicalInformation->resident;

            // Update medical info
            $medicalInformation->update([
                'weight_kg' => $data['weight_kg'] ?? 0,
                'height_cm' => $data['height_cm'] ?? 0,
                'bmi' => $data['bmi'] ?? 0,
                'nutrition_status' => $data['nutrition_status'] ?? null,
                'emergency_contact_number' => $data['emergency_contact_number'] ?? null,
                'emergency_contact_name' => $data['emergency_contact_name'] ?? null,
                'emergency_contact_relationship' => $data['emergency_contact_relationship'] ?? null,
                'is_smoker' => $data['is_smoker'] ?? 0,
                'is_alcohol_user' => $data['is_alcohol_user'] ?? 0,
                'blood_type' => $data['blood_type'] ?? null,
                'has_philhealth' => $data['has_philhealth'] ?? 0,
                'philhealth_id_number' => $data['philhealth_id_number'] ?? null,
                'pwd_id_number'  => $data['pwd_id_number'] ?? null,
            ]);

            // ---- Handle related records ----
            // Clear old relationships to prevent duplicates
            $resident->disabilities()->delete();
            $resident->allergies()->delete();
            $resident->medications()->delete();
            $resident->medicalConditions()->delete();
            $resident->vaccinations()->delete();

            // Disabilities
            if (!empty($data['is_pwd']) && $data['is_pwd'] == '1') {
                foreach ($data['disabilities'] ?? [] as $disability) {
                    $resident->disabilities()->create([
                        'disability_type' => $disability['disability_type'] ?? null,
                    ]);
                }
            }

            // Allergies
            if (!empty($data['allergies'])) {
                foreach ($data['allergies'] as $allergy) {
                    $resident->allergies()->create([
                        'allergy_name' => $allergy['allergy_name'] ?? null,
                        'reaction_description' => $allergy['reaction_description'] ?? null,
                    ]);
                }
            }

            // Medications
            if (!empty($data['medications'])) {
                foreach ($data['medications'] as $medic) {
                    $resident->medications()->create([
                        'medication' => $medic['medication'] ?? null,
                        'start_date' => $medic['start_date'] ?? null,
                        'end_date' => $medic['end_date'] ?? null,
                    ]);
                }
            }

            // Medical Conditions
            if (!empty($data['medical_conditions'])) {
                foreach ($data['medical_conditions'] as $condition) {
                    $resident->medicalConditions()->create([
                        'condition' => $condition['condition'] ?? null,
                        'status' => $condition['status'] ?? null,
                        'diagnosed_date' => $condition['diagnosed_date'] ?? null,
                        'resolved_date' => $condition['resolved_date'] ?? null,
                    ]);
                }
            }

            // Vaccinations
            if (!empty($data['vaccinations'])) {
                foreach ($data['vaccinations'] as $vaccine) {
                    $resident->vaccinations()->create([
                        'vaccine' => $vaccine['vaccine'] ?? null,
                        'vaccination_date' => $vaccine['vaccination_date'] ?? null,
                    ]);
                }
            }
            ActivityLogHelper::log(
                'Medical Information',
                'update',
                "Updated Medical Information for Resident ID: {$data['resident_id']}"
            );

            return redirect()
                ->route('medical.index')
                ->with('success', 'Medical Information updated successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'An error occurred while updating medical information: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $medicalInformation = MedicalInformation::findOrFail($id);

            $resident = $medicalInformation->resident;

            // Optional: delete related records if you want a full cleanup
            $resident->disabilities()->delete();
            $resident->allergies()->delete();
            $resident->medications()->delete();
            $resident->medicalConditions()->delete();
            $resident->vaccinations()->delete();

            // Delete the medical information itself
            $medicalInformation->delete();

            ActivityLogHelper::log(
                'Medical Information',
                'delete',
                "Deleted Medical Information for Resident ID: {$resident->id}"
            );

            return redirect()
                ->route('medical.index')
                ->with('success', 'Medical Information deleted successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'An error occurred while deleting medical information: ' . $e->getMessage());
        }
    }
}
