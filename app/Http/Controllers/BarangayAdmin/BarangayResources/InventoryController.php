<?php

namespace App\Http\Controllers\BarangayAdmin\BarangayResources;

use App\Helpers\ActivityLogHelper;
use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Http\Requests\StoreInventoryRequest;
use App\Http\Requests\UpdateInventoryRequest;
use DB;
use Inertia\Inertia;

class InventoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $brgy_id = auth()->user()->barangay_id;

        // Base query
        $query = Inventory::query()
            ->where('barangay_id', $brgy_id)
            ->orderBy('received_date', 'desc');

        // Optional filters
        if (request()->filled('status') && request('status') !== 'All') {
            $query->where('status', request('status'));
        }

        if (request()->filled('item_category') && request('item_category') !== 'All') {
            $query->where('item_category', request('item_category'));
        }

        if (request()->filled('unit') && request('unit') !== 'All') {
            $query->where('unit', request('unit'));
        }

        if (request()->filled('date_recieved')) {
            $query->whereDate('received_date', request('date_recieved'));
        }

        if (request('name')) {
            $query->where(function ($q) {
                $q->where('item_name', 'like', '%' . request('name') . '%');
            });
        }

        // Paginate and keep query string
        $inventory_items = $query->paginate(10)->withQueryString();

        // Distinct dropdown filters
        $categories = Inventory::where('barangay_id', $brgy_id)
            ->distinct()
            ->pluck('item_category');

        $units = Inventory::where('barangay_id', $brgy_id)
            ->distinct()
            ->pluck('unit');

        // Return Inertia page instead of JSON
        return Inertia::render('BarangayOfficer/BarangayProfile/BarangayInventory/InventoryIndex', [
            'inventory_items' => $inventory_items,
            'categories' => $categories,
            'units' => $units,
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
    public function store(StoreInventoryRequest $request)
    {
        $brgy_id = auth()->user()->barangay_id;
        $data = $request->validated();

        try {
            if (!empty($data['inventory_items']) && is_array($data['inventory_items'])) {
                foreach ($data['inventory_items'] as $item) {
                    $created = Inventory::create([
                        'barangay_id'   => $brgy_id,
                        'item_name'     => $item['item_name'],
                        'item_category' => $item['item_category'],
                        'quantity'      => $item['quantity'],
                        'unit'          => $item['unit'],
                        'received_date' => $item['received_date'] ?? null,
                        'supplier'      => $item['supplier'] ?? null,
                        'status'        => $item['status'],
                    ]);

                    // Log activity
                    ActivityLogHelper::log(
                        'inventory',
                        'create',
                        'Created inventory item: ' . ($created->item_name ?? $item['item_name']),
                        $brgy_id
                    );
                }
            }

            return redirect()
                ->route('inventory.index')
                ->with('success','Inventory item(s) saved successfully.');
        } catch (\Exception $e) {
            return back()->with(
                'error',
                'Inventory item(s) could not be saved: ' . $e->getMessage()
            );
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Inventory $inventory)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Inventory $inventory)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInventoryRequest $request, Inventory $inventory)
    {
        $data = $request->validated();

        try {
            if (!empty($data['inventory_items']) && is_array($data['inventory_items'])) {
                foreach ($data['inventory_items'] as $item) {
                    $inventory->update([
                        'item_name'     => $item['item_name'],
                        'item_category' => $item['item_category'],
                        'quantity'      => $item['quantity'],
                        'unit'          => $item['unit'],
                        'received_date' => $item['received_date'] ?? null,
                        'supplier'      => $item['supplier'] ?? null,
                        'status'        => $item['status'],
                    ]);

                    ActivityLogHelper::log(
                        'inventory',
                        'update',
                        'Updated inventory item: ' . ($inventory->item_name ?? $item['item_name'])
                    );
                }
            }

            return redirect()
                ->route('inventory.index')
                ->with('success','Inventory item updated successfully.');
        } catch (\Exception $e) {
            return back()->with(
                'error',
                'Inventory item could not be updated: ' . $e->getMessage()
            );
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Inventory $inventory)
    {
        DB::beginTransaction();
        try {
            $inventory->delete();
            DB::commit();

            ActivityLogHelper::log(
                'inventory',
                'delete',
                'Deleted inventory item: ' . $inventory->item_name
            );

            return redirect()
                ->route('inventory.index')
                ->with('success','Inventory item deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Inventory item could not be deleted: ' . $e->getMessage());
        }
    }

    public function itemDetails($id){
        $item = Inventory::findOrFail($id);
        return response()->json([
            'item' => $item,
        ]);
    }
}
