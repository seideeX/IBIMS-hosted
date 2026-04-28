<?php

use App\Exports\ResidentsExport;

use App\Http\Controllers\BarangayAdmin\BarangayInformation\ActivityLogsController;
use App\Http\Controllers\BarangayAdmin\BarangayInformation\UserController;
use App\Http\Controllers\BarangayAdmin\BarangayInformation\BarangayController;
use App\Http\Controllers\BarangayAdmin\BarangayInformation\DocumentController;
use App\Http\Controllers\BarangayAdmin\BarangayInformation\DocumentGenerationController;
use App\Http\Controllers\BarangayAdmin\BarangayInformation\BarangayProfileController;

use App\Http\Controllers\BarangayAdmin\BarangayResources\BarangayInfrastructureController;
use App\Http\Controllers\BarangayAdmin\BarangayResources\BarangayFacilityController;
use App\Http\Controllers\BarangayAdmin\BarangayResources\BarangayInstitutionController;
use App\Http\Controllers\BarangayAdmin\BarangayResources\BarangayManagementController;
use App\Http\Controllers\BarangayAdmin\BarangayResources\BarangayOfficialController;
use App\Http\Controllers\BarangayAdmin\BarangayResources\BarangayProjectController;
use App\Http\Controllers\BarangayAdmin\BarangayResources\BarangayRoadController;
use App\Http\Controllers\BarangayAdmin\BarangayResources\WaterController;
use App\Http\Controllers\BarangayAdmin\BarangayResources\LandController;
use App\Http\Controllers\BarangayAdmin\BarangayResources\StreetController;

use App\Http\Controllers\BarangayAdmin\ResidentInformation\ResidentController;
use App\Http\Controllers\BarangayAdmin\ResidentInformation\HouseholdController;
use App\Http\Controllers\BarangayAdmin\ResidentInformation\FamilyController;
use App\Http\Controllers\BarangayAdmin\ResidentInformation\SeniorCitizenController;
use App\Http\Controllers\BarangayAdmin\ResidentInformation\VehicleController;
use App\Http\Controllers\BarangayAdmin\ResidentInformation\EducationController;
use App\Http\Controllers\BarangayAdmin\ResidentInformation\OccupationController;

use App\Http\Controllers\AllergyController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;

use App\Http\Controllers\BlotterController;
use App\Http\Controllers\CaseParticipantController;
use App\Http\Controllers\CDRRMOAdminController;
use App\Http\Controllers\CDRRMOSuperAdminController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\ChildHealthMonitoringController;
use App\Http\Controllers\Controller;
use App\Http\Controllers\CRA\PDFController;
use App\Http\Controllers\CRAController;
use App\Http\Controllers\CRADataController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeathController;
use App\Http\Controllers\DisabilityController;

use App\Http\Controllers\EmailController;
use App\Http\Controllers\FamilyRelationController;
use App\Http\Controllers\FamilyTreeController;
use App\Http\Controllers\IBIMSController;
use App\Http\Controllers\InstitutionMemberController;
use App\Http\Controllers\InventoryController;

use App\Http\Controllers\LivelihoodController;
use App\Http\Controllers\MedicalInformationController;
use App\Http\Controllers\PregnancyRecordController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportGenerationController;
use App\Http\Controllers\ResidentAccountController;

use App\Http\Controllers\ResidentMedicalConditionController;
use App\Http\Controllers\ResidentMedicationController;
use App\Http\Controllers\ResidentVaccinationController;
use App\Http\Controllers\SummonController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\SuperAdminDataController;
use App\Http\Controllers\UnauthenticatedIssuanceController;



use App\Models\BarangayInfrastructure;
use App\Models\BarangayInstitution;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;


