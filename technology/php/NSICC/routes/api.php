<?php

use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Route;

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
    // AUth API
    Route::group(['prefix' => 'auth'], function () {

        Route::post('login', 'Auth\ApiAuthController@login');
        Route::post('signup', 'Auth\ApiAuthController@register');
        Route::group(['middleware' => ['jwt.verify']], function() {
            Route::get('user', 'Auth\ApiAuthController@getAuthenticatedUser');
        });

    });

    //api calls for website users
    Route::group(['middleware' => 'auth.apikey'], function() {
        Route::prefix('services')->group(function() {
            Route::post('/marriage', 'ServiceController@storeMarriage')->name('services.storeMarriage');
            Route::post('/matrimonial', 'ServiceController@storeMatrimonial')->name('services.storeMatrimonial');
            Route::post('/funeral', 'ServiceController@storeFuneral')->name('services.storeFuneral');
        });
    });

    // Api resource for logged in users.
    Route::group(['middleware' => 'jwt.verify'], function() {
  
    Route::prefix('services')->group(function() {
        // marriage service api
        Route::get('/marriage', 'ServiceController@marriagelist')->name('services.marriagelist');
        Route::get('/marriage/{id}/edit', 'ServiceController@editMarriage')->name('services.editMarriage');
        Route::put('/marriage/{id}', 'ServiceController@updateMarriage')->name('services.updateMarriage');
        Route::delete('/marriage/{id}', 'ServiceController@deleteMarriage')->name('services.deleteMarriage');
      
        // Matrimonial service api
        Route::get('/matrimonial', 'ServiceController@matrimonialList')->name('services.matrimonialList');
        Route::put('/matrimonial/{id}', 'ServiceController@updateMatrimonial')->name('services.updateMatrimonial');
        Route::delete('/matrimonial/{id}', 'ServiceController@deleteMatrimonial')->name('services.deleteMatrimonial');

        // Funeral service api
          Route::get('/funeral', 'ServiceController@funerallist')->name('services.funerallist');
          Route::put('/funeral/{id}', 'ServiceController@updateFuneral')->name('services.updateFuneral');
          Route::delete('/funeral/{id}', 'ServiceController@deleteFuneral')->name('services.deleteFuneral');
          Route::put('/funeralStatus/{id}', 'ServiceController@updateFuneralStatus')->name('services.updateFuneralStatus');
    });

    Route::prefix('school')->group(function() {
         // School Configuration api
         Route::post('/academic ', 'schoolconfigController@addacademic')->name('school.addAcademic');
         Route::get('/academic', 'schoolconfigController@academiclist')->name('services.academiclist');
         Route::get('/studentFees', 'schoolconfigController@studentFeeslist')->name('services.studentFeeslist');
         Route::post('/studentFees ', 'schoolconfigController@addStudentFees')->name('school.addStudentFees');
         Route::put('/studentFees/{id}', 'schoolconfigController@updateStudentFees')->name('services.updateStudentFees');
         Route::delete('/studentFees/{id}', 'schoolconfigController@deleteStudentFees')->name('services.deleteStudentFees');   
        // School registration  api(weekend/weekdays)
        Route::post('/schoolReg ', 'SchoolController@schoolReg')->name('school.schoolReg');
        Route::get('/schoolReg', 'SchoolController@schoolRegList')->name('school.schoolRegList');
        Route::put('/schoolReg/{id}', 'SchoolController@UpdateschoolReg')->name('school.UpdateschoolReg');
        Route::delete('/schoolReg/{id}', 'SchoolController@DeleteschoolReg')->name('school.DeleteschoolReg');
        // Student  api(weekend/weekdays)
        Route::get('/Student', 'SchoolController@StudentList')->name('school.StudentList');
        Route::post('/Student ', 'SchoolController@addStudent')->name('school.addStudent');
        Route::put('/Student/{id}', 'SchoolController@UpdateStudent')->name('school.UpdateStudent');
        Route::delete('/Student/{id}', 'SchoolController@DeleteStudent')->name('school.DeleteStudent');

    });

       //System Users  api
       Route::prefix('Users')->group(function() {
        Route::get('/', 'UserController@index')->name('Users.index');
        Route::post('/user', 'UserController@store')->name('Users.store');
        Route::get('/user/{userid}/edit', 'UserController@show')->name('Users.show');
        Route::put('/user/{userid}', 'UserController@update')->name('Users.update');
        Route::delete('/user/{userid}', 'UserController@delete')->name('Users.delete');
    });
         // Donation Type API
    Route::prefix('Donations')->group(function() {
        Route::get('/type', 'DonationsController@gettype')->name('Donations.gettype');
        Route::post('/type', 'DonationsController@storetype')->name('Donations.storetype');
        Route::delete('/type/{typeid}', 'DonationsController@deletetype')->name('Donations.deletetype');
    });

    // Donation API
    Route::prefix('Donations')->group(function() {
        Route::get('/', 'DonationsController@index')->name('Donations.index');
        Route::post('/donation', 'DonationsController@storedonation')->name('Donations.storedonation');
        Route::get('/donation/{id}/edit', 'DonationsController@show')->name('Donations.show');
        Route::delete('donation/{id}', 'DonationsController@deletedonation')->name('Donations.deletedonation');
        Route::put('/donation/{id}', 'DonationsController@update')->name('Donations.update');
    });


        // Expense Category API 
    Route::prefix('Expense')->group(function() {
        Route::get('/type', 'ExpenseController@gettype')->name('Expense.gettype');
        Route::post('/type', 'ExpenseController@storecategory')->name('Donations.storecategory');
        Route::delete('/type/{categoryid}', 'ExpenseController@deletecategory')->name('Donations.deletecategory');
    });
    // Expense Account API 
    Route::prefix('Expense')->group(function() {
        Route::get('/account', 'ExpenseController@getaccountlist')->name('expenseaccountnumber.getaccountlist');
        Route::post('/account', 'ExpenseController@storeaccount')->name('expenseaccountnumber.storeaccount');
        Route::delete('/account/{delete_id}', 'ExpenseController@deleteaccountnumber')->name('Donations.deleteaccountnumber');
    });
    // Expense API
   Route::prefix('Expense')->group(function() {
            Route::get('/', 'ExpenseController@getlist')->name('expense.getlist');
            Route::post('/new', 'ExpenseController@store')->name('expense.store');
            Route::get('/{expense_id}/edit', 'ExpenseController@show')->name('expense.show');
            Route::put('/{expense_id}', 'ExpenseController@update')->name('expense.update');
            Route::delete('/{expense_id}', 'ExpenseController@delete')->name('expense.delete');
        });

       // Employee API
       Route::prefix('Employees')->group(function() {
        Route::get('/', 'EmployeesController@list')->name('Employees.list');
        Route::post('/employee', 'EmployeesController@addEmployee')->name('Employees.addEmployee');
        Route::get('/employee/{id}/edit', 'EmployeesController@show')->name('Employees.show');
        Route::put('/employee/{id}', 'EmployeesController@updateEmployee')->name('Employees.updateEmployee');
        Route::delete('/employee{id}', 'EmployeesController@delemployee')->name('Employees.delemployee');
    });
       // Report: Donation report API
        Route::prefix('Report')->group(function() {
            Route::get('/donation', 'DonationsController@index')->name('Report.index');
        });
         // Send Mail API
         Route::prefix('Mail')->group(function() {
            Route::get('/sendmail', 'MailController@sendEmail')->name('Mail.sendmail');
        }); 
        // Payment API
        Route::prefix('Payment')->group(function() {
            Route::get('/pay', 'PaymentController@pay')->name('Payment.pay');
        }); 
        // Dashboard API
        Route::prefix('Dashboard')->group(function() {
           Route::get('/serviceCount', 'DashboardController@serviceCount')->name('Dashboard.serviceCount');
       });
        Route::prefix('events')->group(function() {
            Route::get('/', 'EventsController@getlist')->name('events.getlist');
            Route::post('/', 'EventsController@store')->name('events.store');
            Route::put('/{event_id}', 'EventsController@update')->name('events.update');
            Route::get('/{events_id}/edit', 'EventsController@show')->name('events.show');
            Route::delete('/{expense_id}', 'EventsController@delete')->name('events.delete');
        });

        Route::prefix('event/participant')->group(function() {
            Route::get('/{event_id}', 'EventsParticipantController@getlist')->name('event/participant.getlist');
            Route::post('/new', 'EventsParticipantController@store')->name('event/participant.store');
            Route::put('/{participant_id}', 'EventsParticipantController@update')->name('event/participant.update');
            Route::delete('/{participant_id}', 'EventsParticipantController@delete')->name('event/participant.delete');
        });
    });

