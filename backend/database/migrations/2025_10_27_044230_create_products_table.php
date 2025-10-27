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
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('supplier_id');
            $table->string('name');
            $table->enum('type', ['flight', 'hotel', 'car', 'tour', 'package', 'insurance', 'other']);
            $table->string('code')->nullable();
            $table->text('description')->nullable();
            $table->decimal('base_price', 10, 2);
            $table->string('currency', 3)->default('USD');
            $table->json('pricing_rules')->nullable();
            $table->json('availability')->nullable();
            $table->text('terms_conditions')->nullable();
            $table->json('specifications')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