Route::get('/', [IBIMSController::class, 'welcome'])->name('welcome'); // Welcome page accessible to both admin and resident
Route::get('/test-email', [EmailController::class, 'sendPHPMailerEmail']);
Route::get('/request-certificate', [UnauthenticatedIssuanceController::class, 'makeRequest'])->name('request.certificate');
Route::get('/request-certificate-documents/{id}', [UnauthenticatedIssuanceController::class, 'fetchDocuments'])->name('request.documents');
Route::get('/request-certificate-placeholders/{id}', [DocumentController::class, 'fetchPlaceholders'])->name('request.placeholders');
Route::post('/request-certificate/store', [UnauthenticatedIssuanceController::class, 'store'])->name('request.storerequest');
Route::get('/getCRA', [CRADataController::class, 'getCRA'])->name('getcra');
Route::get('/getCRAList', [CRADataController::class, 'getCRAList'])->name('getcralist');
Route::get('/craProgress', [CRAController::class, 'craProgress'])->name('craProgress');
Route::patch('/user/{user}/toggle-account', [UserController::class, 'toggleAccount'])->name('user.toggle');
Route::patch('/barangayofficial/{official}/toggle-status', [BarangayOfficialController::class, 'toggleStatus'])->name('official.toggle');

// axios documents
Route::get('/document/preview/{id}', [DocumentController::class, 'preview'])->name('document.preview');
Route::get('/document/fetchdocuments', [DocumentController::class, 'fetchDocuments'])->name('document.fetchdocs');
Route::get('/document/fetchdocumentpath/{id}', [DocumentController::class, 'fetchDocumentPath'])->name('document.documentpath');
Route::get('/document/fetchplaceholders/{id}', [DocumentController::class, 'fetchPlaceholders'])->name('document.placeholders');
Route::get('/test-mail-env', function () {
    return [
        'username' => env('MAIL_USERNAME'),
        'password' => env('MAIL_PASSWORD'),
    ];
});

