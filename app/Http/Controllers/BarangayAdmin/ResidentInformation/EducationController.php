<?php

namespace App\Http\Controllers\BarangayAdmin\ResidentInformation;

use App\Helpers\ActivityLogHelper;
use App\Http\Controllers\Controller;
use App\Models\EducationalHistory;
use App\Http\Requests\StoreEducationalHistoryRequest;
use App\Http\Requests\UpdateEducationalHistoryRequest;
use App\Models\Purok;
use App\Models\Resident;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EducationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $brgy_id = Auth()->user()->barangay_id;

        $query = EducationalHistory::with([
            'resident:id,firstname,lastname,middlename,suffix,purok_number,barangay_id'
        ])
            ->select(
                'id',
                'resident_id',
                'school_name',
                'school_type',
                'educational_attainment',
                'education_status',
                'year_started',
                'year_ended',
                'program'
            )
            ->whereHas('resident', function ($q) use ($brgy_id) {
                $q->where('barangay_id', $brgy_id)->where('is_deceased', false);
            });

        if (request()->filled('latest_education')) {
            if (request('latest_education') === '1') {
                $query = EducationalHistory::select('educational_histories.*')
                    ->join(DB::raw('(
                    SELECT resident_id, MAX(year_ended) AS max_year
                    FROM educational_histories
                    GROUP BY resident_id
                ) AS latest'), function ($join) {
                        $join->on('educational_histories.resident_id', '=', 'latest.resident_id')
                            ->on('educational_histories.year_ended', '=', 'latest.max_year');
                    })
                    ->with([
                        'resident:id,firstname,lastname,middlename,suffix,purok_number,barangay_id'
                    ])
                    ->whereHas('resident', function ($q) use ($brgy_id) {
                        $q->where('barangay_id', $brgy_id)->where('is_deceased', false);
                    });
            }
        }


        if (request()->filled('name')) {
            $search = request()->input('name');
            $query->where(function ($q) use ($search) {
                $q->whereHas('resident', function ($qr) use ($search) {
                    $qr->whereRaw("CONCAT(firstname, ' ', middlename, ' ', lastname, ' ', suffix) LIKE ?", ["%{$search}%"])
                        ->orWhereRaw("CONCAT(firstname, ' ', lastname) LIKE ?", ["%{$search}%"]);
                })
                    ->orWhere('school_name', 'like', "%{$search}%")
                    ->orWhere('program', 'like', "%{$search}%");
            });
        }

        if (request()->filled('purok') && request('purok') !== 'All') {
            $query->whereHas('resident', function ($q) {
                $q->where('purok_number', request('purok'));
            });
        }
        if (request()->filled('educational_attainment') && request('educational_attainment') !== 'All') {
            $query->where('educational_attainment', request('educational_attainment'));
        }

        if (request()->filled('educational_status') && request('educational_status') !== 'All') {
            $query->where('education_status', request('educational_status'));
        }

        if (request()->filled('school_type') && request('school_type') !== 'All') {
            $query->where('school_type', request('school_type'));
        }

        if (request()->filled('year_started') && request('year_started') !== 'All') {
            $query->where('year_started', request('year_started'));
        }

        if (request()->filled('year_ended') && request('year_ended') !== 'All') {
            $query->where('year_ended', request('year_ended'));
        }

        $puroks = Purok::where('barangay_id', operator: $brgy_id)
            ->orderBy('purok_number', 'asc')
            ->pluck('purok_number');

        $educations = $query->paginate(10)->withQueryString();

        $residents = Resident::where('barangay_id', $brgy_id)->select('id', 'firstname', 'lastname', 'middlename', 'suffix', 'resident_picture_path', 'purok_number', 'birthdate')->get();

        return Inertia::render('BarangayOfficer/Education/Index', [
            'educations' => $educations,
            'puroks' => $puroks,
            'residents' => $residents,
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
    public function store(StoreEducationalHistoryRequest $request)
    {
        $data = $request->validated();
        try {
            foreach ($data['educational_histories'] as $history) {
                EducationalHistory::create([
                    'resident_id' => $data['resident_id'],
                    'educational_attainment' => $history['education'] ?? null,
                    'education_status' => $history['education_status'] ?? null,
                    'school_name' => $history['school_name'] ?? null,
                    'school_type' => $history['school_type'] ?? null,
                    'year_started' => $history['year_started'] ?? null,
                    'year_ended' => $history['year_ended'] ?? null,
                    'program' => $history['program'] ?? null,
                ]);
            }
            ActivityLogHelper::log(
                'Education',
                'create',
                "Added new Educational History for Resident ID: {$data['resident_id']}"
            );
            return redirect()->route('education.index')->with('success', 'Educational history added successfully!');
        } catch (\Exception $e) {
            return back()->with('error' ,'Educational history could not be added: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(EducationalHistory $educationalHistory)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EducationalHistory $educationalHistory)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEducationalHistoryRequest $request, EducationalHistory $educationalHistory)
    {
        $data = $request->validated();
        //dd($data);
        try {
            foreach ($data['educational_histories'] as $history) {
            $educationalHistory->updateOrCreate(
                [
                    'resident_id' => $data['resident_id'],
                ],
                [
                    'educational_attainment' => $history['education'] ?? null,
                    'education_status' => $history['education_status'] ?? null,
                    'school_name' => $history['school_name'] ?? null,
                    'school_type' => $history['school_type'] ?? null,
                    'year_started' => $history['year_started'] ?? null,
                    'year_ended' => $history['year_ended'] ?? null,
                    'program' => $history['program'] ?? null,
                ]
            );
        }
            ActivityLogHelper::log(
                'Education',
                'update',
                "Updated Educational History for Resident ID: {$data['resident_id']}"
            );
            return redirect()->route('education.index')->with('success', 'Education History details updated successfully!');
        } catch (\Exception $e) {
            return back()->with('error','Education History could not be updated: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EducationalHistory $education)
    {
        DB::beginTransaction();
        try {
            $education->delete();
            DB::commit();
            ActivityLogHelper::log(
                'Education',
                'delete',
                "Deleted Educational History ID: {$education->id} for Resident ID: {$education->resident_id}"
            );
            return redirect()->route('education.index')
                ->with('success', "Education Record deleted successfully!");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Record could not be deleted: ' . $e->getMessage());
        }
    }

    public function educationHistory($id){
        $history = EducationalHistory::with([
            'resident:id,firstname,lastname,middlename,suffix,purok_number,barangay_id,resident_picture_path,birthdate'
        ])
            ->select(
                'id',
                'resident_id',
                'school_name',
                'school_type',
                'educational_attainment',
                'education_status',
                'year_started',
                'year_ended',
                'program'
            )
            ->where('id', $id)->first();;
        return response()->json([
            'history' => $history,
        ]);
    }
}
