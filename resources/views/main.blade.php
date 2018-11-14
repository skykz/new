
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Required meta tags -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">

    <title>VgoCraft - Opening vCases</title>
    <meta name="description" content="Vgocraft - Win VGO skins by opening vCases!">
    <meta name="keywords" content="Gambling website, case opener, vgo case opener, vgo case opening, VGO gambling, gambling, win vgo skins, gambling skins, vgo skins, new vgo gambling website, new vgo website, new vgo, vgo.gg, vgo_gg, vgo">

    <!-- Fonts and icons -->
    <link rel="stylesheet prefetch" href="https://fonts.googleapis.com/css?family=Roboto">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.6/css/all.css">
    <link rel="stylesheet" href="/vendor/css/pe-icon-7-stroke.css">
    <link rel="manifest" href="/vendor/images/site.webmanifest">
    <link rel="shortcut icon" href="/vendor/images/favicon1.ico">
    <meta name="msapplication-TileColor" content="#2b5797">
    <meta name="msapplication-config" content="/vendor/images/browserconfig.xml">
    <meta name="theme-color" content="#ffffff">

    <meta name="csrf_token" content="{{ csrf_token() }}">
    <meta name="websocket" content="wss://vgocraft.com:2096">
    <meta name="keys" content="{{ $user['keys'] }}">

    <!-- App Core CSS -->
    <link rel="stylesheet" href="/vendor/css/toastr.css">
    <link rel="stylesheet" href="/vendor/css/bootstrap.css">
    <link rel="stylesheet" href="/vendor/css/animate.css">
    <link rel="stylesheet" href="/vendor/css/app.css?v=<?=time()?>">

    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-128566934-1"></script>
    <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'UA‌-128566934-1');
    </script>
</head>
<body>
<div class="loader animated">
    <div class="loader__bar"></div>
    <div class="loader__bar"></div>
    <div class="loader__bar"></div>
    <div class="loader__bar"></div>
    <div class="loader__bar"></div>
    <div class="loader__ball"></div>
</div>

