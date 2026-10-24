<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BuyController;
use App\Http\Controllers\Api\EmailOtpController;
use App\Http\Controllers\Api\LandController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\SellController;
use App\Http\Controllers\Api\EmailOtpController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| LandMarket API  (every URL below is prefixed with /api)
|--------------------------------------------------------------------------
| One controller per job:
|   AuthController           register, login, me, logout and the account pages
|   PasswordResetController  forgot and reset password by emailed code
|   EmailOtpController       verify the logged-in user's email by emailed code
|   LandController           what anyone can see: lands and sellers' store pages
|   BuyController            everything a buyer does
|   SellController           everything a seller does
|   AdminController          the admin tools
|
| Who can call what:
|   1. Public      auth/register, login, forgot-password, verify-reset-code, reset-password; lands/*, stores/*
|   2. Logged in   auth/me, logout; account/* (profile, password, role, avatar, email)
|   3. Buyer       buyer/* and lands/{land}/inquiries      auth:sanctum + role:buyer
|   4. Seller      seller/*                                auth:sanctum + role:seller
|   5. Admin       admin/*                                 auth:sanctum + role:admin
|
| The `role` middleware alias is registered in bootstrap/app.php (see EnsureRole).
*/

/* ===================================================================== 1. PUBLIC */

/* ---------------------------------------------------------------- Auth (guest) */
Route::prefix('auth')->name('auth.')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:10,1')->name('register');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1')->name('login');

<<<<<<< HEAD
    // Forgot password in three steps: email a code, check the code (returns a token), set the new password.
    // The first step always answers 200, so it never reveals which emails have accounts.
    Route::post('forgot-password', [PasswordResetController::class, 'forgot'])->middleware('throttle:6,10')->name('forgot');
    Route::post('verify-reset-code', [PasswordResetController::class, 'verifyCode'])->middleware('throttle:20,10')->name('verify-reset');
    Route::post('reset-password', [PasswordResetController::class, 'reset'])->middleware('throttle:10,10')->name('reset');
});

/* ------------------------------------------------------------- Lands and stores */
=======
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me'])->name('me');
        Route::post('logout', [AuthController::class, 'logout'])->name('logout');

        Route::post('send-otp', [EmailOtpController::class, 'send'])->middleware('throttle:6,10');
        Route::post('verify', [EmailOtpController::class, 'verify'])->middleware('throttle:20,10');
    });
});

/* ------------------------------------------------------------- Account */
// Every logged-in role: profile, password and the one-time "user -> buyer|seller" choice.
Route::middleware('auth:sanctum')->prefix('account')->name('account.')->group(function () {
    Route::put('profile', [AuthController::class, 'updateProfile'])->name('profile');
    Route::put('password', [AuthController::class, 'updatePassword'])->name('password');
    Route::patch('role', [AuthController::class, 'updateRole'])->name('role'); // { role: buyer|seller }
    Route::post('avatar', [AuthController::class, 'updateAvatar'])->middleware('throttle:10,1')->name('avatar'); // multipart: avatar
    Route::delete('avatar', [AuthController::class, 'deleteAvatar'])->name('avatar.destroy');

    Route::prefix('email')->name('email.')->group(function () {
        Route::post('send-otp', [EmailOtpController::class, 'send'])->middleware('throttle:6,10')->name('send');
        Route::post('verify', [EmailOtpController::class, 'verify'])->middleware('throttle:20,10')->name('verify');
    });
});

/* -------------------------------------------------------------- Public */
>>>>>>> 28b5ddfd326781e19d70ed92f750195485336fce
// GET /lands?district=&q=&max_price=&min_area=&min_road=&sort=price-asc|price-desc|area-desc|area-asc
Route::get('lands', [LandController::class, 'index'])->name('lands.index');
Route::get('lands/{land}', [LandController::class, 'show'])->name('lands.show');

Route::get('stores', [LandController::class, 'stores'])->name('stores.index');
Route::get('stores/{store}', [LandController::class, 'showStore'])->name('stores.show');
Route::get('stores/{store}/lands', [LandController::class, 'storeLands'])->name('stores.lands');

