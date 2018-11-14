<?php namespace App\Http\Controllers;

use Invisnik\LaravelSteamAuth\SteamAuth;
use Illuminate\Support\Facades\DB;
use App\User;
use Auth;

class AuthController extends Controller
{
    /**
     * The SteamAuth instance.
     *
     * @var SteamAuth
     */
    protected $steam;

    /**
     * The redirect URL.
     *
     * @var string
     */
    protected $redirectURL = '/';

    /**
     * AuthController constructor.
     * 
     * @param SteamAuth $steam
     */
    public function __construct(SteamAuth $steam)
    {
        $this->steam = $steam;
    }

    /**
     * Redirect the user to the authentication page
     *
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     */
    public function redirectToSteam()
    {
        return $this->steam->redirect();
    }

    /**
     * Get user info and log in
     *
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     */
    public function handle()
    {
        if($this->steam->validate())
        {
            $info = $this->steam->getUserInfo();
            $findUser = DB::table('users')->where('steamid', $info->steamID64)->first();
            if(is_null($findUser))
            {
                $array = array('<','>');
                $numele = $info->personaname;
                $name = str_replace($array, '*', $numele);
                DB::table('users')->insert(
                    [
                        'name' => $name,
                        'steamid' => $info->steamID64,
                        'avatar' => $info->avatarfull,
                        'token' => csrf_token()
                    ]
                );
            }
            else
            {
                $array = array('<','>');
                $numele = $info->personaname;
                $name = str_replace($array, '*', $numele);
                DB::table('users')->where('steamid', $info->steamID64)->update([
                    'name' => $name,
                    'avatar' => $info->avatarfull,
                    'token' => csrf_token()
                ]);
            }
            return redirect($this->redirectURL);
        }

    }

    /**
     * Getting user by info or created if not exists
     *
     * @param $info
     * @return User
     */
    public function logout()
    {
        DB::table('users')->where('token', csrf_token())->update([
            'token' => '0'
        ]);
        return redirect($this->redirectURL);
    }
}