// Admin-only routes
Route::middleware(['auth', 'role:barangay_officer|cdrrmo_admin|super_admin|admin'])->group(function () {
    Route::get('/document/fill/{resident}/{template}', [DocumentGenerationController::class, 'generateFilledDocument'])
        ->name('document.fill');

    Route::get('certificate/{id}/download', [CertificateController::class, 'download'])->name('certificate.download');
    Route::get('certificate/{id}/print', [CertificateController::class, 'print'])->name('certificate.print');
    Route::get('certificate/index', [CertificateController::class, 'index'])->name('certificate.index');
    Route::post('certificate/store', [CertificateController::class, 'storeFromPost'])->name('certificate.store');
    Route::get('certificate/export-certificates-excel', [ReportGenerationController::class, 'exportCertificates'])
        ->name('certificate.export');
    Route::get('certificate/export-certificates-pdf', [ReportGenerationController::class, 'exportCertificatesPdf'])
        ->name('certificate.export.pdf');
    Route::post('/certificate/issue/{id}', [CertificateController::class, 'issue'])
        ->name('certificate.issue');
    Route::get('/certificates/pending', [CertificateController::class, 'getPendingCertificates'])->name('certificate.pending');
    Route::delete('/certificates/deny/{id}', [CertificateController::class, 'denyRequest'])->name('certificate.deny');
    Route::delete('/certificates/delete/{id}', [CertificateController::class, 'destroy'])->name('certificate.destroy');

    // family
    Route::get('familytree/{resident}', [ResidentController::class, 'getFamilyTree'])->name('resident.familytree');
    Route::post('/family-tree/store', [FamilyTreeController::class, 'store'])->name('family_tree.store');
    Route::get('family/showfamily/{family}', [FamilyController::class, 'showFamily'])->name('family.showfamily');
    Route::get('family/getfamilydetails/{id}', [FamilyController::class, 'getFamilyDetails'])->name('family.getdetails');
    Route::get('family/remove/{id}', [FamilyController::class, 'remove'])->name('family.remove');
    Route::get('/family/residents-members', [FamilyController::class, 'getResidentsAndMembersJson'])
        ->name('family.residents-members');
    Route::get('add/family/{id}', [FamilyController::class, 'addFamily'])->name('family.add.family');
    Route::post('add/family/store', [FamilyController::class, 'storeExtendedFamily'])->name('family.extended.store');

    // resident
    Route::get('resident/createresident', [ResidentController::class, 'createResident'])->name('resident.createresident');
    Route::post('resident/storehousehold', [ResidentController::class, 'storeHousehold'])->name('resident.storehousehold');
    Route::get('resident/showresident/{id}', [ResidentController::class, 'showResident'])->name('resident.showresident');
    Route::get('resident/fetchresidents', [ResidentController::class, 'fetchResidents'])->name('resident.fetchresidents');
    Route::get('resident/chartdata', [ResidentController::class, 'chartData'])->name('resident.chartdata');

    // barangay
    Route::get('barangay_management/barangaydetails', [BarangayManagementController::class, 'barangayDetails'])->name('barangay_profile.details');
    Route::get('barangay_official/officialsinfo/{id}', [BarangayOfficialController::class, 'getOfficialInformation'])->name('barangay_official.info');
    Route::get('barangay_infrastructure/details/{id}', [BarangayInfrastructureController::class, 'infrastructureDetails'])->name('barangay_infrastructure.details');
    Route::get('barangay_institution/details/{id}', [BarangayInstitutionController::class, 'institutionDetails'])->name('barangay_institution.details');
    Route::get('barangay_facility/details/{id}', [BarangayFacilityController::class, 'facilityDetails'])->name('barangay_facility.details');
    Route::get('barangay_project/details/{id}', [BarangayProjectController::class, 'projectDetails'])->name('barangay_project.details');
    Route::get('barangay_road/details/{id}', [BarangayRoadController::class, 'roadDetails'])->name('barangay_road.details');
    Route::get('inventory/details/{id}', [InventoryController::class, 'itemDetails'])->name('inventory.details');
    Route::get('institution_member/details/{id}', [InstitutionMemberController::class, 'memberDetails'])->name('institution_member.details');

    // household
    Route::get('household/getlatesthead/{id}', [HouseholdController::class, 'getLatestHead'])->name('household.latesthead');
    Route::get('household/remove/{id}', [HouseholdController::class, 'remove'])->name('household.remove');
    Route::get('/household/latest-house-number', [HouseholdController::class, 'getLatestHouseNumber'])
        ->name('household.latestHouseNumber');

    // senior
    Route::get('senior_citizen/seniordetails/{id}', [SeniorCitizenController::class, 'seniordetails'])->name('senior_citizen.details');

    // education
    Route::get('education/history/{id}', [EducationController::class, 'educationHistory'])->name('education.history');

    // occupation
    Route::get('occupation/details/{id}', [OccupationController::class, 'occupationDetails'])->name('occupation.details');

    // livelihood
    Route::get('livelihood/details/{id}', [LivelihoodController::class, 'livelihoodDetails'])->name('livelihood.details');

    // vehicle
    Route::get('vehicle/details/{id}', [VehicleController::class, 'vehicleDetails'])->name('vehicle.details');

    Route::get('water/details/{id}', [WaterController::class, 'waterDetails'])
    ->name('water.details');
    Route::get('land/details/{id}', [LandController::class, 'landDetails'])
    ->name('land.details');

    Route::get('street', [StreetController::class, 'index'])
    ->name('street.index');
    Route::post('street/store', [StreetController::class, 'store'])
    ->name('street.store');
    Route::put('street/update/{street}', [StreetController::class, 'update'])
    ->name('street.update');
    Route::get('street/details/{id}', [StreetController::class, 'streetDetails'])
    ->name('street.details');
    Route::delete('street/destroy/{street}', [StreetController::class, 'destroy'])
    ->name('street.destroy');


    // user
    Route::post('user/confirmpassword', [UserController::class, 'confirmPassword'])->name('user.confirm');
    Route::get('/user/{id}', [UserController::class, 'accountDetails'])->name('user.details');
    Route::patch('/user/{user}/reset-password', [UserController::class, 'resetPassword'])
    ->name('user.reset-password');

    // reports
    Route::get('report', [ReportGenerationController::class, 'index'])->name('report.index');
    Route::get('report/export-residents-excel', [ReportGenerationController::class, 'exportResidentWithFilters'])
        ->name('report.resident');
    Route::get('report/export-seniorcitizen-excel', [ReportGenerationController::class, 'exportSeniorWithFilters'])
        ->name('report.seniorcitizen');
    Route::get('report/export-family-excel', [ReportGenerationController::class, 'exportFamily'])
        ->name('report.family');
    Route::get('report/export-familymembers-excel', [ReportGenerationController::class, 'exportFamilyMembers'])
        ->name('report.familymembers');
    Route::get('report/export-household-excel', [ReportGenerationController::class, 'exportHousehold'])
        ->name('report.household');
    Route::get('report/export-householdmembers-excel', [ReportGenerationController::class, 'exportHouseholdMembers'])
        ->name('report.householdmembers');
    Route::get('report/export-vehicles-excel', [ReportGenerationController::class, 'exportVehicles'])
        ->name('report.vehicles');
    Route::get('report/export-education-excel', [ReportGenerationController::class, 'exportEducations'])
        ->name('report.education');
    Route::get('report/export-occupations-excel', [ReportGenerationController::class, 'exportOccupations'])
        ->name('report.occupations');
    Route::get('report/export-blotter-reports-excel', [ReportGenerationController::class, 'exportBlotterReports'])
        ->name('report.blotter');
    Route::get('report/export-summon-excel', [ReportGenerationController::class, 'exportSummon'])
        ->name('report.summon');
    Route::get('report/export-medical-excel', [ReportGenerationController::class, 'exportMedical'])
        ->name('report.medical');
    Route::get('report/export-activity-logs-excel', [ReportGenerationController::class, 'exportActivityLogs'])
        ->name('report.activitylogs');

    // reports 2.0
    Route::get('report/export-resident-pdf', [ReportGenerationController::class, 'exportResidentInfoPdf'])
        ->name('report.resident.pdf');
    Route::get('report/export-seniorcitizen-pdf', [ReportGenerationController::class, 'exportSeniorCitizensPdf'])
        ->name('report.seniorcitizen.pdf');
    Route::get('report/export-family-pdf', [ReportGenerationController::class, 'exportFamilyPdf'])
        ->name('report.family.pdf');
    Route::get('report/export-familymembers-pdf', [ReportGenerationController::class, 'exportFamilyMembersPdf'])
        ->name('report.familymembers.pdf');
    Route::get('report/export-household-pdf', [ReportGenerationController::class, 'exportHouseholdPdf'])
        ->name('report.household.pdf');
    Route::get('report/export-householdmembers-pdf', [ReportGenerationController::class, 'exportHouseholdMembersPdf'])
        ->name('report.householdmembers.pdf');
    Route::get('report/export-householdoverview-pdf', [ReportGenerationController::class, 'exportHouseholdOverviewPDF'])
        ->name('report.householdoverview.pdf');
    Route::get('report/export-vehicle-pdf', [ReportGenerationController::class, 'exportVehicleInfoPdf'])
        ->name('report.vehicle.pdf');
    Route::get('report/export-education-pdf', [ReportGenerationController::class, 'exportEducationalHistoryPdf'])
        ->name('report.education.pdf');
    Route::get('report/export-occupations-pdf', [ReportGenerationController::class, 'exportOccupationPdf'])
        ->name('report.occupations.pdf');
    Route::get('report/export-medical-pdf', [ReportGenerationController::class, 'exportMedicalInformationPdf'])
        ->name('report.medical.pdf');
    Route::get('report/export-blotter-reports-pdf', [ReportGenerationController::class, 'exportBlotterReportsPdf'])
        ->name('report.blotter.pdf');
    Route::get('report/export-summon-pdf', [ReportGenerationController::class, 'exportSummonsPdf'])
        ->name('report.summon.pdf');
    Route::get('report/export-allergy-pdf', [ReportGenerationController::class, 'exportAllergyPdf'])
        ->name('report.allergy.pdf');
    Route::get('report/export-medcondition-pdf', [ReportGenerationController::class, 'exportMedicalConditionPdf'])
        ->name('report.medcondition.pdf');
    Route::get('report/export-disabilities-pdf', [ReportGenerationController::class, 'exportDisabilitiesPdf'])
        ->name('report.disabilities.pdf');
    Route::get('report/export-medication-pdf', [ReportGenerationController::class, 'exportMedicationsPdf'])
        ->name('report.medication.pdf');
    Route::get('report/export-pregnancy-pdf', [ReportGenerationController::class, 'exportPregnancyPdf'])
        ->name('report.pregnancy.pdf');
    Route::get('report/export-vaccination-pdf', [ReportGenerationController::class, 'exportVaccinationPdf'])
        ->name('report.vaccination.pdf');
    Route::get('report/export-institution-members-pdf/{id}', [ReportGenerationController::class, 'exportMembersPdf'])
        ->name('report.institution-members.pdf');
    Route::get('report/export-monitoring-form-pdf', [ReportGenerationController::class, 'exportMonitoringReportPdf'])
        ->name('report.monitoring-form.pdf');

    // pregnancy
    Route::get('pregnancy/details/{id}', [PregnancyRecordController::class, 'pregnancyDetails'])->name('pregnancy.details');

    // cra
    Route::get('cra/index', [CRAController::class, 'index'])->name('cra.index');
    Route::get('cra/create', [CRAController::class, 'create'])->name('cra.create');
    Route::get('cra/dashboard', [CRAController::class, 'dashboard'])->name('cra.dashboard');
    Route::get('cra/datacollection', [CRAController::class, 'brgyDataCollection'])->name('cra.datacollection');
    Route::post('cra/store', [CRAController::class, 'store'])->name('cra.store');

    // CRA PDF route
    Route::get('/cra/pdf/{id}', [PDFController::class, 'download'])
        ->name('cra.pdf');


    // death
    Route::get('death/index', [DeathController::class, 'index'])->name('death.index');
    Route::get('death/details/{id}', [DeathController::class, 'deathDetails'])->name('death.details');
    Route::post('death/store', [DeathController::class, 'store'])->name('death.store');
    Route::put('death/update/{id}', [DeathController::class, 'update'])->name('death.update');
    Route::delete('death/destroy/{id}', [DeathController::class, 'destroy'])->name('death.destroy');

    Route::post('/check-email-unique', function (Request $request) {
        $request->validate([
            'email' => 'required|email'
        ]);

        $exists = User::where('email', $request->email)->exists();

        return response()->json(['unique' => !$exists]);
    });

    // households
    Route::get('/overview', [HouseholdController::class, 'householdOverview'])->name('household.overview');
    Route::get('/export-resident-pdf/{id}', [ResidentController::class, 'exportResidentInfo'])
    ->name('resident.export.pdf');
    Route::get('/export-resident-rbi/{id}', [ResidentController::class, 'exportResidentRBI'])
    ->name('resident.export.rbi');
    Route::get('/export-household-rbi/{id}', [HouseholdController::class, 'exportHouseholdRBI'])
    ->name('household.export.rbi');

    // residents
    Route::resource('activity_log', ActivityLogsController::class);
    Route::resource('resident', ResidentController::class);
    Route::resource('document', DocumentController::class);
    Route::resource('household', HouseholdController::class);
    Route::resource('senior_citizen', SeniorCitizenController::class);
    Route::resource('family_relation', FamilyRelationController::class);
    Route::resource('family', FamilyController::class);
    Route::resource('vehicle', VehicleController::class);
    Route::resource('education', EducationController::class);
    Route::resource('occupation', OccupationController::class);
    Route::resource('medical', MedicalInformationController::class);
    Route::resource('livelihood', LivelihoodController::class);
    Route::resource('medical_condition', ResidentMedicalConditionController::class);
    Route::resource('medication', ResidentMedicationController::class);
    Route::resource('vaccination', ResidentVaccinationController::class);
    Route::resource('disability', DisabilityController::class);
    Route::resource('allergy', AllergyController::class);
    Route::resource('pregnancy', PregnancyRecordController::class);
    Route::resource('child_record', ChildHealthMonitoringController::class);
    Route::resource('water', WaterController::class);
    Route::resource('land', LandController::class);

    // Katarungnang Pambarangay
    Route::get('summon/elevate/{id}', [SummonController::class, 'elevate'])->name('summon.elevate');
    Route::get('blotter_report/generateform/{id}', [BlotterController::class, 'generateForm'])->name('blotter_report.generateForm');
    Route::get('summon/generateform/{id}', [SummonController::class, 'generateForm'])->name('summon.generateForm');
    Route::get('summon/fileaction/{id}', [SummonController::class, 'generateFileAction'])->name('summon.fileaction');
    Route::get('summon/session/{id}', [SummonController::class, 'sessionDetails'])->name('summon.session.details');
    Route::post('summon/session/update/{id}', [SummonController::class, 'updateSession'])->name('summon.update.details');
    Route::delete('summon/session/delete/{id}', [SummonController::class, 'deleteSession'])->name('summon.delete.details');
    Route::resource('blotter_report', BlotterController::class);
    Route::resource('case_participant', CaseParticipantController::class);
    Route::resource('summon', SummonController::class);

    // barangay
    Route::resource('barangay_official', BarangayOfficialController::class);
    Route::resource('barangay_project', BarangayProjectController::class);
    Route::resource('barangay_infrastructure', BarangayInfrastructureController::class);
    Route::resource('barangay_facility', BarangayFacilityController::class);
    Route::resource('barangay_road', BarangayRoadController::class);
    Route::resource('barangay_institution', BarangayInstitutionController::class);
    Route::resource('inventory', InventoryController::class);
    Route::resource('institution_member', InstitutionMemberController::class);
});

