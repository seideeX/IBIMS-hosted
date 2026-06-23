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
        Schema::create('barangays', function (Blueprint $table) {
            $table->id();
            $table->string('barangay_name', 50);
            $table->string('city', 30);
            $table->string('province', 30);
            $table->char('zip_code', 4);
            $table->string('contact_number', 15)->nullable();
            $table->decimal('area_sq_km', 5, 2)->nullable();
            $table->string('email', 50)->nullable();
            $table->text('logo_path')->nullable();
            $table->smallInteger('founded_year')->nullable();
            $table->string('barangay_code', 20)->nullable();
            $table->enum('barangay_type', ['rural', 'urban']);
            // GIS Fields
            $table->json('boundary_coordinates')->nullable();

            // Barangay Hall
            $table->string('barangay_hall_address')->nullable();
            $table->decimal('barangay_hall_latitude', 10, 8)->nullable();
            $table->decimal('barangay_hall_longitude', 11, 8)->nullable();
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('barangays');
    }
};
