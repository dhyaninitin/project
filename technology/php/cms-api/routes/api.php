<?php

use Illuminate\Http\Request;
use App\Model\PortalUser;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::group([
    'prefix' => 'auth'
], function () {
    Route::post('login', 'AuthController@twoFactorAuthantication');
    Route::post('verify', 'AuthController@login');
    Route::post('signup', 'AuthController@signup');

    Route::group(
        [
            'middleware' => 'auth:api'
        ],
        function () {
            Route::get('logout', 'AuthController@logout')->name('auth.logout');
            Route::get('user', 'AuthController@user')->name('auth.show');
            Route::put('user', 'AuthController@update')->name('auth.update');
        }
    );
});

Route::group([
    'middleware' => 'auth:api'
], function () {

    // Api resource for registered users. testing auto.

    Route::prefix('users')->group(
        function () {
            Route::get('/', 'UserController@index')->name('users.index');
            Route::get('/getCreatedBy', 'UserController@getCreatedBy')->name('user.getCreatedBy');
        }
    );

    Route::prefix('user')->group(
        function () {
            Route::post('', 'UserController@store')->name('user.store');
            Route::get('/logs', 'UserController@userslogs')->name('user.userslogs');
            Route::get('/{id}', 'UserController@show')->name('user.show');
            Route::get('/{user}/logs', 'UserController@logs')->name('user.logs');
            Route::put('/{id}', 'UserController@update')->name('user.update');
            Route::delete('/{id}', 'UserController@destroy')->name('user.delete');
            Route::post('/{user}/toggle', 'UserController@toggle')->name('user.toggle');
            Route::post('/secondary-email', 'UserController@checkContactSecondaryEmails')->name('user.checkContactSecondaryEmails');
            Route::post('/secondary-phone', 'UserController@checkContactSecondaryPhoneNumber')->name('user.checkContactSecondaryPhoneNumber');
        }
    );

    // Api resource for locations

    Route::prefix('locations')->group(
        function () {
            Route::get('/', 'LocationController@index')->name('users.index');
        }
    );
    Route::prefix('location')->group(
        function () {
            Route::post('', 'LocationController@store')->name('user.store');
            Route::get('/{id}', 'LocationController@show')->name('user.show');
            Route::put('/{id}', 'LocationController@update')->name('user.update');
            Route::delete('/{id}', 'LocationController@destroy')->name('user.delete');
        }
    );

    // Api resource for roles

    Route::prefix('roles')->group(
        function () {
            Route::get('/', 'RoleController@index')->name('roles.index');
        }
    );

    // Api resource for portal users

    Route::prefix('portalusers')->group(
        function () {
            Route::get('/', 'PortalUserController@index')->name('portaluser.index');
            Route::get('/with-nophone-assigned', 'PortalUserController@indexByNoPhoneAssigned');
            Route::post('/byFilter', 'PortalUserController@byFilter')->name('portaluser.byfilter');
            Route::get('/delete-log', 'PortalUserController@delete_log')->name('portaluser.delete_log');
            Route::get('/filterByRole/{coming_from}', 'PortalUserController@contactOwnersFilterByRole')->name('portaluser.contactOwnersFilterByRole');
        }
    );

    Route::prefix('profile')->group(
        function () {
            Route::post('/upload', 'PortalUserController@createPresignedUrl')->name('profile.createPresignedUrl');
        }
    );

    Route::prefix('file')->group(
        function () {
            Route::post('/upload', 'PortalUserController@fileupload')->name('profile.fileupload');
        }
    );

    Route::prefix('portaluser')->group(
        function () {

            Route::post('', 'PortalUserController@store')->name('portaluser.store');
            Route::get('/{portal_user}', 'PortalUserController@show')->name('portaluser.show');
            Route::get('/{portal_user}/logs', 'PortalUserController@logs')->name('portaluser.logs');
            Route::put('/{portal_user}', 'PortalUserController@update')->name('portaluser.update');
            Route::put('/{portal_user}/rr', 'PortalUserController@updateRR')->name('portaluser.update_rr');
            Route::delete('/{portal_user}', 'PortalUserController@destroy')->name('portaluser.delete');
            Route::post('/{portal_user}/toggle', 'PortalUserController@toggle')->name('portaluser.toggle');

        }
    );

    Route::prefix('rr')->group(
        function () {
            Route::get('/get-rr/{portalemail}', 'PortalUserController@getrrdetails')->name('portaluser.getrrdetails');
            Route::put('/update-rr', 'PortalUserController@updaterrdetails')->name('portaluser.updaterrdetails');
            Route::put('/rrdefaultuser', 'PortalUserController@upaterrdefaultUser')->name('portaluser.upaterrdefault');
        }
    );



    // Api resource for requests

    Route::prefix('requests')->group(
        function () {
            Route::get('/', 'VehicleRequestController@index')->name('request.index');
            Route::get('/delete-log', 'VehicleRequestController@delete_log')->name('request.delete_log');
            Route::get('/board-view', 'VehicleRequestController@getBoardViewDeals')->name('request.getBoardViewDeals');
            Route::put('/dealstage/{id}', 'VehicleRequestController@updateDealStage')->name('request.updateDealStage');
            Route::get('/deals/pipeline', 'VehicleRequestController@HubspotDealStagePipeline')->name('request.HubspotDealStagePipeline');
        }
    );

    Route::prefix('request')->group(
        function () {
            //API's for getting filters for request listing STARTS
            Route::get('/getRequestYears', 'VehicleRequestController@getRequestYears')->name('request.getRequestYears');
            Route::get('/requestsBrandByYear', 'VehicleRequestController@requestsBrandByYear')->name('request.requestsBrandByYear');
            Route::get('/requestsModelByYear', 'VehicleRequestController@requestsModelByYear')->name('request.requestsModelByYear');
            Route::get('/allRequestSources', 'VehicleRequestController@allRequestSources')->name('request.allRequestSources');
            //API's for getting filters for request listing ENDS
            Route::post('', 'VehicleRequestController@store')->name('request.store');
            Route::get('/{request}', 'VehicleRequestController@show')->name('request.show');
            Route::get('/{request}/quotes', 'VehicleRequestController@getQuotes')->name('request.quotes');
            Route::get('/{request}/logs', 'VehicleRequestController@logs')->name('request.logs');
            Route::delete('/{request}', 'VehicleRequestController@destroy')->name('request.delete');
            Route::get('/{user_id}/alluser_requests', 'VehicleRequestController@getAllRequestByUserId')->name('request.alluser_requests');
            Route::post('/quotes/logs', 'VehicleRequestController@logsByTargetIds')->name('request.logsByTargetIds');
            Route::put('/{id}', 'VehicleRequestController@update')->name('request.update');
            Route::post('/createWithNAOption', 'VehicleRequestController@storeDeal')->name('request.storeDeal');
        }
    );

    // Logs
    Route::prefix('logs')->group(
        function () {
            Route::get('/', 'LogController@index')->name('log.index');
            Route::post('/create', 'LogController@create')->name('log.create');
        }
    );

    // Exports
    Route::prefix('export')->group(
        function () {
            Route::post('/request', 'ExportController@request')->name('export.request');
            Route::post('/quote', 'ExportController@quote')->name('export.quote');
            Route::post('/quote-print', 'ExportController@quotePrint')->name('export.quote-print');
            Route::post('/wholesale-quote-print', 'ExportController@wholesaleQuotePrint')->name('export.wholesale-quote-print');
            Route::post('/reports', 'ExportController@reports')->name('export.reports');
            Route::post('/deals', 'ExportController@deals')->name('export.deals');
            Route::post('/contact', 'ExportController@contact')->name('export.contact');
        }
    );

    
});

Route::prefix('export')->group(function () {
    Route::get('/download', 'ExportController@download')->name('export.download');
});

Route::post('forgetpassword', 'Auth\ForgotPasswordController@forgetpassword');
Route::post('forgotpassword', 'Auth\ForgotPasswordController@getResetToken');
Route::post('changepassword', 'Auth\ResetPasswordController@reset');


Route::prefix('logs')->group(function () {
    Route::post('/not-found', 'LogController@notFound')->name('log.notFound');
    // Route::post('/workflow', 'LogController@workFlowLogs')->name('log.workFlowLogs');
});
