<?php

namespace App\Http\Controllers\BarangayAdmin\ResidentInformation;

use App\Helpers\ActivityLogHelper;
use App\Http\Controllers\Controller;
use App\Models\Purok;
use App\Models\Resident;
use App\Models\Vehicle;
use App\Http\Requests\StoreVehicleRequest;
use App\Http\Requests\UpdateVehicleRequest;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VehicleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $brgy_id = Auth()->user()->barangay_id;
        $puroks = Purok::where('barangay_id', $brgy_id)->orderBy('purok_number', 'asc')->pluck('purok_number');

        $query = Resident::where('barangay_id', $brgy_id)
            ->whereHas('vehicles', function ($q) {
                if (request()->filled('v_type') && request('v_type') !== 'All') {
                    $q->where('vehicle_type', request('v_type'));
                }
                if (request()->filled('v_class') && request('v_class') !== 'All') {
                    $q->where('vehicle_class', request('v_class'));
                }
                if (request()->filled('usage') && request('usage') !== 'All') {
                    $q->where('usage_status', request('usage'));
                }
            })
            ->with(['vehicles' => function ($q) {
                if (request()->filled('v_type') && request('v_type') !== 'All') {
                    $q->where('vehicle_type', request('v_type'));
                }
                if (request()->filled('v_class') && request('v_class') !== 'All') {
                    $q->where('vehicle_class', request('v_class'));
                }
                if (request()->filled('usage') && request('usage') !== 'All') {
                    $q->where('usage_status', request('usage'));
                }
            }])
            ->select('id', 'barangay_id', 'firstname', 'lastname', 'middlename', 'suffix', 'purok_number');

        // Purok filter
        if (request()->filled('purok') && request('purok') !== 'All') {
            $query->where('purok_number', request('purok'));
        }

        // Name search
        if (request('name')) {
            $name = request('name');
            $query->where(function ($q) use ($name) {
                $q->where('firstname', 'like', "%{$name}%")
                ->orWhere('middlename', 'like', "%{$name}%")
                ->orWhere('lastname', 'like', "%{$name}%")
                ->orWhere('suffix', 'like', "%{$name}%")
                ->orWhereRaw("CONCAT(firstname, ' ', lastname) LIKE ?", ["%{$name}%"])
                ->orWhereRaw("CONCAT(firstname, ' ', middlename, ' ', lastname) LIKE ?", ["%{$name}%"])
                ->orWhereRaw("CONCAT(firstname, ' ', middlename, ' ', lastname, ' ', COALESCE(suffix,'')) LIKE ?", ["%{$name}%"]);
            });
        }

        $residentsWithVehicles = $query->paginate(10)->withQueryString();
        $vehicle_types = Vehicle::query()
        ->distinct()
        ->pluck('vehicle_type');

        $residents = Resident::where('barangay_id', $brgy_id)
            ->select('id', 'firstname', 'lastname', 'middlename', 'suffix', 'resident_picture_path', 'purok_number', 'birthdate')
            ->get();

        return Inertia::render("BarangayOfficer/Vehicle/Index", [
            'puroks' => $puroks,
            'vehicles' => $residentsWithVehicles,
            'vehicle_types' => $vehicle_types,
            'queryParams' => request()->query() ?: null,
            'residents' => $residents,
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
    public function store(StoreVehicleRequest $request)
    {
        $data = $request->validated();

        try {
            // Fetch resident for better log message
            $resident = Resident::find($data['resident_id']);
            $residentName = $resident
                ? "{$resident->first_name} {$resident->last_name}"
                : "Resident ID {$data['resident_id']}";

            foreach ($data['vehicles'] as $vehicle) {
                Vehicle::create([
                    'resident_id'   => $data['resident_id'],
                    'vehicle_type'  => $vehicle['vehicle_type'],
                    'vehicle_class' => $vehicle['vehicle_class'],
                    'usage_status'  => $vehicle['usage_status'],
                    'is_registered' => $vehicle['is_registered'],
                ]);
            }

            $vehicleCount = count($data['vehicles']);

            ActivityLogHelper::log(
                'Vehicle',
                'create',
                "Added {$vehicleCount} new vehicle record(s) for {$residentName}."
            );

            return redirect()->route('vehicle.index')->with('success', 'Vehicle added successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Vehicle could not be added: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Vehicle $vehicle)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Vehicle $vehicle)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateVehicleRequest $request, Vehicle $vehicle)
    {
        $data = $request->validated();

        try {
            // Fetch resident for readable log
            $resident = Resident::find($data['resident_id']);
            $residentName = $resident
                ? "{$resident->first_name} {$resident->last_name}"
                : "Resident ID {$data['resident_id']}";

            $updatedVehicle = $data['vehicles'][0];

            $vehicle->update([
                'resident_id'   => $data['resident_id'],
                'vehicle_type'  => $updatedVehicle['vehicle_type'],
                'vehicle_class' => $updatedVehicle['vehicle_class'],
                'usage_status'  => $updatedVehicle['usage_status'],
                'is_registered' => $updatedVehicle['is_registered'],
            ]);

            ActivityLogHelper::log(
                'Vehicle',
                'update',
                "Updated vehicle (ID: {$vehicle->id}) for {$residentName}. Updated Type: {$updatedVehicle['vehicle_type']}."
            );

            return redirect()->route('vehicle.index')->with('success', 'Vehicle updated successfully!');
        } catch (\Exception $e) {
            return back()->with('error','Vehicle could not be updated: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Vehicle $vehicle)
    {
        DB::beginTransaction();
        try {
            $resident = $vehicle->resident;
            $residentName = $resident
                ? "{$resident->first_name} {$resident->last_name}"
                : "Resident ID {$vehicle->resident_id}";

            $vehicleType = $vehicle->vehicle_type ?? 'Unknown Type';
            $vehicle->delete();
            DB::commit();

            ActivityLogHelper::log(
                'Vehicle',
                'delete',
                "Deleted vehicle (ID: {$vehicle->id}, Type: {$vehicleType}) belonging to {$residentName}."
            );
            return redirect()->route('vehicle.index')
                ->with('success', "Vehicle Record deleted successfully!");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Record could not be deleted: ' . $e->getMessage());
        }
    }

    public function vehicleDetails($id){
        $vehicle = Vehicle::with([
            'resident:id,firstname,lastname,middlename,suffix,purok_number,birthdate,barangay_id'
        ])
            ->select(
                'id',
                    'resident_id',
                    'vehicle_type',
                    'vehicle_class',
                    'usage_status',
                    'is_registered',
            )
            ->where('id', $id)->first();

        return response()->json([
            'vehicle' => $vehicle,
        ]);
    }
}
