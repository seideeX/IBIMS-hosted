<?php


namespace App\Http\Controllers\BarangayAdmin\MedicalInformation;

use App\Helpers\ActivityLogHelper;
use App\Http\Controllers\Controller;
use App\Models\ChildHealthMonitoringRecord;
use App\Http\Requests\StoreChildHealthMonitoringRecordRequest;
use App\Http\Requests\UpdateChildHealthMonitoringRecordRequest;
use App\Models\MedicalInformation;
use App\Models\Purok;
use App\Models\Resident;
use App\Models\ResidentVaccination;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChildHealthMonitoringController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $brgy_id = auth()->user()->barangay_id;

        $query = ChildHealthMonitoringRecord::query()
            ->with(["resident:id,firstname,lastname,middlename,suffix,birthdate,sex,barangay_id,purok_number",
            'resident.medicalInformation:id,resident_id,nutrition_status',
            'resident.vaccinations'])
            ->whereHas('resident', function ($q) use ($brgy_id) {
                $q->where('barangay_id', $brgy_id);
            });

        // ✅ Name search filter
        if (request()->filled('name')) {
            $search = request('name');
            $query->whereHas('resident', function ($qr) use ($search) {
                $qr->whereRaw(
                    "CONCAT(firstname, ' ', COALESCE(middlename,''), ' ', lastname, ' ', COALESCE(suffix,'')) LIKE ?",
                    ["%{$search}%"]
                )
                ->orWhereRaw(
                    "CONCAT(firstname, ' ', lastname) LIKE ?",
                    ["%{$search}%"]
                );
            });
        }

        // ✅ Immunization filter
        if (request()->filled('nutritional_status') && request('nutritional_status') !== 'All') {
            $query->whereHas('resident.medicalInformation', function ($q) {
                $q->where('nutrition_status', request('nutritional_status'));
            });
        }

        // ✅ Purok filter
        if (request()->filled('purok') && request('purok') !== 'All') {
            $query->whereHas('resident', function ($q) {
                $q->where('purok_number', request('purok'));
            });
        }

        // ✅ Sex filter
        if (request()->filled('sex') && request('sex') !== 'All') {
            $query->whereHas('resident', function ($q) {
                $q->where('sex', request('sex'));
            });
        }

        // ✅ Birthdate filter
        if (request()->filled('birthdate')) {
            $query->whereHas('resident', function ($q) {
                $q->whereDate('birthdate', request('birthdate'));
            });
        }

        $children = $query->paginate(10)->withQueryString();

        $puroks = Purok::where('barangay_id', $brgy_id)
            ->orderBy('purok_number', 'asc')
            ->pluck('purok_number');

        return Inertia::render("BarangayOfficer/ChildHealth/Index", [
            'queryParams' => request()->query() ?: null,
            'children' => $children,
            'puroks' => $puroks,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $brgy_id = auth()->user()->barangay_id;

        $residents = Resident::where('barangay_id', $brgy_id)
            ->whereDate('birthdate', '>', now()->subYears(5)) // only 0–5 years old
            ->select(
                'id',
                'firstname',
                'lastname',
                'middlename',
                'suffix',
                'resident_picture_path',
                'sex',
                'birthdate',
                'purok_number'
            )
            ->with([
                'medicalInformation:id,resident_id,weight_kg,height_cm,bmi,nutrition_status',
                'vaccinations'
            ])
            ->get();

        return Inertia::render("BarangayOfficer/ChildHealth/Create", [
            'residents' => $residents
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreChildHealthMonitoringRecordRequest $request)
    {
        $validated = $request->validated();

        try {
            \DB::beginTransaction();

            // ✅ Convert nutrition_status label to DB value
            $nutritionMap = [
                'Normal' => 'normal',
                'Underweight' => 'underweight',
                'Severely Underweight' => 'severely_underweight',
                'Overweight' => 'overweight',
                'Obese' => 'obese',
            ];

            $validated['nutrition_status'] =
                $nutritionMap[$validated['nutrition_status']] ?? $validated['nutrition_status'];

            // ✅ Save to medical_information
            MedicalInformation::updateOrCreate(
                ['resident_id' => $validated['resident_id']],
                [
                    'weight_kg' => $validated['weight_kg'],
                    'height_cm' => $validated['height_cm'],
                    'bmi' => $validated['bmi'] ?? null,
                    'nutrition_status' => $validated['nutrition_status'] ?? null,
                ]
            );

            // ✅ Save to child_health_monitoring_records
            ChildHealthMonitoringRecord::create([
                'resident_id' => $validated['resident_id'],
                'head_circumference' => $validated['head_circumference'] ?? null,
                'developmental_milestones' => $validated['developmental_milestones'] ?? null,
            ]);

            // ✅ Save vaccinations
            if (!empty($validated['vaccinations'])) {
                foreach ($validated['vaccinations'] as $vaccination) {
                    ResidentVaccination::create([
                        'resident_id' => $validated['resident_id'],
                        'vaccine' => $vaccination['vaccine'],
                        'vaccination_date' => $vaccination['vaccination_date'],
                    ]);
                }
            }

            \DB::commit();

            ActivityLogHelper::log(
                'Child Health Monitoring',
                'create',
                "Created Child Health Monitoring record for Resident ID: {$validated['resident_id']}"
            );

            return redirect()
                ->route('child_record.index')
                ->with('success', 'Child health monitoring record saved successfully.');

        } catch (\Exception $e) {
            \DB::rollBack();

            \Log::error('Child Health Monitoring Store Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withInput()
                ->withErrors(['error' => 'An error occurred while saving the record. '. 'Child Health Monitoring Store Error: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(ChildHealthMonitoringRecord $childHealthMonitoringRecord)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $brgy_id = auth()->user()->barangay_id;
        $childHealthMonitoringRecord = ChildHealthMonitoringRecord::findOrFail($id);

        // ✅ Load related resident, medical info, and vaccinations
        $childHealthMonitoringRecord->load([
            'resident' => function ($query) use ($brgy_id) {
                $query->where('barangay_id', $brgy_id)
                    ->select(
                        'id',
                        'firstname',
                        'lastname',
                        'middlename',
                        'suffix',
                        'resident_picture_path',
                        'sex',
                        'birthdate',
                        'purok_number',
                        'barangay_id'
                    )
                    ->with([
                        'medicalInformation:id,resident_id,weight_kg,height_cm,bmi,nutrition_status',
                        'vaccinations:id,resident_id,vaccine,vaccination_date',
                    ]);
            }
        ]);

        return Inertia::render("BarangayOfficer/ChildHealth/Edit", [
            'record' => $childHealthMonitoringRecord,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateChildHealthMonitoringRecordRequest $request, ChildHealthMonitoringRecord $childHealthMonitoringRecord)
    {
        $validated = $request->validated();

        try {
            \DB::beginTransaction();

            $nutritionMap = [
                'Normal' => 'normal',
                'Underweight' => 'underweight',
                'Severely Underweight' => 'severely_underweight',
                'Overweight' => 'overweight',
                'Obese' => 'obese',
            ];

            $validated['nutrition_status'] =
                $nutritionMap[$validated['nutrition_status']] ?? $validated['nutrition_status'];

            // ✅ Update medical_information
            MedicalInformation::updateOrCreate(
                ['resident_id' => $validated['resident_id']],
                [
                    'weight_kg' => $validated['weight_kg'],
                    'height_cm' => $validated['height_cm'],
                    'bmi' => $validated['bmi'] ?? null,
                    'nutrition_status' => $validated['nutrition_status'] ?? null,
                ]
            );

            // ✅ Update child_health_monitoring_record
            $childHealthMonitoringRecord->update([
                'head_circumference' => $validated['head_circumference'] ?? null,
                'developmental_milestones' => $validated['developmental_milestones'] ?? null
            ]);

            // ✅ Sync vaccinations
            if (!empty($validated['vaccinations'])) {
                // Remove old ones
                ResidentVaccination::where('resident_id', $validated['resident_id'])->delete();

                // Insert new ones
                foreach ($validated['vaccinations'] as $vaccination) {
                    ResidentVaccination::create([
                        'resident_id' => $validated['resident_id'],
                        'vaccine' => $vaccination['vaccine'],
                        'vaccination_date' => $vaccination['vaccination_date'],
                    ]);
                }
            }

            \DB::commit();
            ActivityLogHelper::log(
                'Child Health Monitoring',
                'update',
                "Updated Child Health Monitoring record for Resident ID: {$validated['resident_id']}"
            );

            return redirect()
                ->route('child_record.index')
                ->with('success', 'Child health monitoring record updated successfully.');

        } catch (\Exception $e) {
            \DB::rollBack();

            \Log::error('Child Health Monitoring Update Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withInput()
                ->withErrors(['error' => 'An error occurred while updating the record. ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        DB::beginTransaction();

        try {
            $childHealthMonitoringRecord = ChildHealthMonitoringRecord::findOrFail($id);
            ResidentVaccination::where('resident_id', $childHealthMonitoringRecord->resident_id)->delete();
            $childHealthMonitoringRecord->delete();

            DB::commit();
            ActivityLogHelper::log(
                'Child Health Monitoring',
                'delete',
                "Deleted Child Health Monitoring record ID: {$id} for Resident ID: {$childHealthMonitoringRecord->resident_id}"
            );

            return redirect()
                ->route('child_record.index')
                ->with('success', 'Child health monitoring record deleted successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Child health monitoring record could not be deleted: ' . $e->getMessage());
        }
    }
}
