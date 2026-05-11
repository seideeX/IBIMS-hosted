<?php

namespace App\Http\Controllers\BarangayAdmin\MedicalInformation;

use App\Helpers\ActivityLogHelper;
use App\Http\Controllers\Controller;
use App\Models\Allergy;
use App\Http\Requests\StoreAllergyRequest;
use App\Http\Requests\UpdateAllergyRequest;
use App\Models\Purok;
use DB;
use Inertia\Inertia;

class AllergyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $brgy_id = auth()->user()->barangay_id;
        $filters = request()->all();

        $puroks = Purok::where('barangay_id', $brgy_id)
            ->orderBy('purok_number', 'asc')
            ->pluck('purok_number');

        $query = Allergy::query()
            ->selectRaw("
                resident_id,
                GROUP_CONCAT(allergy_name SEPARATOR ', ') AS allergy_name,
                GROUP_CONCAT(reaction_description SEPARATOR '; ') AS reaction_description
            ")
            ->with([
                'resident:id,firstname,lastname,suffix,birthdate,purok_number,sex',
                'resident.medicalInformation:id,resident_id'
            ])
            ->whereHas('resident', function ($q) use ($brgy_id, $filters) {
                $q->where('barangay_id', $brgy_id);

                // 🔹 Filter by Purok
                if (!empty($filters['purok']) && $filters['purok'] !== "All") {
                    $q->where('purok_number', $filters['purok']);
                }

                // 🔹 Filter by Sex
                if (!empty($filters['sex']) && $filters['sex'] !== "All") {
                    $q->where('sex', $filters['sex']);
                }

                // 🔹 Filter by Age Group
                if (!empty($filters['age_group']) && $filters['age_group'] !== "All") {
                    $today = now();

                    switch ($filters['age_group']) {
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
                }
            })->groupBy('resident_id');

        // 🔹 Filter by Allergy Name
        if (!empty($filters['allergy'])) {
            $query->where('allergy_name', 'like', '%' . $filters['allergy'] . '%');
        }

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
                $q->orWhere('allergy_name', 'like', '%' . $search . '%');
                $q->orWhere('reaction_description', 'like', '%' . $search . '%');
            });
        }

        $allergies = $query->paginate(10)->withQueryString();

        // Add numbering based on pagination offset
        $startNumber = ($allergies->currentPage() - 1) * $allergies->perPage() + 1;

        $grouped = $allergies->getCollection()
            ->groupBy('resident_id')
            ->values()
            ->map(function ($items, $index) use ($startNumber) {
                $first = $items->first();

                $first->allergy_name = $items->pluck('allergy_name')->filter()->join(', ');
                $first->reaction_description = $items->pluck('reaction_description')->filter()->join('; ');
                $first->number = $startNumber + $index; // ✅ Add number

                return $first;
            });

        $allergies->setCollection($grouped);
        return Inertia::render("BarangayOfficer/MedicalInformation/Allergy/Index", [
            "allergies" => $allergies,
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
    public function store(StoreAllergyRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Allergy $allergy)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Allergy $allergy)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAllergyRequest $request, Allergy $allergy)
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
            $residentAllergy = Allergy::findOrFail($id);
            $residentAllergy->delete();
            DB::commit();

            ActivityLogHelper::log(
                'Medical Information',
                'delete',
                "Deleted Allergy record ID: {$id} for Resident ID: {$residentAllergy->resident_id}"
            );

            return redirect()
                ->route('allergy.index')
                ->with(
                    'success', 'Allergy deleted successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Allergy could not be deleted: ' . $e->getMessage());
        }
    }
}
