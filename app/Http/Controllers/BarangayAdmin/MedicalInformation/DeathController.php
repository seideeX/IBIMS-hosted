<?php

namespace App\Http\Controllers\BarangayAdmin\MedicalInformation;

use App\Helpers\ActivityLogHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDeceasedRequest;
use App\Http\Requests\UpdateDeceasedRequest;
use App\Models\Deceased;
use App\Models\Purok;
use App\Models\Resident;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeathController extends Controller
{
    public function index()
    {
        $brgyId = auth()->user()->barangay_id;

        // Capture filters once
        $search   = request('name');
        $purok    = request('purok');
        $sex      = request('sex');
        $deathDate = request('date_of_death');

        // Main deceased query
        $query = Deceased::query()
            ->with(['resident:id,firstname,lastname,middlename,suffix,sex,purok_number,birthdate,resident_picture_path'])
            ->whereHas('resident', function ($q) use ($brgyId) {
                $q->where('barangay_id', $brgyId);
            });

        // 🔎 Search filter
        if (!empty($search)) {
            $query->whereHas('resident', function ($q) use ($search) {
                $q->where('firstname', 'like', "%{$search}%")
                    ->orWhere('lastname', 'like', "%{$search}%")
                    ->orWhere('middlename', 'like', "%{$search}%")
                    ->orWhere('suffix', 'like', "%{$search}%")
                    ->orWhereRaw("CONCAT(firstname, ' ', lastname) LIKE ?", ["%{$search}%"])
                    ->orWhereRaw("CONCAT(firstname, ' ', middlename, ' ', lastname) LIKE ?", ["%{$search}%"])
                    ->orWhereRaw("CONCAT(firstname, ' ', middlename, ' ', lastname, ' ', suffix) LIKE ?", ["%{$search}%"]);
            });
        }

        // 🏡 Purok filter
        if (!empty($purok) && $purok !== 'All') {
            $query->whereHas('resident', fn($q) => $q->where('purok_number', $purok));
        }

        // 🚻 Sex filter
        if (!empty($sex) && $sex !== 'All') {
            $query->whereHas('resident', fn($q) => $q->where('sex', $sex));
        }

        // ⚰️ Date of death filter
        if (!empty($deathDate)) {
            $query->whereDate('date_of_death', $deathDate);
        }

        $puroks = Purok::where('barangay_id', $brgyId)
            ->orderBy('purok_number')
            ->pluck('purok_number');

        // Final deaths list
        $deaths = $query->orderBy('date_of_death', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Resident list (for dropdown/reference use)
        $residents = Resident::where('barangay_id', $brgyId)
            ->select('id', 'firstname', 'lastname', 'middlename', 'suffix', 'resident_picture_path', 'purok_number', 'birthdate')
            ->get();

        return Inertia::render("BarangayOfficer/Death/Index", [
            'deaths'      => $deaths,
            'queryParams' => request()->query() ?: null,
            'puroks'      => $puroks,
            'residents'   => $residents,
        ]);
    }

    /**
     * Return min and max values for age group filters
     */
    private function getAgeRange($group)
    {
        return match ($group) {
            '0_6_months' => [0, 0], // handle separately in query (age < 1 year but > 0 months)
            '7mos_2yrs'  => [0, 2],
            '3_5yrs'     => [3, 5],
            '6_12yrs'    => [6, 12],
            '13_17yrs'   => [13, 17],
            '18_59yrs'   => [18, 59],
            '60_above'   => [60, 200],
            default      => [0, 200],
        };
    }

    public function store(StoreDeceasedRequest $request)
    {
        $data = $request->validated();
        //dd($data);
        try {
            $resident = Resident::findOrFail($data['resident_id']);

            // Double-check that death date is not before birthdate
            if ($resident->birthdate && $data['date_of_death'] < $resident->birthdate) {
                return back()->withErrors([
                    'date_of_death' => 'Date of death cannot be before the birthdate.',
                ])->withInput();
            }

            // ✅ Create death record
            Deceased::create([
                'resident_id'              => $resident->id,
                'date_of_death'            => $data['date_of_death'],
                'cause_of_death'           => $data['cause_of_death'] ?? null,
                'place_of_death'           => $data['place_of_death'] ?? null,
                'burial_place'             => $data['burial_place'] ?? null,
                'burial_date'              => $data['burial_date'] ?? null,
                'death_certificate_number' => $data['death_certificate_number'] ?? null,
                'remarks'                  => $data['remarks'] ?? null,
            ]);

            // ✅ Mark resident as deceased
            $resident->update(['is_deceased' => true]);

            ActivityLogHelper::log(
                'Death',
                'create',
                "Added Death record for Resident ID: {$resident->id}"
            );

            return redirect()
                ->route('death.index')
                ->with('success', 'Death record saved successfully.');
        } catch (\Exception $e) {
            return back()->with(
                'error',
                'Death record could not be saved: ' . $e->getMessage()
            )->withInput();
        }
    }


    public function update(UpdateDeceasedRequest $request, $id)
    {
        try {
            $resident = Resident::findOrFail($id);
            $data     = $request->validated();

            // Update deceased record (or create if not exists)
            Deceased::updateOrCreate(
                ['resident_id' => $resident->id],
                [
                    'date_of_death'            => $data['date_of_death'],
                    'cause_of_death'           => $data['cause_of_death'] ?? null,
                    'place_of_death'           => $data['place_of_death'] ?? null,
                    'burial_place'             => $data['burial_place'] ?? null,
                    'burial_date'              => $data['burial_date'] ?? null,
                    'death_certificate_number' => $data['death_certificate_number'] ?? null,
                    'remarks'                  => $data['remarks'] ?? null,
                ]
            );
            ActivityLogHelper::log(
                'Death',
                'update',
                "Updated Death record for Resident ID: {$resident->id}"
            );
            return redirect()
                ->route('death.index')
                ->with('success', 'Death Record updated successfully.');
        } catch (\Exception $e) {
            return back()->with(
                'error',
                'Death Record could not be updated: ' . $e->getMessage()
            );
        }
    }

    public function deathDetails($id)
    {
        $details = Resident::query()
            ->leftJoin('deceaseds', 'residents.id', '=', 'deceaseds.resident_id') // 👈 table should match your migration
            ->where('residents.id', $id)
            ->select([
                'residents.id',
                'residents.firstname',
                'residents.lastname',
                'residents.middlename',
                'residents.suffix',
                'residents.birthdate',
                'residents.purok_number',
                'residents.sex',
                'residents.resident_picture_path',
                'deceaseds.id as death_id',
                'deceaseds.date_of_death',
                'deceaseds.cause_of_death',
                'deceaseds.place_of_death',
                'deceaseds.burial_place',
                'deceaseds.burial_date',
                'deceaseds.death_certificate_number',
                'deceaseds.remarks',
            ])
            ->firstOrFail(); // 👈 instead of findOrFail()

        return response()->json([
            'details' => $details,
        ]);
    }

    public function destroy($id)
    {
        try {
            // Find resident
            $resident = Resident::findOrFail($id);

            // Find related deceased record
            $deceased = Deceased::where('resident_id', $resident->id)->first();

            if ($deceased) {
                $deceased->delete(); // remove deceased record
            }

            // Reset resident death-related fields
            $resident->update([
                'is_deceased' => false,
            ]);

            ActivityLogHelper::log(
                'Death',
                'delete',
                "Deleted Death record for Resident ID: {$resident->id}"
            );

            return redirect()
                ->route('death.index')
                ->with('success', 'Death record deleted successfully.');
        } catch (\Exception $e) {
            return back()->with(
                'error',
                'Death record could not be deleted: ' . $e->getMessage()
            );
        }
    }

}