Route::middleware(['auth', 'role:barangay_officer'])->group(function () {
    Route::get('/barangay_officer', function () {
        return redirect()->route('barangay_officer.dashboard');
    });
    Route::get('/barangay_officer/dashboard', [DashboardController::class, 'dashboard'])
        ->name('barangay_officer.dashboard');
});

Route::middleware(['auth', 'role:admin|super_admin'])->group(function () {
    Route::get('/admin', function () {
        return redirect()->route('admin.dashboard');
    });
    Route::get('/admin/dashboard', [DashboardController::class, 'dashboard'])
        ->name('admin.dashboard');

    Route::get('/barangay_profile', [BarangayProfileController::class, 'index'])->name('barangay_profile.index');
    Route::put('/barangay_profile/update/{barangay}', [BarangayProfileController::class, 'update'])->name('barangay_profile.update');

    Route::resource('user', UserController::class);
});

Route::middleware(['auth', 'role:cdrrmo_admin'])->prefix('cdrrmo_admin')->group(function () {
    Route::get('/dashboard', [CDRRMOAdminController::class, 'index'])
        ->name('cdrrmo_admin.dashboard');
    Route::get('alldatacollection', [CDRRMOAdminController::class, 'allDataCollectionSummary'])
        ->name('cdrrmo_admin.datacollection');

    Route::post('/addCRA', [CRADataController::class, 'addCRA'])->name('cdrrmo_admin.addcra');

    Route::get('/population', [CRADataController::class, 'population'])->name('cdrrmo_admin.population');
    Route::get('/livelihood', [CRADataController::class, 'livelihood'])->name('cdrrmo_admin.livelihood');
    Route::get('/services', [CRADataController::class, 'services'])->name('cdrrmo_admin.services');
    Route::get('/infraFacilities', [CRADataController::class, 'infraFacilities'])->name('cdrrmo_admin.infraFacilities');
    Route::get('/primaryFacilities', [CRADataController::class, 'primaryFacilities'])->name('cdrrmo_admin.primaryFacilities');
    Route::get('/institutions', [CRADataController::class, 'institutions'])->name('cdrrmo_admin.institutions');
    Route::get('/humanResources', [CRADataController::class, 'humanResources'])->name('cdrrmo_admin.humanResources');
    Route::get('/populationimpact', [CRADataController::class, 'populationimpact'])->name('cdrrmo_admin.populationimpact');
    Route::get('/effectimpact', [CRADataController::class, 'effectimpact'])->name('cdrrmo_admin.effectimpact');
    Route::get('/damageproperty', [CRADataController::class, 'damageproperty'])->name('cdrrmo_admin.damageproperty');
    Route::get('/damageagri', [CRADataController::class, 'damageagri'])->name('cdrrmo_admin.damageagri');
    Route::get('/disasterlifelines', [CRADataController::class, 'disasterlifelines'])->name('cdrrmo_admin.disasterlifelines');
    Route::get('/hazardrisks', [CRADataController::class, 'hazardRisks'])->name('cdrrmo_admin.hazardrisks');
    Route::get('/riskmatrix', [CRADataController::class, 'riskMatrix'])->name('cdrrmo_admin.riskmatrix');
    Route::get('/vulnerabilitymatrix', [CRADataController::class, 'vulnerabilityMatrix'])->name('cdrrmo_admin.vulnerabilitymatrix');
    Route::get('/populationexposure', [CRADataController::class, 'populationExposure'])->name('cdrrmo_admin.populationexposure');
    Route::get('/disabilities', [CRADataController::class, 'disabilityStatistics'])->name('cdrrmo_admin.disabilities');
    Route::get('/familiesatrisk', [CRADataController::class, 'familyAtRisk'])->name('cdrrmo_admin.familiesatrisk');
    Route::get('/illnessesstats', [CRADataController::class, 'illnessStatistics'])->name('cdrrmo_admin.illnessesstats');
    Route::get('/disasterpopulation', [CRADataController::class, 'disasterRiskPopulation'])->name('cdrrmo_admin.disasterpopulation');
    Route::get('/disasterinventory', [CRADataController::class, 'disasterInventories'])->name('cdrrmo_admin.disasterinventory');
    Route::get('/evacuationcenters', [CRADataController::class, 'evacuationCenters'])->name('cdrrmo_admin.evacuationcenters');
    Route::get('/evacuationinven', [CRADataController::class, 'evacuationInventories'])->name('cdrrmo_admin.evacuationinven');
    Route::get('/affectedPlaces', [CRADataController::class, 'affectedPlaces'])->name('cdrrmo_admin.affectedPlaces');
    Route::get('/livelihoodEvacuationSites', [CRADataController::class, 'livelihoodEvacuationSites'])->name('cdrrmo_admin.livelihoodEvacuationSites');
    Route::get('/prepositionedInventories', [CRADataController::class, 'prepositionedInventories'])->name('cdrrmo_admin.prepositionedInventories');
    Route::get('/reliefDistributions', [CRADataController::class, 'reliefDistributions'])->name('cdrrmo_admin.reliefDistributions');
    Route::get('/reliefProcess', [CRADataController::class, 'reliefDistributionProcesses'])->name('cdrrmo_admin.reliefProcess');
    Route::get('/bdrrmcTrainings', [CRADataController::class, 'bdrrmcTrainings'])->name('cdrrmo_admin.bdrrmcTrainings');
    Route::get('/equipmentInventories', [CRADataController::class, 'equipmentInventories'])->name('cdrrmo_admin.equipmentInventories');
    Route::get('/bdrrmcDirectories', [CRADataController::class, 'bdrrmcDirectories'])->name('cdrrmo_admin.bdrrmcDirectories');
    Route::get('/evacuationPlans', [CRADataController::class, 'evacuationPlans'])->name('cdrrmo_admin.evacuationPlans');
    Route::delete('/cra/delete/{year}', [CRADataController::class, 'destroy'])->name('cdrrmo_admin.destroy');

    // reports
    Route::get('/cra/population-exposure-summary/pdf', [ReportGenerationController::class, 'exportPopulationExposureSummary'])
    ->name('population.exposure.summary.pdf');
    Route::get('/cra/population-overview-summary/pdf', [ReportGenerationController::class, 'exportPopulationOverviewSummary'])
    ->name('population.overview.summary.pdf');
    Route::get('/cra/top-hazard/pdf', [ReportGenerationController::class, 'exportTopHazardsSummary'])
    ->name('top-hazard.summary.pdf');
    Route::get('/cra/livelihood-summary/pdf', [ReportGenerationController::class, 'exportLivelihoodSummary'])
    ->name('livelihood.summary.pdf');
    Route::get('/cra/hr-summary/pdf', [ReportGenerationController::class, 'exportHumanResourcesSummary'])
    ->name('hr.summary.pdf');
    Route::get('/cra/disaster-risk-population-summary/pdf', [ReportGenerationController::class, 'exportOverallDisasterRiskPopulationSummary'])
    ->name('disasterriskpopulation.summary.pdf');
    Route::get('/cra/risk-assessment-summary/pdf', [ReportGenerationController::class, 'exportOverallRiskMatrixSummary'])
    ->name('riskassessment.summary.pdf');
    Route::get('/cra/vulnerability-assessment-summary/pdf', [ReportGenerationController::class, 'exportOverallVulnerabilityMatrixSummary'])
    ->name('vulnerabilityassessment.summary.pdf');
});

