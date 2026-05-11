<?php

namespace App\Http\Controllers\BarangayAdmin\BarangayResources;

use App\Http\Controllers\Controller;
use App\Models\BarangayInstitutionMember;
use App\Http\Requests\StoreBarangayInstitutionMemberRequest;
use App\Http\Requests\UpdateBarangayInstitutionMemberRequest;
use DB;
use Inertia\Inertia;

class InstitutionMemberController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
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
    public function store(StoreBarangayInstitutionMemberRequest $request)
    {
        $data = $request->validated();

        try {

            $members = $data['members'] ?? [];
            $institutionId = $data['institution_id'];

            // 🔍 Check if any incoming member is marked as head
            $hasIncomingHead = collect($members)->contains(fn ($m) =>
                !empty($m['is_head']) && $m['is_head'] == true
            );

            if ($hasIncomingHead) {
                // 🔍 Check if institution already has a head
                $existingHead = BarangayInstitutionMember::where('institution_id', $institutionId)
                    ->where('is_head', true)
                    ->first();

                if ($existingHead) {
                    return back()->with(
                        'error',
                        'This institution already has a head: ' .
                        ucwords($existingHead->resident->firstname . ' ' . $existingHead->resident->lastname)
                    );
                }
            }

            // 🔍 Check for duplicate members (resident already belongs to the institution)
            foreach ($members as $member) {
                $alreadyMember = BarangayInstitutionMember::where('institution_id', $institutionId)
                    ->where('resident_id', $member['resident_id'])
                    ->exists();

                if ($alreadyMember) {
                    return back()->with(
                        'error',
                        'Resident is already a member of this institution.'
                    );
                }
            }

            // ✅ Save members
            foreach ($members as $member) {
                BarangayInstitutionMember::create([
                    'institution_id' => $institutionId,
                    'resident_id'    => $member['resident_id'],
                    'member_since'   => $member['member_since'] ?? null,
                    'status'         => $member['status'],
                    'is_head'        => $member['is_head'] ?? false,
                ]);
            }

            return back()->with('success', 'Member(s) saved successfully.');

        } catch (\Exception $e) {
            return back()->with('error', 'Member(s) could not be saved: ' . $e->getMessage());
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(BarangayInstitutionMember $barangayInstitutionMember)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(BarangayInstitutionMember $barangayInstitutionMember)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBarangayInstitutionMemberRequest $request, $id)
    {
        $data = $request->validated();
        $barangayInstitutionMember = BarangayInstitutionMember::findOrFail($id);

        try {
            if (!empty($data['members']) && is_array($data['members'])) {
                foreach ($data['members'] as $member) {
                    $barangayInstitutionMember->update([
                        'member_since'   => $member['member_since'] ?? $barangayInstitutionMember->member_since,
                        'status'         => $member['status'] ?? $barangayInstitutionMember->status,
                        'is_head'        => $member['is_head'],
                    ]);
                }
            }


            return back()->with('success','Member updated successfully.');
        } catch (\Exception $e) {
            return back()->with(
                'error',
                'Member could not be updated: ' . $e->getMessage()
            );
        }
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $barangayInstitutionMember = BarangayInstitutionMember::findOrFail($id);
        DB::beginTransaction();
        try {
            $barangayInstitutionMember->delete();
            DB::commit();

            return back()->with('success', 'Member deleted successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Member could not be deleted: ' . $e->getMessage());
        }
    }
    public function memberDetails($id)
    {
        $member = BarangayInstitutionMember::with([
            'resident:id,firstname,lastname,middlename,suffix,sex,gender,birthdate,purok_number,contact_number'
        ])->findOrFail($id);

        return response()->json([
            'member' => $member,
        ]);
    }
}