<div id="app" class="hidden">

    {{--<div class="topbar">--}}
    {{----}}
    {{--<div class="toptext animated bounceInDown animatieBounce" style="display: flex;align-items: center;background-color: #23d577;height: 30px;overflow: hidden;flex-shrink: 0;color: rgb(255, 255, 255);font-weight: bold;font-size: 16px;height: 20px;"><div style="flex: 1 1 0%;text-align: center;"> Welcome to VgoCraft.com! For suggestions/bugs DM us at <a href="https://vk.com/skyyera" target="_blank">@VgoCraft--}}
    {{--</a>! </div></div>--}}
    {{--</div>--}}

    <div class="navbar animated bounceInDown animatieBounce">

        <div class="brandname"><a href="/"><img src="/vendor/images/vgo1.png" style="width: 240px; height: 70px; margin-left: 15px; margin-top: -10px;"></a></div>

        <div class="novbar">

            {{--<div id="supportGo" class="litems">Support</div>--}}
            @if($user != 0)
                <div id="inventoryGo" class="litems">Inventory</div>
                <div id="unboxGo" class="litems active" style="color: white;">Unbox</div>
                {{--<div data-target="#ReferralsModal" data-toggle="modal" class="litems">Affiliates</div>--}}
                {{--<div id="logoutGo" class="litems">Logout</div>--}}
            @endif
        </div>

        @if($user != 0)
        @endif

        <div class="ddown">
            @if($user != 0)
                <div class="username">
                            <span class="user-balance" style="padding-top: 12px; padding-bottom: 9px; color: white; font-size: 13px;background-color: #252533; border-radius: 5px;">
                                <span v-html="user.keys"></span> KEYS
                            </span>
                    <button id="buyVKeysGo" class="red-button"><i class="fas fa-key"></i> Buy keys</button>
                    <img class="userpp" src="{{ $user['avatar'] }}"><i class="fas fa-user"></i>&nbsp;{{ $user['name'] }} &nbsp;

                    <a href="#" id="logoutGo" class="logout-button" style="text-decoration: none">Logout</a>

                </div>

            @else
                <a href="/auth/steam" class="login-button"><i class="fab fa-steam"></i> Log in </a>
            @endif
        </div>


    </div>

    <div class="live-opened animated bounceInUp animatieBounce"></div>

    <?php
    $i = 1;
    ?>
    <div class="stats-container1">
        <h3><center>LeaderBoards</center></h3>
        <h5 style="color:#2AAE3C;text-align: center;"><i class="fas fa-trophy"> </i> Case Race </h5>
        <h6 style="color:orange;"><center><i class="fas fa-gift"> </i> November - <b style="color:#0d9b50">100</b><i class="fas fa-dollar-sign"></i> </center></h6><br>

    @foreach($leader as  $led)
            <p style="position: initial; margin-left: 70px;color:#d62c1a;"><i class="fas fa-trophy"> </i> <?php echo $i++ ?> <span style="color:#f09c03;"><?php echo $led->name; ?></span> ----- <?php switch ($i){case 2: echo 50; break;case 3: echo 25; break;case 4: echo 10; break;case 5: echo 5; break;case 6: echo 5; break;case 7: echo 2.5; break;case 8: echo 2.5; break;default :echo 0;break;}?><i class="fas fa-dollar-sign"></i> </p>
        @endforeach
        {{--<p style="position: initial; margin-left: 70px;color:#d62c1a;"><i class="fas fa-trophy"> </i> <?php echo $i++ ?> <span style="color:#f09c03;"><?php echo "Empty"; ?></span> ----- <?php switch ($i){case 2: echo 50; break;case 3: echo 25; break;case 4: echo 10; break;case 5: echo 5; break;case 6: echo 5; break;case 7: echo 2.5; break;case 8: echo 2.5; break;default :echo 0;break;}?><i class="fas fa-dollar-sign"></i> </p>--}}


        {{--<p style="position: initial;margin-left: 70px;color:#d62c1a;"><i class="fas fa-trophy"> </i> 2. Place - 25<i class="fas fa-dollar-sign"></i> </p>--}}
        {{--<p style="position: initial; margin-left: 70px;color:#d62c1a;"><i class="fas fa-trophy"> </i> 3. Place - 10<i class="fas fa-dollar-sign"></i> </p>--}}

        {{--<p style="position: initial; margin-left: 70px;color:#d62c1a;"><i class="fas fa-trophy"> </i> 4 - 5. Places - 5<i class="fas fa-dollar-sign"></i> </p>--}}
        {{--<p style="position: initial;margin-left: 70px;color:#d62c1a;"><i class="fas fa-trophy"> </i> 6 - 7. Places - 2.5<i class="fas fa-dollar-sign"></i> </p>--}}

        {{--<h5 style="text-align: center">Leaders</h5>--}}
        {{--<div style="padding: 0px 10px 0px 10px; font-size: 15px; border-bottom: 2px solid rgb(26, 41, 70);"></div>--}}

            {{--<div style="padding: 0px 10px 0px 10px; font-size: 15px; border-bottom: 2px solid rgb(26, 41, 70);">--}}
                {{--<div style="text-align: left; margin-bottom: -18px;">--}}
                {{--</div><br>--}}
            {{--</div>--}}

    </div>

    <div id="statsss" class="stats-container animated bounceInLeft animatieBounce">
        <div class="stats-hat">
            <div class="top-opener">
                <h5 style="color: #f09c03;">TOP Unbox <sup><small>(last 24h)</small></sup></h5>
                <div class="img">
                    <img class="imageTopUnbox" :src="website.top_unbox.image" width="200px" height="150px">
                </div>
                <div><span style="font-size: 13px" v-html="website.top_unbox.name"></span></div>
                <div style="color: wheat;">Valued at <span style="color:#965e0d;font-size: small"><i class="fas fa-dollar-sign"></i><span v-html="website.top_unbox.value"></span></span></div>
                <div style="color:wheat;">From case <span style="color:#965e0d; font-size: small">#<span v-html="website.top_unbox.case"></span></span></div>
                <div style="color:wheat;">Opened by <a target="_blank" style="text-decoration: none;"><span style="color:#965e0d;" v-html="website.top_unbox.opener"></span></a></div>
            </div>
        </div>
        <div class="statsfoot" style="text-align: center">
            <p style="font-size: 9px; color: dimgrey;">Copyright 2018 © VgoCraft. All rights reserved to <a target="_blank" href="https://vk.com/skyyera">Yera</a>.</p>
        </div>
        <div id="chattt" class="chat-container animated bounceInLeft animatieBounce">
            <div class="chat-messages">
                <div v-for="i in website.chat_messages" v-bind:class="[ i.now_added ? 'chat-msg animated fadeIn' : 'chat-msg']" :data-steamid="i.steamid" :data-name="i.name">
                    <div class="avatar">
                        <img :src="i.avatar">
                    </div>
                    <div class="name" v-if="i.rank == 100" v-html="`<b><span style='color:red'>` + i.name + `</span></b>`"></div>
                    <div class="name" v-else-if="i.rank == 88" v-html="`<b><span style='color: orange'>[Beta]</span> ` + i.name + `</b>`"></div>
                    <div class="name" v-else v-html="i.name"></div>
                    <div v-html="i.msg" v-bind:class="[ i.now_added ? 'msg animated slideInLeft' : 'msg']"></div>
                </div>
            </div>


            <div class="chatbum">
                <div class="chatter">
                    <input type="text" class="inputter" placeholder="Enter a chat message...">
                </div>
            </div>

        </div>
    </div>

    <div class="content block" id="mainn2">
        <div class="open-tab">
            <div id="cases" class="animated bounceInDown animatieBounce"></div>
            <div class="case-opener hidden animated bounceInDown animatieBounce">
                <div class="case-image"><img v-if="user.case.img" :src="user.case.img"></div>
                <div class="Case-rollers"></div>
                <input type="number" min="1" max="5" value="1" id="amountCases">
                <button class="red-button" id="openCases"><i class="fas fa-key"></i> Open Case </button>
                <button id="back-button" class="gray-button"> <i class="fas fa-arrow-left"></i> Go Back</button>
            </div>
            <div id="opener_cases1" class="hidden animated bounceInDown animatieBounce"></div>
            <div id="opener_cases2" class="hidden animated bounceInDown animatieBounce"></div>
            <div id="opener_cases3" class="hidden animated bounceInDown animatieBounce"></div>
            <div id="opener_cases4" class="hidden animated bounceInDown animatieBounce"></div>
            <div id="opener_cases5" class="hidden animated bounceInDown animatieBounce"></div>
            <div id="opener_cases6" class="hidden animated bounceInDown animatieBounce"></div>
        </div>
    </div>

    <div class="modal fade" id="tradeModal" tabindex="-1" role="dialog" aria-labelledby="modalul" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalul">Trade #<span class="tradeid"></span></h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <h3>Trade #<span class="tradeid"></span> is pending!</h3>
                    <h2 class="tradeurl"></h2>
                </div>
            </div>
        </div>
    </div>

    <div id="ReferralsModal" tabindex="-1" role="dialog" aria-labelledby="modalul" class="modal fade">
        <div role="document" class="modal-dialog">
            <div class="modal-content" style="
                      background: white;
                      color: black;
                      font-weight: bold;
                      font-family: 'Overpass Mono';
                      ">
                <div class="modal-header" style="
                         border-bottom: 1px solid black;
                         ">
                    <h5 id="modalul" class="modal-title">Affiliates</h5>
                    <button type="button" data-dismiss="modal" aria-label="Close" class="close"><span aria-hidden="true">×</span></button>
                </div>
                <div class="modal-body" style="font-family: 'Overpass Mono'">
                    <center>

                        <div v-if="user.referral_code" style="
                            display: flex;
                            padding-bottom: 20px;">
                            <div style="flex: 1;
                                display: flex;
                                flex-direction: column;
                                align-items: center;">
                                <div style="color: #3374f0;
                                    font-size: 2.2rem;
                                    font-weight: 100;" v-html="user.referrals_count"></div>
                                <div style="text-transform: uppercase;">REFEREES</div>
                            </div>
                            <div style="flex: 1;
                                display: flex;
                                flex-direction: column;
                                align-items: center;">
                                <div style="color: #3374f0;
                                    font-size: 2.2rem;
                                    font-weight: 100;" v-html="user.referrals_cases_opened"></div>
                                <div style="text-transform: uppercase;">OPENED CASES</div>
                            </div>
                            <div style="flex: 1;
                                display: flex;
                                flex-direction: column;
                                align-items: center;">
                                <div style="color: #3374f0;
                                    font-size: 2.2rem;
                                    font-weight: 100;" v-html="'$' + parseFloat(user.referrals_cases_opened*0.06).toFixed(2)"></div>
                                <div style="text-transform: uppercase;">TOTAL EARNINGS</div>
                            </div>
                        </div>

                        <div class="aff" style="background: rgb(51, 116, 240);color: rgb(255, 255, 255);font-weight: 100;padding: 15px;font-size: 20px;font-weight: bold;border-radius: 15px;">
                            <div><b style="margin-left: -160px;">For every referred case opening:</b></div>
                            <ul>
                                <li>$0.06 will be sent to your <a href="http://opskins.com/" target="_blank" style="
                                     color: white;
                                     text-decoration: underline;
                                     ">OPSkins account</a></li>
                            </ul>
                        </div>

                        <div v-if="!user.referral_code" style="display: flex; flex-direction: column; padding: 10px 15px;">
                            <div>
                                <input type="text" id="aff_code" placeholder="REFERRAL CODE" style="font-family: 'Overpass Mono', monospace; box-sizing: border-box; width: 100%; height: 50px; padding: 0 15px; border-radius: 3px; border: 1px solid #a8afb9; outline: none; background: none; box-shadow: none; margin-top: 5px; font-size: 17px; text-transform: uppercase; color: #3374f0;">
                            </div>
                        </div>

                        <div v-if="!user.referral_code" style="display: flex; flex-direction: column; padding: 10px 15px;">
                            <div>
                                <input type="text" id="wax_id" placeholder="WAX ID" style="font-family: 'Overpass Mono', monospace; box-sizing: border-box; width: 100%; height: 50px; padding: 0 15px; border-radius: 3px; border: 1px solid #a8afb9; outline: none; background: none; box-shadow: none; margin-top: 5px; font-size: 17px; text-transform: uppercase; color: #3374f0;">
                            </div>
                        </div>

                        <div v-if="user.referral_code" style="display: flex; flex-direction: column; padding: 10px 15px;">
                            <div>
                                <input disabled type="text" id="your_ref_link" :value="'https://vgocraft.com/ref?c=' + user.referral_code" placeholder="YOUR LINK" style="font-family: 'Overpass Mono', monospace; box-sizing: border-box; width: 100%; height: 50px; padding: 0 15px; border-radius: 3px; border: 1px solid #a8afb9; outline: none; background: none; box-shadow: none; margin-top: 5px; font-size: 17px; text-transform: lowercase; color: #3374f0;">
                            </div>
                        </div>

                        <b v-if="user.referral_code">* Payouts to your OPSkins account can take up to 5 minutes after the case has been opened.</b><br>
                        <b v-if="!user.referral_code">You can find your WAX ID by <a href="https://trade.opskins.com/settings#userId" target="_blank" style="color: black; text-decoration: underline;">clicking here</a></b>

                        <button v-if="!user.referral_code" type="button" id="createRefCode" class="btn btn-primary btn-block btn-lg" style="background: #3374f0;">CREATE CODE</button>
                        <br>
                        <b v-if="user.refereed_by" v-html="`Your refereer <span style='text-decoration: underline;'>` + user.refereed_by + `</span>`" style="font-weight: bold;"></b>
                    </center>
                </div>
            </div>
        </div>
    </div>


    <ul class="profile-menu">
        <li data-action="1">Profile name</li>
        <li data-action="2">Mute user</li>
        <li data-action="3">Ban user</li>
        <li data-action="4">Unban user</li>
    </ul>
</div>

<!-- Optional JavaScript -->
<!-- jQuery first, then Popper.js, then Bootstrap JS -->
<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>

<!-- App Core JS -->
<script src="/vendor/js/jquery.js"></script>
<script src="/vendor/js/jquery.kf.js"></script>
<script src="/vendor/js/socket.io.js"></script>
<script src="/vendor/js/popper.js"></script>
<script src="/vendor/js/bootstrap.js"></script>
<script src="/vendor/js/vue.js"></script>
<script src="/vendor/js/toastr.js"></script>
<script src="/vendor/js/app.js?v=<?=time()?>"></script>
</body>
</html>
