<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('occupations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resident_id')->constrained('residents')->onDelete('cascade');
            $table->string('occupation', 155)->nullable();
            $table->enum('employment_type', [
                'full_time',
                'part_time',
                'seasonal',
                'contractual',
                'self_employed',
                'under_employed'
            ])->nullable();
            $table->enum('work_arrangement', ['remote', 'on_site', 'hybrid'])->nullable();
            $table->string('employer', 155)->nullable();
            $table->enum('occupation_status', ['active', 'inactive', 'ended', 'retired', 'terminated', 'resigned'])->nullable();
            $table->boolean('is_ofw')->nullable()->default(false);
            $table->boolean('is_main_livelihood')->nullable()->default(false);
            $table->year('started_at')->nullable();
            $table->year('ended_at')->nullable();
            $table->decimal('monthly_income', 11, 2)->nullable();
            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('occupations');
    }
};
