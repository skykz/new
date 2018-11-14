<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

//WEBSITE
Route::get('/', 'PageController@unbox');
Route::get('games', 'PageController@games');
Route::get('profile','PageController@profile');

//STEAM
Route::get('auth/steam', 'AuthController@redirectToSteam')->name('auth.steam');
Route::get('auth/steam/handle', 'AuthController@handle')->name('auth.steam.handle');
Route::get('auth/logout', 'AuthController@logout')->name('auth.logout');