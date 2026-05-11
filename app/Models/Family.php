<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Family extends Model
{
    /** @use HasFactory<\Database\Factories\FamilyFactory> */
    use HasFactory;
    public $timestamps = true;
    protected $fillable = [
        'barangay_id',
        'household_id',
        'income_bracket',
        'income_category',
        'family_monthly_income',
        'family_type',
        'family_name',
        'created_at',
        'updated_at',
    ];

    public function barangay()
    {
        return $this->belongsTo(Barangay::class);
    }
    public function household()
    {
        return $this->belongsTo(Household::class);
    }
    public function members()
    {
        return $this->hasMany(Resident::class);
    }
    public function latestHead()
    {
        return $this->hasOne(Resident::class, 'family_id', 'id')
            ->where('residents.is_family_head', true);
    }
}
