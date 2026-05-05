<?php

namespace App\Http\Controllers\BarangayAdmin\ResidentInformation;

use App\Helpers\ActivityLogHelper;
use App\Http\Controllers\Controller;
use App\Http\Resources\ResidentResource;
use App\Models\Family;
use App\Http\Requests\StoreFamilyRequest;
use App\Http\Requests\UpdateFamilyRequest;
use App\Models\FamilyRelation;
use App\Models\Household;
use App\Models\HouseholdResident;
use App\Models\Purok;
use App\Models\Resident;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class FamilyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $barangayId = auth()->user()->barangay_id;
        $request = request();

        $puroks = Cache::rememberForever("puroks_{$barangayId}", function () use ($barangayId) {
            return Purok::where('barangay_id', $barangayId)
                ->orderBy('purok_number')
                ->pluck('purok_number');
        });

        $query = Family::query()
            ->where('barangay_id', $barangayId)
            ->withCount([
                'members as family_member_count' => function ($q) use ($barangayId) {
                    $q->where('barangay_id', $barangayId);
                }
            ])
            ->with([
                'household:id,barangay_id,purok_id,street_id,house_number',
                'household.purok:id,barangay_id,purok_number',
                'household.street:id,purok_id,street_name',
                'latestHead:id,family_id,firstname,middlename,lastname,street_id,purok_number,resident_picture_path,is_family_head',
                'latestHead.street:id,purok_id,street_name',
                'latestHead.street.purok:id,purok_number',
            ]);

        /*
        |--------------------------------------------------------------------------
        | Filters
        |--------------------------------------------------------------------------
        */

        if ($value = $request->get('name')) {
            $like = "%{$value}%";

            $query->where(function ($q) use ($like) {
                $q->where('family_name', 'like', $like)
                    ->orWhereHas('latestHead', function ($sub) use ($like) {
                        $sub->where('firstname', 'like', $like)
                            ->orWhere('middlename', 'like', $like)
                            ->orWhere('lastname', 'like', $like);
                    })
                    ->orWhereHas('household', function ($sub) use ($like) {
                        $sub->where('house_number', 'like', $like);
                    });
            });
        }

        if (($value = $request->get('purok')) && $value !== 'All') {
            $query->whereHas('household.purok', function ($q) use ($value) {
                $q->where('purok_number', $value);
            });
        }

        if (($value = $request->get('famtype')) && $value !== 'All') {
            $query->where('family_type', $value);
        }

        if (($value = $request->get('income_bracket')) && $value !== 'All') {
            $query->where('income_bracket', $value);
        }

        if (($value = $request->get('household_head')) && $value !== 'All') {
            $boolValue = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

            if (!is_null($boolValue)) {
                $query->whereHas('latestHead.householdResidents', function ($q) use ($boolValue) {
                    $q->where('is_household_head', $boolValue);
                });
            }
        }


        $families = $query
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('BarangayOfficer/Family/Index', [
            'families' => $families,
            'queryParams' => $request->query() ?: null,
            'puroks' => $puroks,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $barangayId = auth()->user()->barangay_id;

        $members = Resident::with('latestHousehold:household_id,house_number')
        ->where('barangay_id', $barangayId)
        ->where('is_deceased', false) // filter by barangay
        ->select('id', 'household_id', 'purok_number', 'resident_picture_path', 'firstname', 'middlename', 'lastname', 'birthdate', 'barangay_id')->with('household:id,barangay_id,house_number')
        ->get();

        $households = Household::query()
            ->where('barangay_id', $barangayId)
            ->select('id', 'barangay_id', 'house_number')
            ->with([
                'latestHouseholdHead.resident:id,firstname,middlename,lastname,suffix'
            ])
            ->get();

        return Inertia::render('BarangayOfficer/Family/Create', [
            'members' => $members,
            'households' => $households
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    // public function store(StoreFamilyRequest $request)
    // {
    //     $data = $request->validated();

    //     // Head = family head
    //     $headResidentId = $data['resident_id'];
    //     $headResident = Resident::with('occupations')->findOrFail($headResidentId);

    //     $headHouseholdResident = HouseholdResident::where('resident_id', $headResidentId)->first();

    //     if (!$headHouseholdResident || !$headHouseholdResident->household_id) {
    //         return back()
    //             ->withErrors([
    //                 'resident_id' => 'Selected family head must be assigned to a household first.',
    //             ])
    //             ->withInput();
    //     }

    //     try {
    //         DB::beginTransaction();

    //         $members = $data['members'] ?? [];
    //         $householdId = $headHouseholdResident->household_id;

    //         // Combine head and members
    //         $allResidentIds = collect($members)
    //             ->pluck('resident_id')
    //             ->push($headResidentId)
    //             ->filter()
    //             ->unique();

    //         // Load all residents with active occupations
    //         $residents = Resident::with([
    //             'occupations' => function ($q) {
    //                 $q->whereNull('ended_at')
    //                     ->orWhere('ended_at', '>=', now());
    //             }
    //         ])->whereIn('id', $allResidentIds)->get();

    //         // Compute average income
    //         $avgIncome = $residents
    //             ->flatMap(fn($r) => $r->occupations)
    //             ->pluck('monthly_income')
    //             ->filter()
    //             ->avg() ?? 0;

    //         // Determine income levels
    //         $incomeBracket = match (true) {
    //             $avgIncome < 5000 => 'below_5000',
    //             $avgIncome <= 10000 => '5001_10000',
    //             $avgIncome <= 20000 => '10001_20000',
    //             $avgIncome <= 40000 => '20001_40000',
    //             $avgIncome <= 70000 => '40001_70000',
    //             $avgIncome <= 120000 => '70001_120000',
    //             default => 'above_120001',
    //         };

    //         $incomeCategory = match (true) {
    //             $avgIncome <= 10000 => 'survival',
    //             $avgIncome <= 20000 => 'poor',
    //             $avgIncome <= 40000 => 'low_income',
    //             $avgIncome <= 70000 => 'lower_middle_income',
    //             $avgIncome <= 120000 => 'middle_income',
    //             $avgIncome <= 200000 => 'upper_middle_income',
    //             default => 'above_high_income',
    //         };

    //         // Delete any old family linked to this head (avoid duplicates)
    //         $headHouseholdResident->family?->delete();

    //         // Create new family record
    //         $family = Family::create([
    //             'barangay_id'     => $headResident->barangay_id,
    //             'household_id'    => $householdId,
    //             'income_bracket'  => $incomeBracket,
    //             'income_category' => $incomeCategory,
    //             'family_type'     => $data['family_type'],
    //             'family_name'     => $data['family_name'] ?? $headResident->lastname,
    //         ]);

    //         // Update all residents with new family and reset head flag first
    //         Resident::whereIn('id', $allResidentIds)->update([
    //             'family_id' => $family->id,
    //             'is_family_head' => false,
    //         ]);

    //         // Update head resident
    //         $headResident->update([
    //             'family_id' => $family->id,
    //             'household_id' => $householdId,
    //             'is_family_head' => true,
    //         ]);

    //         // Update members' household records
    //         foreach ($members as $member) {
    //             HouseholdResident::updateOrCreate(
    //                 ['resident_id' => $member['resident_id']],
    //                 [
    //                     'family_id' => $family->id,
    //                     'household_id' => $householdId,
    //                     'relationship_to_head' => $member['relationship_to_head'] ?? null,
    //                     'household_position' => $member['household_position'] ?? 'primary',
    //                     'is_household_head' => false,
    //                 ]
    //             );

    //             Resident::where('id', $member['resident_id'])->update([
    //                 'household_id' => $householdId,
    //                 'family_id' => $family->id,
    //                 'is_family_head' => false,
    //             ]);
    //         }

    //         // Update head’s household record
    //         $isHead = $headHouseholdResident->is_household_head;

    //         $headHouseholdResident->update([
    //             'family_id' => $family->id,
    //             'household_id' => $householdId,
    //             'relationship_to_head' => 'self',
    //             'household_position' => $isHead ? 'primary' : 'extended',
    //             'is_household_head' => $isHead,
    //         ]);

    //         DB::commit();

    //         ActivityLogHelper::log(
    //             'Family',
    //             'create',
    //             "Created new Family record: {$family->family_name} (ID: {$family->id})"
    //         );

    //         return redirect()
    //             ->route('family.index')
    //             ->with('success', 'Family added successfully!');
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         report($e);

    //         return back()->with('error', 'Family could not be added: ' . $e->getMessage());
    //     }
    // }
    public function store(StoreFamilyRequest $request)
    {
        $data = $request->validated();
        // Head = family head
        $headResidentId = $data['resident_id'];
        $headResident = Resident::with('occupations')->findOrFail($headResidentId);

        $headHouseholdResident = HouseholdResident::where('resident_id', $headResidentId)->first();

        try {
            DB::beginTransaction();

            $members = $data['members'] ?? [];

            // Priority:
            // 1. Resident's existing household
            // 2. Manually selected household (optional)
            // 3. null
            $householdId =
            $headHouseholdResident?->household_id
            ?? $data['household_id']
            ?? null;

            // Combine head and members
            $allResidentIds = collect($members)
                ->pluck('resident_id')
                ->push($headResidentId)
                ->filter()
                ->unique();

            // Load all residents with active occupations
            $residents = Resident::with([
                'occupations' => function ($q) {
                    $q->whereNull('ended_at')
                        ->orWhere('ended_at', '>=', now()->year);
                }
            ])->whereIn('id', $allResidentIds)->get();

            // Compute average income
            $totalIncome = $residents
                ->flatMap(fn($r) => $r->occupations)
                ->pluck('monthly_income')
                ->filter()
                ->sum() ?? 0;

            // Determine income levels
            $incomeBracket = match (true) {
                $totalIncome < 12030 => 'poor',
                $totalIncome <= 24060 => 'low_income_non_poor',
                $totalIncome <= 48120 => 'lower_middle_income',
                $totalIncome <= 84210 => 'middle_middle_income',
                $totalIncome <= 144360 => 'upper_middle_income',
                $totalIncome <= 240600 => 'upper_income',
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

            // Delete any old family linked to this head (avoid duplicates)
            if ($headHouseholdResident?->family) {
                $headHouseholdResident->family->delete();
            }

            // Create new family record
            $family = Family::create([
                'barangay_id'     => $headResident->barangay_id,
                'household_id'    => $householdId,

                'family_monthly_income' => $totalIncome, // 🔥 add this

                'income_bracket'  => $incomeBracket,
                'income_category' => $incomeCategory,

                'family_type'     => $data['family_type'],
                'family_name'     => $data['family_name'] ?? $headResident->lastname,
            ]);

            // Update all residents with new family and reset head flag first
            Resident::whereIn('id', $allResidentIds)->update([
                'family_id' => $family->id,
                'is_family_head' => false,
            ]);

            // Update head resident
            $headResident->update([
                'family_id' => $family->id,
                'is_family_head' => 1,
                'household_id' => $householdId ?? null,
            ]);

            $isNuclear = $data['family_type'] === 'nuclear';
            // Update members' household records
            foreach ($members as $member) {

                    HouseholdResident::updateOrCreate(
                        ['resident_id' => $member['resident_id']],
                        [
                            'family_id' => $family->id,
                            'household_id' => $householdId,
                            'relationship_to_head' => $member['relationship_to_head'] ?? null,
                            'household_position' => $member['household_position'] ?? 'primary',
                            'is_household_head' => false,
                        ]
                    );

                Resident::where('id', $member['resident_id'])->update([
                    'household_id' => $householdId,
                    'family_id' => $family->id,
                    'is_family_head' => false,
                ]);
            }

            HouseholdResident::updateOrCreate(
                [
                    'resident_id' => $headResidentId,
                    'household_id' => $householdId,
                ],
                [
                    'family_id' => $family->id,
                    'relationship_to_head' => 'self',
                    'household_position' => $isNuclear ? 'primary' : 'extended',
                    'is_household_head' => $isNuclear ? 1 : 0,
                ]
            );

            DB::commit();
            ActivityLogHelper::log(
                'Family',
                'create',
                "Created new Family record: {$family->family_name} (ID: {$family->id})"
            );

            return redirect()
                ->route('family.index')
                ->with('success', 'Family added successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            dd($e->getMessage());
            report($e);

            return back()->with('error', 'Family could not be added: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Family $family)
    {
        //
    }

    public function showFamily(Family $family)
    {
        $family->load(['household.purok', 'members.householdResidents']);

        $household_details = $family->household;

        // 🟢 Base query for members (only select needed columns)
        $query = $family->members()
            ->select([
                'id',
                'firstname',
                'middlename',
                'lastname',
                'suffix',
                'gender',
                'birthdate',
                'employment_status',
                'registered_voter',
                'is_pwd',
            ])
            ->with(['householdResidents:id,resident_id,relationship_to_head,household_position'])
            ->latest();

        // 🟡 Search by name
        if (request()->filled('name')) {
            $name = request('name');
            $query->where(function ($q) use ($name) {
                $like = "%{$name}%";
                $q->where('firstname', 'like', $like)
                    ->orWhere('lastname', 'like', $like)
                    ->orWhere('middlename', 'like', $like)
                    ->orWhere('suffix', 'like', $like)
                    ->orWhereRaw("CONCAT(firstname, ' ', lastname) LIKE ?", [$like])
                    ->orWhereRaw("CONCAT(firstname, ' ', middlename, ' ', lastname) LIKE ?", [$like])
                    ->orWhereRaw("CONCAT(firstname, ' ', middlename, ' ', lastname, ' ', suffix) LIKE ?", [$like]);
            });
        }

        // 🟡 Gender Filter
        if (request()->filled('gender') && request('gender') !== 'All') {
            $query->where('gender', request('gender'));
        }

        // 🟡 Employment Status
        if (request()->filled('estatus') && request('estatus') !== 'All') {
            $query->where('employment_status', request('estatus'));
        }

        // 🟡 Voter Status
        if (request()->filled('voter_status') && request('voter_status') !== 'All') {
            $query->where('registered_voter', request('voter_status'));
        }

        // 🟡 PWD Filter
        if (request()->filled('is_pwd') && request('is_pwd') !== 'All') {
            $query->where('is_pwd', request('is_pwd'));
        }

        // 🟡 Relation to Head
        if (request()->filled('relation') && request('relation') !== 'All') {
            $query->whereHas('householdResidents', function ($q) {
                $q->where('relationship_to_head', request('relation'));
            });
        }

        // 🟡 Household Position
        if (request()->filled('household_position') && request('household_position') !== 'All') {
            $query->whereHas('householdResidents', function ($q) {
                $q->where('household_position', request('household_position'));
            });
        }

        // 🟢 Execute query and map structure
        $members = $query->get()->map(function ($member) {
            return [
                'id' => $member->id,
                'firstname' => $member->firstname,
                'middlename' => $member->middlename,
                'lastname' => $member->lastname,
                'suffix' => $member->suffix,
                'gender' => $member->gender,
                'birthdate' => $member->birthdate,
                'employment_status' => $member->employment_status,
                'registered_voter' => $member->registered_voter,
                'is_pwd' => $member->is_pwd,
                'household_residents' => $member->householdResidents->map(fn($hr) => [
                    'relationship_to_head' => $hr->relationship_to_head,
                    'household_position' => $hr->household_position,
                ]),
            ];
        });

        return Inertia::render("BarangayOfficer/Family/ShowFamily", [
            'family_details' => [
                'id' => $family->id,
                'family_name' => $family->family_name,
                'family_type' => $family->family_type,
                'income_bracket' => $family->income_bracket,
            ],
            'household_details' => [
                'id' => $household_details?->id,
                'house_number' => $household_details?->house_number,
                'purok_number' => $household_details?->purok?->purok_number,
            ],
            'members' => $members,
            'queryParams' => request()->query() ?: null,
        ]);
    }
    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Family $family)
    {
        $family->load([
            'members.householdResidents:id,resident_id,household_id,relationship_to_head,household_position',
            'members.householdResidents.household:id,house_number',
        ]);

        $barangayId = auth()->user()->barangay_id;

        $members = Resident::query()
            ->where('barangay_id', $barangayId)
            ->with([
                'latestHousehold',
                'household',
            ])
            ->orderBy('lastname')
            ->orderBy('firstname')
            ->get();

        $headResident = $family->members->first(function ($member) {
            $householdResident = $member->householdResidents->first();

            return $householdResident
                && (
                    $householdResident->relationship_to_head === 'self' ||
                    $householdResident->household_position === 'primary'
                );
        });

        if (!$headResident) {
            $headResident = $family->members->firstWhere('is_family_head', true)
                ?? $family->members->first();
        }

        $headHouseholdResident = $headResident?->householdResidents?->first();

        $householdId = $family->household_id
            ?? $headHouseholdResident?->household_id
            ?? null;

        $houseNumber = $headHouseholdResident?->household?->house_number
            ?? $family->household?->house_number
            ?? null;

        $headFullName = $headResident
            ? trim("{$headResident->firstname} {$headResident->middlename} {$headResident->lastname} {$headResident->suffix}")
            : '';

        $familyMembers = $family->members->filter(function ($member) use ($headResident) {
            return $member->id !== $headResident?->id;
        });

        $households = Household::query()
            ->where('barangay_id', $barangayId)
            ->select('id', 'barangay_id', 'house_number')
            ->with([
                'latestHouseholdHead.resident:id,firstname,middlename,lastname,suffix'
            ])
            ->get();

        return Inertia::render('BarangayOfficer/Family/Edit', [
            'family' => [
                'id' => $family->id,

                'household_id' => $householdId,
                'household_head_name' => $householdId ? $headFullName : '',
                'has_linked_household' => filled($householdId),

                'resident_id' => $headResident?->id,
                'resident_name' => $headFullName,
                'resident_image' => $headResident?->resident_picture_path,
                'birthdate' => $headResident?->birthdate,
                'purok_number' => $headResident?->purok_number,
                'house_number' => $houseNumber,

                'family_name' => $family->family_name,
                'family_type' => $family->family_type,

                'members' => $familyMembers->map(function ($member) {
                    $householdResident = $member->householdResidents->first();

                    return [
                        'resident_id' => $member->id,
                        'resident_name' => trim(
                            "{$member->firstname} {$member->middlename} {$member->lastname} {$member->suffix}"
                        ),
                        'resident_image' => $member->resident_picture_path,
                        'birthdate' => $member->birthdate,
                        'purok_number' => $member->purok_number,
                        'house_number' => $householdResident?->household?->house_number,
                        'relationship_to_head' => $householdResident?->relationship_to_head,
                        'household_position' => $householdResident?->household_position,
                    ];
                })->values(),
            ],

            'members' => $members,
            'households' => $households,
        ]);
    }
        /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFamilyRequest $request, Family $family)
    {
        $data = $request->validated();
        $headId = $data['resident_id'];
        $members = $data['members'] ?? [];

        $headResident = Resident::findOrFail($headId);

        $headHouseholdResident = HouseholdResident::where('resident_id', $headId)->first();

        $headHouseholdResident = HouseholdResident::where('resident_id', $headId)->first();

        $householdId =
            $headHouseholdResident?->household_id
            ?? $data['household_id']
            ?? null;

        try {
            $previousMemberIds = Resident::where('family_id', $family->id)
                ->pluck('id')
                ->toArray();

            $allResidentIds = collect($members)
                ->pluck('resident_id')
                ->push($headId)
                ->filter()
                ->unique()
                ->values()
                ->toArray();

            $residents = Resident::with([
                'occupations' => fn($q) =>
                    $q->whereNull('ended_at')
                    ->orWhere('ended_at', '>=', now()->year)
            ])->whereIn('id', $allResidentIds)->get();

            $totalIncome = $residents
                ->flatMap(fn($r) => $r->occupations)
                ->pluck('monthly_income')
                ->filter()
                ->sum() ?? 0;

            $incomeBracket = match (true) {
                $totalIncome < 12030 => 'poor',
                $totalIncome <= 24060 => 'low_income_non_poor',
                $totalIncome <= 48120 => 'lower_middle_income',
                $totalIncome <= 84210 => 'middle_middle_income',
                $totalIncome <= 144360 => 'upper_middle_income',
                $totalIncome <= 240600 => 'upper_income',
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

            \DB::transaction(function () use (
                $family,
                $headId,
                $members,
                $allResidentIds,
                $previousMemberIds,
                $incomeBracket,
                $incomeCategory,
                $data,
                $householdId,
                $totalIncome
            ) {
                // 1) Update family metadata and align household
                $family->update([
                    'family_monthly_income' => $totalIncome, // 🔥 add this
                    'income_bracket' => $incomeBracket,
                    'income_category' => $incomeCategory,
                    'family_type' => $data['family_type'],
                    'family_name' => $data['family_name'] ?? $family->family_name,
                    'household_id' => $householdId,
                ]);

                // 2) Update family_id & household_id for all current residents
                if (!empty($allResidentIds)) {
                    Resident::whereIn('id', $allResidentIds)->update([
                        'family_id' => $family->id,
                        'household_id' => $householdId,
                    ]);
                }

                // 3) Remove old members no longer in family
                $removed = array_diff($previousMemberIds, $allResidentIds);

                if (!empty($removed)) {
                    Resident::whereIn('id', $removed)->update([
                        'family_id' => null,
                        'household_id' => null,
                        'is_family_head' => false,
                    ]);

                    if ($householdId) {
                        HouseholdResident::whereIn('resident_id', $removed)
                            ->where('household_id', $householdId)
                            ->delete();
                    }
                }

                // Reset family head flag for current residents
                if (!empty($allResidentIds)) {
                    Resident::whereIn('id', $allResidentIds)->update([
                        'is_family_head' => false,
                    ]);
                }

                // 4) Update or create household_resident for each member
                if ($householdId) {
                    foreach ($members as $member) {
                        $rid = $member['resident_id'] ?? null;

                        if (!$rid || ($member['relationship_to_head'] ?? '') === 'self') {
                            continue;
                        }

                        HouseholdResident::updateOrCreate(
                            [
                                'resident_id' => $rid,
                                'household_id' => $householdId,
                            ],
                            [
                                'family_id' => $family->id,
                                'relationship_to_head' => strtolower($member['relationship_to_head'] ?? ''),
                                'household_position' => $member['household_position'] ?? 'primary',
                                'is_household_head' => false,
                            ]
                        );
                    }
                }

                // 5) Handle family head / household head logic
                $isNuclear = $data['family_type'] === 'nuclear';

                if ($householdId) {
                    HouseholdResident::updateOrCreate(
                        [
                            'resident_id' => $headId,
                            'household_id' => $householdId,
                        ],
                        [
                            'family_id' => $family->id,
                            'relationship_to_head' => 'self',
                            'household_position' => $isNuclear ? 'primary' : 'extended',
                            'is_household_head' => $isNuclear,
                        ]
                    );
                }

                Resident::where('id', $headId)->update([
                    'family_id' => $family->id,
                    'household_id' => $householdId,
                    'is_family_head' => true,
                    'is_household_head' => $householdId ? $isNuclear : false,
                ]);
            });

            ActivityLogHelper::log(
                'Family',
                'update',
                "Updated Family record: {$family->family_name} (ID: {$family->id})"
            );

            return redirect()
                ->route('family.index')
                ->with('success', 'Family updated successfully!');
        } catch (\Exception $e) {
            report($e);

            return back()->with('error', 'Family could not be updated: ' . $e->getMessage());
        }
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Family $family)
    {
        DB::beginTransaction();
        try {

            foreach ($family->members as $member) {
                $member->update(['family_id' => null]);
            }
            $family->delete();
            DB::commit();


            ActivityLogHelper::log(
                'Family',
                'delete',
                "Deleted Family record: {$family->family_name} (ID: {$family->id})"
            );

            return redirect()
                ->route('family.index')
                ->with('success', 'Family permanently deleted successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Family could not be deleted: ' . $e->getMessage());
        }
    }

    public function getFamilyDetails($id)
    {
        $family = Family::with([
            'members.householdResidents:id,resident_id,household_id,relationship_to_head,household_position',
            'members.householdResidents.household:id,house_number'
        ])->findOrFail($id, ['id', 'family_name', 'barangay_id', 'income_bracket', 'family_type']);

        return response()->json([
            'family_details' => $family,
        ]);
    }

    public function remove($id){
        DB::beginTransaction();

        try {
            $resident = Resident::findOrFail($id);

            // Delete all household resident links
            $resident->householdResidents()->delete(); // ✅ Use relationship method, not property
            $resident->familyRelations()->delete(); // ✅ Use relationship method, not property

            // Reset resident's household info
            $resident->update([
                'household_id' => null,
                'family_id' => null,
                'is_household_head' => 0,
            ]);

            DB::commit();

            return back()->with(
                'success', 'Resident removed from family successfully.',
            );

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with(
                'error', 'Failed to remove resident: ' . $e->getMessage(),
            );
        }
    }
    public function getResidentsAndMembersJson()
    {
        $brgyId = auth()->user()->barangay_id;

        // Household heads
        // $residents = HouseholdResident::with('resident:id,barangay_id,household_id,firstname,lastname,middlename,birthdate,purok_number,resident_picture_path', 'resident.latestHousehold')
        //     ->whereHas('resident', function ($query) use ($brgyId) {
        //         $query->where('barangay_id', $brgyId)
        //             ->where('is_household_head', true);
        //     })->select('id', 'resident_id', 'household_id')
        //     ->get();

        // All members
        $members = Resident::with('latestHousehold:household_id,house_number')
        ->where('barangay_id', $brgyId)
        ->where('is_deceased', false) // filter by barangay
        ->select('id', 'household_id', 'purok_number', 'resident_picture_path', 'firstname', 'middlename', 'lastname', 'birthdate', 'barangay_id')
        ->get();

        // Return as JSON
        return response()->json([
            'members' => $members,
        ]);
    }
    public function addFamily($id)
    {
        $barangayId = auth()->user()->barangay_id;

        $household = Household::with([
            'barangay:id,barangay_name',
            'purok:id,barangay_id,purok_number',
            'street:id,street_name',
            'householdResidents.resident:id,firstname,middlename,lastname,suffix,birthdate,resident_picture_path,purok_number',
        ])
            ->where('barangay_id', $barangayId)
            ->findOrFail($id);

        $head = $household->householdResidents
            ->firstWhere('is_household_head', true);

        $headResidentId = $head?->resident_id;

        $headResident = $head?->resident ? [
            'id' => $head->resident->id,
            'fullname' => trim(
                collect([
                    $head->resident->firstname,
                    $head->resident->middlename,
                    $head->resident->lastname,
                    $head->resident->suffix,
                ])->filter()->implode(' ')
            ),
            'birthdate' => $head->resident->birthdate,
            'resident_picture_path' => $head->resident->resident_picture_path,
            'purok_number' => $head->resident->purok_number,
        ] : null;

        $residents = Resident::query()
            ->where('barangay_id', $barangayId)
            ->where('is_deceased', false)
            ->select([
                'id',
                'household_id',
                'purok_number',
                'resident_picture_path',
                'firstname',
                'middlename',
                'lastname',
                'suffix',
                'birthdate',
                'barangay_id',
            ])
            ->get();

        return Inertia::render('BarangayOfficer/Household/AddFamily', [
            'headResidentId' => $headResidentId,
            'headResident' => $headResident,
            'household' => $household,
            'residents' => $residents,
        ]);
    }
    public function storeExtendedFamily(Request $request)
    {
        $data = $request->validate([
            'household_id' => ['required', 'exists:households,id'],
            'househohold_head_id' => ['nullable', 'exists:residents,id'],
            'family_name' => ['nullable', 'string', 'max:255'],
            'family_type' => ['required', 'string', 'max:100'],

            'members' => ['required', 'array', 'min:1'],
            'members.*.resident_id' => ['required', 'exists:residents,id'],
            'members.*.relationship_to_head' => ['nullable', 'string', 'max:100'],
            'members.*.household_position' => ['nullable', 'string', 'max:100'],
            'members.*.is_family_head' => ['nullable', 'boolean'],
        ]);

        try {
            DB::beginTransaction();

            $householdId = $data['household_id'];
            $headResidentId = $data['househohold_head_id'] ?? null;
            $members = $data['members'] ?? [];

            $household = Household::findOrFail($householdId);

            if (!empty($headResidentId)) {
                $headHouseholdResident = HouseholdResident::where('resident_id', $headResidentId)
                    ->where('household_id', $householdId)
                    ->first();

                if (!$headHouseholdResident) {
                    return back()
                        ->withErrors([
                            'househohold_head_id' => 'Selected household head is not assigned to the selected household.',
                        ])
                        ->withInput();
                }
            }

            $familyHeadMember = collect($members)->firstWhere('is_family_head', true);

            if (!$familyHeadMember || empty($familyHeadMember['resident_id'])) {
                return back()
                    ->withErrors([
                        'members' => 'Please select a family head from the members.',
                    ])
                    ->withInput();
            }

            $familyHeadResident = Resident::findOrFail($familyHeadMember['resident_id']);

            $memberResidentIds = collect($members)
                ->pluck('resident_id')
                ->filter()
                ->unique()
                ->values();

            $memberResidents = Resident::with([
                'occupations' => function ($q) {
                    $q->whereNull('ended_at')
                        ->orWhere('ended_at', '>=', now());
                },
            ])->whereIn('id', $memberResidentIds)->get();

            $avgIncome = $memberResidents
                ->flatMap(fn ($resident) => $resident->occupations)
                ->pluck('monthly_income')
                ->filter()
                ->avg() ?? 0;

            $incomeBracket = match (true) {
                $avgIncome < 5000 => 'below_5000',
                $avgIncome <= 10000 => '5001_10000',
                $avgIncome <= 20000 => '10001_20000',
                $avgIncome <= 40000 => '20001_40000',
                $avgIncome <= 70000 => '40001_70000',
                $avgIncome <= 120000 => '70001_120000',
                default => 'above_120001',
            };

            $incomeCategory = match (true) {
                $avgIncome <= 10000 => 'survival',
                $avgIncome <= 20000 => 'poor',
                $avgIncome <= 40000 => 'low_income',
                $avgIncome <= 70000 => 'lower_middle_income',
                $avgIncome <= 120000 => 'middle_income',
                $avgIncome <= 200000 => 'upper_middle_income',
                default => 'above_high_income',
            };

            $family = Family::create([
                'barangay_id' => $household->barangay_id,
                'household_id' => $householdId,
                'income_bracket' => $incomeBracket,
                'income_category' => $incomeCategory,
                'family_type' => $data['family_type'],
                'family_name' => $data['family_name'] ?? $familyHeadResident->lastname,
            ]);

            foreach ($members as $member) {
                $residentId = $member['resident_id'];

                $householdPosition = $member['household_position'] ?? 'extended';
                $isHouseholdHead = $householdPosition === 'self';
                $isFamilyHead = !empty($member['is_family_head']);

                Resident::where('id', $residentId)->update([
                    'family_id' => $family->id,
                    'household_id' => $householdId,
                    'is_family_head' => $isFamilyHead,
                    'is_household_head' => $isHouseholdHead,
                ]);

                HouseholdResident::updateOrCreate(
                    [
                        'resident_id' => $residentId,
                        'household_id' => $householdId,
                    ],
                    [
                        'family_id' => $family->id,
                        'relationship_to_head' => $isHouseholdHead
                            ? 'self'
                            : ($member['relationship_to_head'] ?? null),
                        'household_position' => $isHouseholdHead
                            ? 'primary'
                            : $householdPosition,
                        'is_household_head' => $isHouseholdHead,
                    ]
                );

                if ($isHouseholdHead) {
                    $household->householdResidents()
                        ->where('resident_id', '!=', $residentId)
                        ->update([
                            'is_household_head' => false,
                        ]);

                    Resident::where('household_id', $householdId)
                        ->where('id', '!=', $residentId)
                        ->update([
                            'is_household_head' => false,
                        ]);

                    $household->householdHeadHistories()
                        ->whereNull('end_year')
                        ->update([
                            'end_year' => date('Y'),
                        ]);

                    $household->householdHeadHistories()->create([
                        'resident_id' => $residentId,
                        'start_year' => date('Y'),
                        'end_year' => null,
                    ]);
                }
            }

            DB::commit();

            return redirect()
                ->route('family.index')
                ->with('success', 'Family added successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            report($e);

            return back()->with(
                'error',
                'Family could not be added: ' . $e->getMessage()
            );
        }
    }
}
