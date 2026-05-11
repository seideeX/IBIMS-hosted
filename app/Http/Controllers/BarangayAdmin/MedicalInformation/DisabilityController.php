<?php

namespace App\Http\Controllers\BarangayAdmin\MedicalInformation;

use App\Http\Controllers\Controller;
use App\Models\Disability;
use App\Http\Requests\StoreDisabilityRequest;
use App\Http\Requests\UpdateDisabilityRequest;
use App\Models\Purok;
use DB;
use Inertia\Inertia;

class DisabilityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $brgy_id = auth()->user()->barangay_id;

        // Fetch puroks for dropdown
        $puroks = Purok::where('barangay_id', $brgy_id)
            ->orderBy('purok_number', 'asc')
            ->pluck('purok_number');

        $query = Disability::query()
            ->with([
                'resident:id,firstname,lastname,suffix,birthdate,purok_number,sex',
                'resident.medicalInformation:id,resident_id,pwd_id_number'
            ])
            ->whereHas('resident', function ($q) use ($brgy_id) {
                $q->where('barangay_id', $brgy_id);
            });

        /**
         * === Filters ===
         */

        // Filter by purok
        if (request()->filled('purok') && request('purok') !== 'All') {
            $query->whereHas('resident', function ($q) {
                $q->where('purok_number', request('purok'));
            });
        }

        // Filter by sex
        if (request()->filled('sex') && request('sex') !== 'All') {
            $query->whereHas('resident', function ($q) {
                $q->where('sex', request('sex'));
            });
        }

        // Filter by age group
        if (request()->filled('age_group') && request('age_group') !== 'All') {
            $today = \Carbon\Carbon::today();

            switch (request('age_group')) {
                case '0_6_months':
                    $max = $today->copy();
                    $min = $today->copy()->subMonths(6);
                    break;

                case '7mos_2yrs':
                    $max = $today->copy()->subMonths(7);
                    $min = $today->copy()->subYears(2);
                    break;

                case '3_5yrs':
                    $max = $today->copy()->subYears(3);
                    $min = $today->copy()->subYears(5);
                    break;

                case '6_12yrs':
                    $max = $today->copy()->subYears(6);
                    $min = $today->copy()->subYears(12);
                    break;

                case '13_17yrs':
                    $max = $today->copy()->subYears(13);
                    $min = $today->copy()->subYears(17);
                    break;

                case '18_59yrs':
                    $max = $today->copy()->subYears(18);
                    $min = $today->copy()->subYears(59);
                    break;

                case '60_above':
                    $max = $today->copy()->subYears(60);
                    $min = null;
                    break;
            }

            $query->whereHas('resident', function ($q) use ($min, $max) {
                if ($min) {
                    $q->whereBetween('birthdate', [$min, $max]);
                } else {
                    $q->where('birthdate', '<=', $max);
                }
            });
        }

        // Filter by disability type
        if (request()->filled('disability_type') && request('disability_type') !== 'All') {
            $query->where('disability_type', request('disability_type'));
        }
        if (request('name')) {
            $search = request('name');
            $query->where(function ($q) use ($search) {
                // Search resident-related fields
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

                // ✅ Search medical condition fields too
                $q->orWhere('disability_type', 'like', '%' . $search . '%');
            });
        }

        /**
         * === Pagination ===
         */
        $disabilities = $query->paginate(10)->withQueryString();

        return Inertia::render("BarangayOfficer/MedicalInformation/Disabilities/Index", [
            'disabilities' => $disabilities,
            'puroks' => $puroks,
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
    public function store(StoreDisabilityRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Disability $disability)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Disability $disability)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDisabilityRequest $request, Disability $disability)
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
            $residentDisability = Disability::findOrFail($id);
            $residentDisability->delete();
            DB::commit();

            return redirect()
                ->route('disability.index')
                ->with(
                    'success', 'Disability deleted successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Disability could not be deleted: ' . $e->getMessage());
        }
    }
}
