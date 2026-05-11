<?php

namespace App\Http\Controllers\BarangayAdmin\ResidentInformation;

use App\Http\Controllers\Controller;
use App\Models\Livelihood;
use App\Http\Requests\StoreLivelihoodRequest;
use App\Http\Requests\UpdateLivelihoodRequest;
use App\Models\LivelihoodType;
use App\Models\Purok;
use App\Models\Resident;
use DB;
use Inertia\Inertia;

class LivelihoodController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $brgy_id = auth()->user()->barangay_id;

        $query = Livelihood::with([
            'resident:id,firstname,lastname,middlename,suffix,resident_picture_path,birthdate,street_id,barangay_id',
            'resident.street.purok:id,purok_number'
        ])
        ->whereHas('resident', function ($q) use ($brgy_id) {
            $q->where('barangay_id', $brgy_id);
        });

        if ($search = trim(request('name', ''))) {
            $terms = preg_split('/\s+/', $search);

            $query->where(function ($q) use ($terms, $search) {
                // occupation match
                $q->where('livelihood_type', 'like', "%{$search}%")->orWhere('description', 'like', "%{$search}%");
                // OR resident full name match (all terms must appear somewhere in name parts)
                $q->orWhereHas('resident', function ($r) use ($terms) {
                    foreach ($terms as $term) {
                        $r->where(function ($r2) use ($term) {
                            $like = "%{$term}%";
                            $r2->where('firstname', 'like', $like)
                                ->orWhere('middlename', 'like', $like)
                                ->orWhere('lastname', 'like', $like)
                                ->orWhere('suffix', 'like', $like);
                        });
                    }
                });
            });
        }

        // ✅ Proper filtering by purok_number
        if (request()->filled('purok') && request('purok') !== 'All') {
            $query->whereHas('resident.street.purok', function ($q) {
                $q->where('purok_number', request('purok'));
            });
        }

        // ✅ Filter by livelihood_type
        if (request()->filled('livelihood_type') && request('livelihood_type') !== 'All') {
            $query->where('livelihood_type', request('livelihood_type'));
        }

        // ✅ Filter by livelihood_status
        if (request()->filled('livelihood_status') && request('livelihood_status') !== 'All') {
            $query->where('status', request('livelihood_status'));
        }

        // ✅ Filter by is_main
        if (request()->filled('is_main') && request('is_main') !== 'All') {
            $query->where('is_main_livelihood', request('is_main'));
        }

        $livelihoods = $query->paginate(10)->withQueryString();

        $puroks = Purok::where('barangay_id', $brgy_id)
            ->orderBy('purok_number', 'asc')
            ->pluck('purok_number');

        $residents = Resident::where('barangay_id', $brgy_id)
            ->with('street.purok:id,purok_number') // ✅ so residents also carry their purok
            ->select('id', 'firstname', 'lastname', 'middlename', 'suffix', 'resident_picture_path', 'street_id', 'barangay_id', 'birthdate', 'purok_number')
            ->get();

        $livelihood_types = Livelihood::query()->distinct()->pluck('livelihood_type');


        return Inertia::render('BarangayOfficer/Livelihood/Index', [
            'livelihoods' => $livelihoods,
            'puroks' => $puroks,
            'residents' => $residents,
            'queryParams' => request()->query() ?: null,
            'livelihood_types' => $livelihood_types
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
    public function store(StoreLivelihoodRequest $request)
    {
        try {
            $data = $request->validated();

            if (!empty($data['livelihoods']) && is_array($data['livelihoods'])) {
                $resident = Resident::findOrFail($data['resident_id']);
                $normalizedLivelihoods = [];

                foreach ($data['livelihoods'] as $livelihoodData) {
                    $income = $livelihoodData['income'] ?? 0;

                    // Normalize income to monthly
                    $monthlyIncome = match ($livelihoodData['income_frequency']) {
                        'monthly'   => $income,
                        'weekly'    => $income * 4,
                        'bi-weekly' => $income * 2,
                        'daily'     => $income * 22, // assume 22 working days/month
                        'annually'  => $income / 12,
                        default     => null,
                    };

                    $normalizedLivelihoods[] = [
                        'livelihood_type'   => $livelihoodData['livelihood_type'] ?? null,
                        'description'       => $livelihoodData['description'] ?? null,
                        'status'            => $livelihoodData['status'] ?? null,
                        'employer'          => $livelihoodData['employer'] ?? null,
                        'is_main_livelihood'=> $livelihoodData['is_main_livelihood'] ?? false,
                        'started_at'        => $livelihoodData['started_at'] ?? null,
                        'ended_at'          => $livelihoodData['ended_at'] ?? null,
                        'monthly_income'    => $monthlyIncome,
                    ];
                }

                // Save all at once
                $resident->livelihoods()->createMany($normalizedLivelihoods);
            }
            return redirect()
                ->route('livelihood.index')
                ->with('success', 'Livelihood(s) added successfully!');
        } catch (\Exception $e) {
            return back()->with('error', "Livelihood could not be added: " . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Livelihood $livelihood)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Livelihood $livelihood)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateLivelihoodRequest $request, Livelihood $livelihood)
    {
        try {
            $data = $request->validated();
            $livelihoodData = $data['livelihoods'][0] ?? []; // single livelihood update
            $income = $livelihoodData['income'] ?? 0;

            // Normalize income to monthly
            $monthlyIncome = match ($livelihoodData['income_frequency'] ?? null) {
                'monthly'   => $income,
                'weekly'    => $income * 4,
                'bi-weekly' => $income * 2,
                'daily'     => $income * 22, // assume 22 working days/month
                'annually'  => $income / 12,
                default     => null,
            };

            $livelihood->update([
                'livelihood_type'    => $livelihoodData['livelihood_type'] ?? $livelihood->livelihood_type,
                'description'        => $livelihoodData['description'] ?? $livelihood->description,
                'status'             => $livelihoodData['status'] ?? $livelihood->status,
                'employer'           => $livelihoodData['employer'] ?? $livelihood->employer,
                'is_main_livelihood' => $livelihoodData['is_main_livelihood'] ?? $livelihood->is_main_livelihood,
                'started_at'         => $livelihoodData['started_at'] ?? $livelihood->started_at,
                'ended_at'           => $livelihoodData['ended_at'] ?? $livelihood->ended_at,
                'monthly_income'     => $monthlyIncome,
            ]);
            return  back()->with('success', 'Livelihood updated successfully!');
        } catch (\Exception $e) {
            return back()->with('error', "Livelihood could not be updated: " . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Livelihood $livelihood)
    {
        DB::beginTransaction();

        try {
            $livelihood->delete();

            DB::commit();

            return back()->with('success', 'Livelihood deleted successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', "Failed to delete livelihood: " . $e->getMessage());
        }
    }

    public function livelihoodDetails($id)
    {
        $livelihood = Livelihood::with([
            'resident:id,firstname,lastname,middlename,suffix,purok_number,resident_picture_path,birthdate,barangay_id'
        ])->findOrFail($id);

        return response()->json([
            'livelihood' => $livelihood,
        ]);
    }
}