/* =================================================================== 2. LOGGED IN */
// Every role.
Route::middleware('auth:sanctum')->group(function () {

    /* ---------------------------------------------------------------- Session */
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::get('me', [AuthController::class, 'me'])->name('me');
        Route::post('logout', [AuthController::class, 'logout'])->name('logout');
    });

    /* ---------------------------------------------------------------- Account */
    // Profile, password, the one-time "user -> buyer|seller" choice, avatar and email verification.
    Route::prefix('account')->name('account.')->group(function () {
        Route::put('profile', [AuthController::class, 'updateProfile'])->name('profile');
        Route::put('password', [AuthController::class, 'updatePassword'])->name('password');
        Route::patch('role', [AuthController::class, 'updateRole'])->name('role'); // { role: buyer|seller }
        Route::post('avatar', [AuthController::class, 'updateAvatar'])->middleware('throttle:10,1')->name('avatar'); // multipart: avatar
        Route::delete('avatar', [AuthController::class, 'deleteAvatar'])->name('avatar.destroy');

        // Email verification by one-time code
        Route::prefix('email')->name('email.')->group(function () {
            Route::post('send-otp', [EmailOtpController::class, 'send'])->middleware('throttle:6,10')->name('send');   // emails a code
            Route::post('verify', [EmailOtpController::class, 'verify'])->middleware('throttle:20,10')->name('verify'); // { code }
        });
    });
});

/* ======================================================================= 3. BUYER */
Route::middleware(['auth:sanctum', 'role:buyer'])->group(function () {
    // Send an inquiry about a land.
    Route::post('lands/{land}/inquiries', [BuyController::class, 'sendInquiry'])
        ->middleware('throttle:20,1')
        ->name('lands.inquiries.store');

    Route::prefix('buyer')->name('buyer.')->group(function () {
        Route::get('inquiries', [BuyController::class, 'inquiries'])->name('inquiries.index');

        // Saved lands (the heart button)
        Route::get('saved', [BuyController::class, 'saved'])->name('saved.index');
        Route::post('saved/{land}', [BuyController::class, 'saveLand'])->name('saved.store');
        Route::delete('saved/{land}', [BuyController::class, 'unsaveLand'])->name('saved.destroy');

        // "Post demand": what the buyer is looking for
        Route::get('demands', [BuyController::class, 'demands'])->name('demands.index');
        Route::post('demands', [BuyController::class, 'createDemand'])->name('demands.store');
        Route::patch('demands/{demand}', [BuyController::class, 'updateDemand'])->name('demands.update'); // { status: open|closed }

        // Lands this buyer bought, with their ownership record
        Route::get('purchases', [BuyController::class, 'purchases'])->name('purchases.index');
        Route::post('purchases/{land}/resell', [BuyController::class, 'resellLand'])->name('purchases.resell'); // { buyer_name, buyer_email? }
    });
});

/* ====================================================================== 4. SELLER */
Route::middleware(['auth:sanctum', 'role:seller'])->prefix('seller')->name('seller.')->group(function () {
    // Dashboard overview
    Route::get('summary', [SellController::class, 'summary'])->name('summary');

    // Listings go live as soon as they are added.
    Route::get('lands', [SellController::class, 'lands'])->name('lands.index');
    Route::post('lands', [SellController::class, 'createLand'])->name('lands.store');
    Route::get('lands/{land}', [SellController::class, 'showLand'])->name('lands.show');
    Route::put('lands/{land}', [SellController::class, 'updateLand'])->name('lands.update');
    Route::patch('lands/{land}/status', [SellController::class, 'setLandStatus'])->name('lands.status'); // { status: active|sold|closed, buyer_name?, buyer_email? }
    Route::delete('lands/{land}', [SellController::class, 'deleteLand'])->name('lands.destroy');

    // Inbox for this seller's store
    Route::get('inquiries', [SellController::class, 'inquiries'])->name('inquiries.index');
    Route::patch('inquiries/{inquiry}', [SellController::class, 'updateInquiry'])->name('inquiries.update'); // { status: replied|closed }
    Route::post('inquiries/{inquiry}/replies', [SellController::class, 'replyInquiry'])->middleware('throttle:30,1')->name('inquiries.reply'); // { message }

    // Open buyer demands, with how many of this seller's lands match each
    Route::get('demands', [SellController::class, 'demands'])->name('demands.index');

    // Store profile
    Route::get('store', [SellController::class, 'showStore'])->name('store.show');
    Route::put('store', [SellController::class, 'updateStore'])->name('store.update');
});

/* ======================================================================= 5. ADMIN */
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard overview: user, seller and listing counts
    Route::get('summary', [AdminController::class, 'summary'])->name('summary');

    // Users: GET /admin/users?role=&q=   and suspend or reactivate
    Route::get('users', [AdminController::class, 'users'])->name('users.index');
    Route::patch('users/{user}/status', [AdminController::class, 'setUserStatus'])->name('users.status'); // { status: active|suspended }

    // Listing management: see every listing, remove the ones that should not be there
    Route::get('lands', [AdminController::class, 'lands'])->name('lands.index');
    Route::delete('lands/{land}', [AdminController::class, 'deleteLand'])->name('lands.destroy');
});
