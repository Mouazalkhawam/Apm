<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\GradeService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register()
{
    $this->app->bind(GradeService::class, function ($app) {
        return new GradeService();
    });
}
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