// Super Admin-only routes
Route::middleware(['auth', 'role:super_admin'])->prefix('super_admin')->group(function () {
    Route::get('/dashboard', [SuperAdminController::class, 'index'])->name('super_admin.dashboard');
    Route::get('/accounts', [SuperAdminController::class, 'accounts'])->name('super_admin.accounts');
    Route::put('/update/account/{id}', [SuperAdminController::class, 'updateAccount'])->name('super_admin.account.update');
    Route::post('/store/account', [SuperAdminController::class, 'addAccount'])->name('super_admin.account.store');
    Route::get('/details/{id}', [SuperAdminController::class, 'accountDetails'])->name('super_admin.account.details');
    Route::get('/barangay_details/{id}', [BarangayController::class, 'barangayDetails'])->name('barangay.details');
    Route::resource('barangay', BarangayController::class);

    // reports
    Route::get('/statistics/population-summary', [SuperAdminDataController::class, 'populationSummary'])->name('super_admin.statistics.population_summary');
    Route::get('/statistics/employment-summary', [SuperAdminDataController::class, 'employmentSummary'])->name('super_admin.statistics.employment_summary');


    // exports
    Route::get('/statistics/population-summary-export', [SuperAdminDataController::class, 'exportPopulationSummaryByAgeGroup'])->name('super_admin.export.population_summary');
    Route::get('/statistics/purok-population-summary-export', [SuperAdminDataController::class, 'exportPopulationSummaryByPurok'])->name('super_admin.export.purok_population_summary');
    Route::get('/statistics/sex-population-summary-export', [SuperAdminDataController::class, 'exportPopulationSummaryBySex'])->name('super_admin.export.sex_population_summary');
    Route::get('/statistics/employment-summary-export', [SuperAdminDataController::class, 'exportEmploymentSummary'])->name('super_admin.export.employment_summary');

});
// Resident-only routes
Route::middleware(['auth', 'role:resident'])->prefix('account')->group(function () {
    Route::get('/dashboard', [ResidentAccountController::class, 'dashboard'])->name('resident_account.dashboard');
    Route::get('/certificates', [ResidentAccountController::class, 'residentCertificates'])->name('resident_account.certificates');
    Route::get('/document/fetchplaceholders/{id}', [DocumentController::class, 'fetchPlaceholders'])
        ->name('resident.document.placeholders');
    Route::post('/certificate-request', [ResidentAccountController::class, 'requestCertificate'])
        ->name('resident.certificate.store');
    Route::delete('/certificate/cancel/{id}', [ResidentAccountController::class, 'destroy'])->name('resident_account.certificate.destroy');
});

Route::middleware(['auth', 'role:resident|barangay_officer'])->group(function () {
    Route::get('/account/user/basic-information', [ResidentAccountController::class, 'basicInformation'])
        ->name('resident_account.basic.info');

    Route::put('/account/user/update-information', [ResidentAccountController::class, 'updateInfo'])
        ->name('resident_account.update.info');
});

// Routes accessible to both resident and admin users (verified users)
Route::middleware(['auth', 'role:resident|barangay_officer|super_admin|admin|cdrrmo_admin'])->group(function () {
    // Profile management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});




require __DIR__ . '/auth.php';
