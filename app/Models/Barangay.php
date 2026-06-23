<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Barangay extends Model
{
    /** @use HasFactory<\Database\Factories\BarangayFactory> */
    use HasFactory;
    // Barangay.php
    protected $fillable = [
        'barangay_name',
        'city',
        'province',
        'zip_code',
        'contact_number',
        'area_sq_km',
        'email',
        'logo_path',
        'founded_year',
        'barangay_code',
        'barangay_type',
        'boundary_coordinates',
        'barangay_hall_address',
        'barangay_hall_latitude',
        'barangay_hall_longitude'
    ];

    public $timestamps = true;

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function generalPopulation()
    {
        return $this->hasOne(CRAGeneralPopulation::class);
    }

    public function populationGenders()
    {
        return $this->hasMany(CRAPopulationGender::class);
    }

    public function populationAgeGroups()
    {
        return $this->hasMany(CRAPopulationAgeGroup::class);
    }

    public function householdServices()
    {
        return $this->hasMany(CRAHouseholdService::class);
    }

    public function houseBuilds()
    {
        return $this->hasMany(CRAHouseBuild::class);
    }

    public function houseOwnerships()
    {
        return $this->hasMany(CRAHouseOwnership::class);
    }

    // CRA Relationships
    public function affectedPlaces()
    {
        return $this->hasMany(CRAAffectedPlaces::class);
    }
    public function assessmentMatrices()
    {
        return $this->hasMany(CRAAssessmentMatrix::class);
    }
    public function bdrrmcDirectories()
    {
        return $this->hasMany(CRABdrrmcDirectory::class);
    }
    public function bdrrmcTrainings()
    {
        return $this->hasMany(CRABdrrmcTraining::class);
    }
    // Disability
    public function disabilityStatistics()
    {
        return $this->hasMany(CRADisabilityStatistic::class);
    }

    // Disasters (parent table)
    public function disasterOccurances()
    {
        return $this->hasMany(CRADisasterOccurance::class);
    }

    // Disaster-related hasMany relationships
    public function disasterAgriDamages()
    {
        return $this->hasMany(CRADisasterAgriDamage::class);
    }

    public function disasterDamages()
    {
        return $this->hasMany(CRADisasterDamage::class);
    }

    public function disasterEffectImpacts()
    {
        return $this->hasMany(CRADisasterEffectImpact::class);
    }

    public function disasterInventories()
    {
        return $this->hasMany(CRADisasterInventory::class);
    }

    public function disasterLifelines()
    {
        return $this->hasMany(CRADisasterLifeline::class);
    }

    public function disasterPopulationImpacts()
    {
        return $this->hasMany(CRADisasterPopulationImpact::class);
    }

    public function disasterRiskPopulations()
    {
        return $this->hasMany(CRADisasterRiskPopulation::class);
    }

    // Equipment & Facilities
    public function equipmentInventories()
    {
        return $this->hasMany(CRAEquipmentInventory::class);
    }

    public function evacuationCenters()
    {
        return $this->hasMany(CRAEvacuationCenter::class);
    }

    public function evacuationInventories()
    {
        return $this->hasMany(CRAEvacuationInventory::class);
    }

    public function evacuationPlans()
    {
        return $this->hasMany(CRAEvacuationPlan::class);
    }

    // Risk & Hazard
    public function familiesAtRisk()
    {
        return $this->hasMany(CRAFamilyAtRisk::class);
    }

    public function hazardRisks()
    {
        return $this->hasMany(CRAHazardRisk::class);
    }

     // CRA Relationships
    public function humanResources()
    {
        return $this->hasMany(CRAHumanResource::class);
    }

    public function illnessesStats()
    {
        return $this->hasMany(CRAIllnessesStat::class);
    }

    public function infraFacilities()
    {
        return $this->hasMany(CRAInfraFacility::class);
    }

    public function institutions()
    {
        return $this->hasMany(CRAInstitution::class);
    }

    public function livelihoodEvacuationSites()
    {
        return $this->hasMany(CRALivelihoodEvacuationSite::class);
    }

    public function livelihoodStatistics()
    {
        return $this->hasMany(CRALivelihoodStatistic::class);
    }

    public function populationExposures()
    {
        return $this->hasMany(CRAPopulationExposure::class);
    }
        // Prepositioned Inventories
    public function prepositionedInventories()
    {
        return $this->hasMany(CRAPrepositionedInventory::class);
    }

    // Primary Facilities
    public function primaryFacilities()
    {
        return $this->hasMany(CRAPrimaryFacility::class);
    }

    // Public Transportations
    public function publicTransportations()
    {
        return $this->hasMany(CRAPublicTransportation::class);
    }

    // Relief Distributions
    public function reliefDistributions()
    {
        return $this->hasMany(CRAReliefDistribution::class);
    }

    // Relief Distribution Processes
    public function reliefDistributionProcesses()
    {
        return $this->hasMany(CRAReliefDistributionProcess::class);
    }

    // Road Networks
    public function roadNetworks()
    {
        return $this->hasMany(CRARoadNetwork::class);
    }
    // public function communityriskassessment()
    // {
    //     return $this->hasOne(CommunityRiskAssessment::class, 'barangay_id');
    // }

    public function craProgress()
    {
        return $this->hasMany(CRAProgress::class, 'barangay_id');
    }

    public function communityRiskAssessments()
    {
        return $this->hasManyThrough(
            CommunityRiskAssessment::class,
            CRAProgress::class,
            'barangay_id', // Foreign key on CRAProgress table
            'id',          // Foreign key on CRA table
            'id',          // Local key on Barangay
            'cra_id'       // Local key on CRAProgress pointing to CRA
        );
    }
    public function dataCollection()
    {
        $general = $this->generalPopulation()->first();

        return [
        'barangay' => [
            'id' => $this->id,
            'name' => $this->barangay_name, // ✅ use correct field from migration
            'population' => $general?->total_population ?? 0,
            'households_population' => $general?->total_households ?? 0,
            'families_population' => $general?->total_families ?? 0,
        ],

            // BDRRMC
            'bdrrmc_directory' => $this->bdrrmcDirectories->map(fn($d) => [
                'designation' => $d->designation_team,
                'name'        => $d->name,
                'contact'     => $d->contact_no,
            ]),
            'bdrrmc_trainings' => $this->bdrrmcTrainings()
            ->get()
            ->map(function ($item) {
                return [
                    'title'       => $item->title,
                    'status'     => $item->status,
                    'duration'    => $item->duration,
                    'agency'      => $item->agency,
                    'inclusive_dates'       => $item->inclusive_dates,
                    'number_of_participants'=> $item->number_of_participants,
                    'participants'       => $item->participants,
                ];
            }),

            // Population
            'general_population' => $this->generalPopulation()->first(),
            'population_genders' => $this->populationGenders()
                ->get()
                ->map(function ($item) {
                    return [
                        'gender' => $item->gender,
                        'value'  => $item->quantity, // ✅ rename quantity → value
                    ];
                }),
            'population_age_groups' => $this->populationAgeGroups()
            ->get()
            ->map(function ($item) {
                return [
                    'ageGroup'      => $item->age_group,
                    'male_no_dis'   => $item->male_without_disability,
                    'male_dis'      => $item->male_with_disability,
                    'female_no_dis' => $item->female_without_disability,
                    'female_dis'    => $item->female_with_disability,
                    'lgbtq_no_dis'  => $item->lgbtq_without_disability,
                    'lgbtq_dis'     => $item->lgbtq_with_disability,
                ];
            }),
            'population_exposures' => $this->populationExposures()
            ->with('hazard')
            ->get()
            ->groupBy(fn($item) => $item->hazard?->hazard_name) // group by hazard type
            ->map(function ($group, $hazardType) {
                return [
                    'riskType' => $hazardType,
                    'purokData' => $group->map(function ($item) {
                        return [
                            'purok' => $item->purok_number,
                            'families' => $item->total_families,
                            'individualsM' => $item->individuals_male,
                            'individualsF' => $item->individuals_female,
                            'lgbtq' => $item->individuals_lgbtq,
                            'age0_6M' => $item->age_0_6_male,
                            'age0_6F' => $item->age_0_6_female,
                            'age7m_2yM' => $item->age_7m_2y_male,
                            'age7m_2yF' => $item->age_7m_2y_female,
                            'age3_5M' => $item->age_3_5_male,
                            'age3_5F' => $item->age_3_5_female,
                            'age6_12M' => $item->age_6_12_male,
                            'age6_12F' => $item->age_6_12_female,
                            'age13_17M' => $item->age_13_17_male,
                            'age13_17F' => $item->age_13_17_female,
                            'age18_59M' => $item->age_18_59_male,
                            'age18_59F' => $item->age_18_59_female,
                            'age60upM' => $item->age_60_up_male,
                            'age60upF' => $item->age_60_up_female,
                            'pwdM' => $item->pwd_male,
                            'pwdF' => $item->pwd_female,
                            'diseasesM' => $item->diseases_male,
                            'diseasesF' => $item->diseases_female,
                            'pregnantWomen' => $item->pregnant_women,
                        ];
                    })->values(),
                ];
            })->values(),

            // Disaster Related
            'disasters' => $this->disasterOccurances()
            ->with(['agriDamages', 'damages', 'effectImpacts', 'lifelines', 'populationImpacts'])
            ->get()
            ->map(function ($disaster) {
                return [
                    'disaster_name' => $disaster->disaster_name,
                    'year' => $disaster->year,

                    'agriculture' => $disaster->agriDamages->map(fn($item) => [
                        'description' => $item->description,
                        'value' => $item->value,
                        'source' => $item->source,
                    ]),

                    'property' => $disaster->damages->groupBy('category')->map(function ($items, $category) {
                        return [
                            'category' => $category,
                            'descriptions' => $items->map(fn($item) => [
                                'description' => $item->description,
                                'damage_type' => $item->damage_type,
                                'value' => $item->value,
                                'source' => $item->source,
                            ])->values(),
                        ];
                    })->values(),

                    'impacts' => $disaster->effectImpacts->map(fn($item) => [
                        'effect_type' => $item->effect_type,
                        'value' => $item->value,
                        'source' => $item->source,
                    ]),

                    'lifelines' => $disaster->lifelines->groupBy('category')->map(function ($items, $category) {
                        return [
                            'category' => $category,
                            'descriptions' => $items->map(fn($item) => [
                                'description' => $item->description,
                                'value' => $item->value,
                                'source' => $item->source,
                            ])->values(),
                        ];
                    })->values(),

                    'population' => $disaster->populationImpacts->map(fn($item) => [
                        'category' => $item->category,
                        'value' => $item->value,
                        'source' => $item->source,
                    ]),
                ];
            }),

            'disaster_inventories' => $this->disasterInventories()
                ->with('hazard') // eager load hazard to access hazard_name/type
                ->get()
                ->groupBy('hazard.hazard_name') // group by hazard type/name
                ->map(function ($hazardGroup, $hazardName) {
                    return [
                        'hazard' => $hazardName,
                        'categories' => $hazardGroup->groupBy('category')->map(function ($categoryGroup, $category) {
                            return [
                                'type' => $category,
                                'rows' => $categoryGroup->map(function ($item) {
                                    return [
                                        'item' => $item->item_name,
                                        'total' => $item->total_in_barangay,
                                        'percent' => $item->percentage_at_risk,
                                        'location' => $item->location,
                                    ];
                                })->values(),
                            ];
                        })->values(),
                    ];
                })->values(),
            'disaster_per_purok' => $this->disasterRiskPopulations()
            ->get()
            ->groupBy('hazard.hazard_name') // assuming you have a relation to CRAHazard with `type`
            ->map(function ($group, $hazardType) {
                return [
                    'type' => $hazardType,
                    'rows' => $group->map(function ($item) {
                        return [
                            'purok' => $item->purok_number,
                            'lowFamilies' => $item->low_families,
                            'lowIndividuals' => $item->low_individuals,
                            'mediumFamilies' => $item->medium_families,
                            'mediumIndividuals' => $item->medium_individuals,
                            'highFamilies' => $item->high_families,
                            'highIndividuals' => $item->high_individuals,
                        ];
                    })->values(),
                ];
            })->values(),

            // Facilities & Infra
            'primary_facilities' => $this->primaryFacilities()
            ->get()
            ->map(function ($item) {
                return [
                    'type' => $item->facility_name,
                    'quantity' => $item->quantity,
                ];
            }),
            'infra_facilities' => $this->infraFacilities()
            ->get()
            ->groupBy('category')
            ->map(function ($items, $category) {
                return [
                    'category' => $category,
                    'buildings' => $items->map(function ($item) {
                        return [
                            'type' => $item->infrastructure_name,
                            'quantity' => $item->quantity,
                        ];
                    })->values()
                ];
            })->values(),
            'institutions' => $this->institutions()
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'male' => $item->male_members ?: 0,
                    'female' => $item->female_members ?: 0,
                    'lgbtq' => $item->lgbtq_members ?: 0,
                    'head' => $item->head_name,
                    'contact' => $item->contact_no,
                    'registered' => $item->registered,
                    'programs' => $item->programs_services,
                ];
            }),
            'road_networks' => $this->roadNetworks()
            ->get()
            ->map(function ($item) {
                return [
                    'type' => $item->road_type,
                    'length' => $item->length_km,
                    'maintained_by' => $item->maintained_by,
                ];
            }),
            'public_transportations' => $this->publicTransportations()
            ->get()
            ->map(function ($item) {
                return [
                    'type' => $item->transpo_type,
                    'quantity' => $item->quantity,
                ];
            }),

            // Household & Housing
            'house_builds' => $this->houseBuilds()
            ->get()
            ->map(function ($item) {
                return [
                    'houseType'  => $item->house_type,
                    'oneFloor'   => $item->one_floor,
                    'multiFloor' => $item->two_or_more_floors,
                ];
            }),
            'house_ownerships' => $this->houseOwnerships()
            ->get()
            ->map(function ($ownership) {
                return [
                    'type' => $ownership->ownership_type,
                    'quantity' => $ownership->quantity,
                ];
            }),
            'household_services' => $this->householdServices()
            ->get()
            ->groupBy('category')
            ->map(function ($items, $category) {
                return [
                    'category' => $category,
                    'rows' => $items->map(function ($item) {
                        return [
                            'type' => $item->service_name,
                            'households' => $item->households_quantity,
                        ];
                    })->values()
                ];
            })->values(),

            // Livelihood
            'livelihood_statistics' => $this->livelihoodStatistics()
            ->get()
            ->map(function ($stat) {
                return [
                    'type' => $stat->livelihood_type,
                    'male_no_dis' => $stat->male_without_disability,
                    'male_dis' => $stat->male_with_disability,
                    'female_no_dis' => $stat->female_without_disability,
                    'female_dis' => $stat->female_with_disability,
                    'lgbtq_no_dis' => $stat->lgbtq_without_disability,
                    'lgbtq_dis' => $stat->lgbtq_with_disability,
                ];
            }),
            'livelihood_evacuation' => $this->livelihoodEvacuationSites()
            ->get()
            ->map(function ($site) {
                return [
                    'type'       => $site->livelihood_type,
                    'evacuation' => $site->evacuation_site,
                    'origin'     => $site->place_of_origin,
                    'items'      => $site->capacity_description,
                ];
            }),

            // Relief
            'relief_distributions' => $this->reliefDistributions()
            ->get()
            ->map(function ($relief) {
                return [
                    'evacuation_center' => $relief->evacuation_center,
                    'relief_good'       => $relief->relief_good,
                    'quantity'          => $relief->quantity,
                    'unit'              => $relief->unit,
                    'beneficiaries'     => $relief->beneficiaries,
                    'address'           => $relief->address,
                ];
            }),
            'relief_distribution_processes' => $this->reliefDistributionProcesses()
            ->get()
            ->map(function ($proc) {
                return [
                    'step_no'              => $proc->step_no,
                    'process'              => $proc->distribution_process,
                    'origin'               => $proc->origin_of_goods,
                    'remarks'              => $proc->remarks,
                ];
            }),

            // Equipment & Evacuation
            'equipment_inventories' => $this->equipmentInventories()
            ->get()
            ->map(function ($eq) {
                return [
                    'item'       => $eq->item,
                    'status'     => $eq->availability, // map to frontend-friendly name
                    'quantity'   => $eq->quantity,
                    'location'   => $eq->location,
                    'remarks'    => $eq->remarks,
                ];
            }),
            'evacuation_list' => $this->evacuationCenters()
            ->get()
            ->map(function ($center) {
                return [
                    'name' => $center->name,
                    'families' => $center->capacity_families,
                    'individuals' => $center->capacity_individuals,

                    // ownership breakdown
                    'ownerGovt' => $center->owner_type === 'government',
                    'ownerPrivate' => $center->owner_type === 'private',

                    // inspection by engineer
                    'inspectedYes' => (bool) $center->inspected_by_engineer,
                    'inspectedNo' => ! $center->inspected_by_engineer,

                    // memorandum of understanding
                    'mouYes' => (bool) $center->has_mou,
                    'mouNo' => ! $center->has_mou,
                ];
            }),
            'evacuation_center_inventory' => $this->evacuationInventories()
            ->get()
            ->map(function ($item) {
                return [
                    'totalFamilies' => $item->total_families,
                    'totalIndividuals' => $item->total_individuals,

                    'populationAtRiskFamilies' => $item->families_at_risk,
                    'populationAtRiskIndividuals' => $item->individuals_at_risk,

                    'evacuationCenterPlanA' => $item->plan_a_center,
                    'personsCanBeAccommodatedPlanAFamilies' => $item->plan_a_capacity_families,
                    'personsCanBeAccommodatedPlanAIndividuals' => $item->plan_a_capacity_individuals,
                    'personsCannotBeAccommodatedPlanAFamilies' => $item->plan_a_unaccommodated_families,
                    'personsCannotBeAccommodatedPlanAIndividuals' => $item->plan_a_unaccommodated_individuals,

                    'evacuationCenterPlanB' => $item->plan_b_center,
                    'personsCannotBeAccommodatedPlanBBFamilies' => $item->plan_b_unaccommodated_families,
                    'personsCannotBeAccommodatedPlanBIndividuals' => $item->plan_b_unaccommodated_individuals,

                    'remarks' => $item->remarks,
                ];
            }),
            'evacuation_plans' => $this->evacuationPlans()
            ->get()
            ->map(function ($plan) {
                return [
                    'task'        => $plan->things_to_do,
                    'responsible' => $plan->responsible_person,
                    'remarks'     => $plan->remarks,
                ];
            }),

            // Risk & Hazard
            'families_at_risk' => $this->familiesAtRisk()
            ->get()
            ->map(function ($item) {
                return [
                    'value' => $item->indicator,
                    'count' => $item->count,
                    'purok' => $item->purok_number,
                ];
            })->values(),
            'hazard_risks' => $this->hazardRisks()
            ->with('hazard') // eager load the hazard relation
            ->get()
            ->map(function ($item) {
                return [
                    'hazard' => $item->hazard?->hazard_name, // get hazard name
                    'probability' => $item->probability_no,
                    'effect' => $item->effect_no,
                    'management' => $item->management_no,
                    'basis' => $item->basis,
                    'average_score' => $item->average_score,
                ];
            }),
            'vulnerabilities' => $this->assessmentMatrices()
                ->with('hazard')
                ->where('matrix_type', 'vulnerability')
                ->get()
                ->map(fn($item) => [
                    'hazard' => $item->hazard?->hazard_name,
                    'people' => $item->people,
                    'properties' => $item->properties,
                    'services' => $item->services,
                    'environment' => $item->environment,
                    'livelihood' => $item->livelihood,
                ]),

            'risks' => $this->assessmentMatrices()
                ->with('hazard')
                ->where('matrix_type', 'risk')
                ->get()
                ->map(fn($item) => [
                    'hazard' => $item->hazard?->hazard_name,
                    'people' => $item->people,
                    'properties' => $item->properties,
                    'services' => $item->services,
                    'environment' => $item->environment,
                    'livelihood' => $item->livelihood,
                ]),

            // Health
            'illnesses_stats' => $this->illnessesStats()
            ->get()
            ->map(function ($item) {
                return [
                    'illness' => $item->illness,
                    'children' => $item->children,
                    'adults' => $item->adults,
                ];
            })->values(),
            'disability_statistics' => $this->disabilityStatistics()
            ->get()
            ->map(function ($item) {
                return [
                    'type' => $item->disability_type,
                    'age0_6M' => $item->age_0_6_male,
                    'age0_6F' => $item->age_0_6_female,
                    'age7m_2yM' => $item->age_7m_2y_male,
                    'age7m_2yF' => $item->age_7m_2y_female,
                    'age3_5M' => $item->age_3_5_male,
                    'age3_5F' => $item->age_3_5_female,
                    'age6_12M' => $item->age_6_12_male,
                    'age6_12F' => $item->age_6_12_female,
                    'age6_12LGBTQ' => $item->age_6_12_lgbtq,
                    'age13_17M' => $item->age_13_17_male,
                    'age13_17F' => $item->age_13_17_female,
                    'age13_17LGBTQ' => $item->age_13_17_lgbtq,
                    'age18_59M' => $item->age_18_59_male,
                    'age18_59F' => $item->age_18_59_female,
                    'age18_59LGBTQ' => $item->age_18_59_lgbtq,
                    'age60upM' => $item->age_60up_male,
                    'age60upF' => $item->age_60up_female,
                    'age60upLGBTQ' => $item->age_60up_lgbtq,
                ];
            })->values(),


            // Human Resources
            'human_resources' => $this->humanResources()
            ->get()
            ->groupBy('category')
            ->map(function ($group, $category) {
                return [
                    'category' => $category,
                    'rows' => $group->map(function ($item) {
                        return [
                            'type' => $item->resource_name,
                            'male_no_dis' => $item->male_without_disability,
                            'male_dis' => $item->male_with_disability,
                            'female_no_dis' => $item->female_without_disability,
                            'female_dis' => $item->female_with_disability,
                            'lgbtq_no_dis' => $item->lgbtq_without_disability,
                            'lgbtq_dis' => $item->lgbtq_with_disability,
                        ];
                    })->values(), // reset keys
                ];
            })->values(),

            // Affected Places
            'affected_areas' => $this->affectedPlaces()
            ->with('hazard') // to get hazard name
            ->get()
            ->groupBy('hazard.hazard_name') // group by hazard type
            ->map(function ($group, $hazardName) {
                return [
                    'id' => now()->timestamp, // or use hazard_id if you want stable IDs
                    'name' => $hazardName,
                    'rows' => $group->map(function ($item) {
                        return [
                            'purok' => $item->purok_number,
                            'riskLevel' => $item->risk_level,
                            'totalFamilies' => $item->total_families,
                            'totalIndividuals' => $item->total_individuals,
                            'atRiskFamilies' => $item->at_risk_families,
                            'atRiskIndividuals' => $item->at_risk_individuals,
                            'safeEvacuationArea' => $item->safe_evacuation_area,
                        ];
                    })->values(),
                ];
            })->values(),

            // Prepositioned Inventories
            'prepositioned_inventories' => $this->prepositionedInventories()
            ->get()
            ->map(function ($inv) {
                return [
                    'item'     => $inv->item_name,
                    'quantity' => $inv->quantity,
                    'remarks'  => $inv->remarks,
                ];
            }),
        ];
    }


}
