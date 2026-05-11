<?php

namespace App\Http\Controllers\BarangayAdmin\MedicalInformation;

use App\Helpers\ActivityLogHelper;
use App\Http\Controllers\Controller;
use App\Models\Purok;
use App\Models\ResidentMedication;
use App\Http\Requests\StoreResidentMedicationRequest;
use App\Http\Requests\UpdateResidentMedicationRequest;
use DB;
use Inertia\Inertia;

class ResidentMedicationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $brgy_id = auth()->user()->barangay_id;

        $puroks = Purok::where('barangay_id', $brgy_id)
            ->orderBy('purok_number', 'asc')
            ->pluck('purok_number');

        $query = ResidentMedication::query()
            ->with([
                'resident:id,firstname,lastname,suffix,birthdate,purok_number,sex',
                'resident.medicalInformation:id,resident_id'
            ])
            ->whereHas('resident', function ($q) use ($brgy_id) {
                $q->where('barangay_id', $brgy_id);

            });

        if (request('name')) {
            $search = request('name');
            $query->where(function ($q) use ($search) {
                // Search resident fields
                $q->whereHas('resident', function ($sub) use ($search) {
                    $sub->where(function ($r) use ($search) {
                        $r->where('firstname', 'like', '%' . $search . '%')
                            ->orWhere('lastname', 'like', '%' . $search . '%')
                            ->orWhere('middlename', 'like', '%' . $search . '%')
                            ->orWhere('suffix', 'like', '%' . $search . '%')
                            ->orWhereRaw("CONCAT(firstname, ' ', lastname) LIKE ?", ['%' . $search . '%'])
                            ->orWhereRaw("CONCAT(firstname, ' ', middlename, ' ', lastname) LIKE ?", ['%' . $search . '%'])
                            ->orWhereRaw("CONCAT(firstname, ' ', middlename, ' ', lastname, ' ', suffix) LIKE ?", ['%' . $search . '%']);
                    });
                });

                // Search medications
                $q->orWhere('medication', 'like', '%' . $search . '%');
            });
        }

        // ✅ Filters
        if ($purok = request('purok')) {
            $query->whereHas('resident', fn($q) => $q->where('purok_number', $purok));
        }

        if ($sex = request('sex')) {
            $query->whereHas('resident', fn($q) => $q->where('sex', $sex));
        }

        if ($ageGroup = request('age_group')) {
            $query->whereHas('resident', function ($q) use ($ageGroup) {
                                    $today = now();
                    switch (request('age_group')) {
                        case '0_6_months':
                            $q->whereBetween('birthdate', [
                                $today->copy()->subMonths(6),
                                $today,
                            ]);
                            break;

                        case '7mos_2yrs':
                            $q->whereBetween('birthdate', [
                                $today->copy()->subYears(2),
                                $today->copy()->subMonths(7),
                            ]);
                            break;

                        case '3_5yrs':
                            $q->whereBetween('birthdate', [
                                $today->copy()->subYears(5),
                                $today->copy()->subYears(3),
                            ]);
                            break;

                        case '6_12yrs':
                            $q->whereBetween('birthdate', [
                                $today->copy()->subYears(12),
                                $today->copy()->subYears(6),
                            ]);
                            break;

                        case '13_17yrs':
                            $q->whereBetween('birthdate', [
                                $today->copy()->subYears(17),
                                $today->copy()->subYears(13),
                            ]);
                            break;

                        case '18_59yrs':
                            $q->whereBetween('birthdate', [
                                $today->copy()->subYears(59),
                                $today->copy()->subYears(18),
                            ]);
                            break;

                        case '60_above':
                            $q->where('birthdate', '<=', $today->copy()->subYears(60));
                            break;
                    }
            });
        }

        if ($medication = request('medication')) {
            if ($medication !== 'All') {
                $query->where('medication_name', $medication);
            }
        }

        if ($startDate = request('start_date')) {
            $query->whereDate('start_date', '>=', $startDate);
        }

        if ($endDate = request('end_date')) {
            $query->whereDate('end_date', '<=', $endDate);
        }

        $medications = $query->paginate(10)->withQueryString();

        return Inertia::render("BarangayOfficer/MedicalInformation/Medication/Index", [
            "medications" => $medications,
            "puroks" => $puroks,
            'queryParams' => request()->query() ?: null,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreResidentMedicationRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(ResidentMedication $residentMedication)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ResidentMedication $residentMedication)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateResidentMedicationRequest $request, ResidentMedication $residentMedication)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $residentMedication = ResidentMedication::findOrFail($id);
            $residentMedication->delete();
            DB::commit();

            ActivityLogHelper::log(
                'Medical Information',
                'delete',
                "Deleted Medication record ID: {$id} for Resident ID: {$residentMedication->resident_id}"
            );

            return redirect()
                ->route('medication.index')
                ->with(
                    'success', 'Medication deleted successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Medication could not be deleted: ' . $e->getMessage());
        }
    }
}
