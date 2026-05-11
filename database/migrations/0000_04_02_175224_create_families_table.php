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
    Schema::create('families', function (Blueprint $table) {
        $table->id();

        $table->foreignId('barangay_id')
            ->constrained('barangays')
            ->onDelete('cascade');

        $table->foreignId('household_id')
            ->nullable()
            ->constrained('households')
            ->onDelete('cascade');
        $table->decimal('family_monthly_income', 12, 2)->nullable();
        $table->enum('income_bracket', [
            'poor',
            'low_income_non_poor',
            'lower_middle_income',
            'middle_middle_income',
            'upper_middle_income',
            'upper_income',
            'rich',
        ])->nullable();

        $table->enum('income_category', [
            'low_income',
            'middle_income',
            'high_income',
        ])->nullable();

        $table->string('family_name', 55)->nullable();
        $table->string('family_type', 55)->nullable();

        $table->timestamps();
    });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('families');
    }
};
