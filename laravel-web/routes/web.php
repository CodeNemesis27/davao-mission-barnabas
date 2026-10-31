<?php

use App\Http\Middleware\RedirectToRolePanel;
use Illuminate\Support\Facades\Route;

Route::view('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified', RedirectToRolePanel::class])->group(function () {
    Route::view('dashboard', 'dashboard')->name('dashboard');
});

Route::middleware(['auth', 'verified', 'role:Member'])->group(function () {
    // Pastor-only Starter Kit pages go here.
});

require __DIR__ . '/settings.php';
