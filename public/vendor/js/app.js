$(function() {
    var app = new Vue({
        el: '#app',
        data: {
            website: {
                socket: null,
                websocket: $('meta[name="websocket"]').attr('content'),
                online: 0,
                chat: null,
                chat_messages: [],
                users_registered: 0,
                cases_opened: 0,
                amount_won: 0,
                top_unbox: {
                    name: null,
                    image: null,
                    value: null,
                    case: null,
                    opener: null
                }
            },
            user: {
                token: $('meta[name="csrf_token"]').attr('content'),
                keys: $('meta[name="keys"]').attr('content'),
                rank: null,
                case: {
                    id: null,
                    cases: null,
                    img: null,
                    curr: 0,
                    items: [],
                    clicked: false
                },
                referral_code: null,
                referrals_count: 0,
                referrals_cases_opened: 0,
                refereed_by: null
            }
        },
        methods: {
            connect: function() {
                if(app.website.socket == null) {
                    app.website.socket = io(app.website.websocket, {
                        secure: true,
                        reconnectionDelay: 8000
                    });

                    app.website.socket.on('connect', function() {
                        //toastr.info('Connected to websocket server!', 'Info');

                        app.website.socket.emit('login', app.user.token);

                        $('.inputter').val('');

                        app.socket_functions();
                        app.user_functions();

                        $('.loader').addClass('fadeOut');
                        setTimeout(function() {
                            $('.loader').addClass('hidden');
                            $('#app').removeClass('hidden');
                        }, 800);
                    });

                    app.website.socket.on('connect_error', function() {
                        toastr.error('There is an error connecting to websocket!', 'Error');
                    });

                    app.website.socket.on('disconnect', function() {
                        //toastr.error('Connection to websocket has been lost!', 'Error');
                    });
                }
            },
            format_number: function(x) {
                var parts = x.toString().split(".");
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                return parts.join(".");
            },
            socket_functions: function() {
                app.website.socket.on('user eroare', function(msg) {
                    toastr.error(msg, 'Error');
                });
                app.website.socket.on('user alerta', function(msg) {
                    toastr.success(msg, 'Alert');
                });
                app.website.socket.on('user modal', function(modal, type) {
                    if(type == 'open') $(modal).modal();
                    else {
                        $(modal + ' .close').click();
                        $('.modal-backdrop').remove();
                    }
                });
                app.website.socket.on('website users online', function(t) {
                    app.website.online = t;
                });
                app.website.socket.on('user refresh', function() {
                    document.location.href = document.location.origin;
                });
                app.website.socket.on('user chat message add', function(msg) {
                    msg.now_added = 1;
                    app.website.chat_messages.push(msg);
                    setTimeout(function() { $('.chat-messages').scrollTop($('.chat-messages')[0].scrollHeight); }, 100);
                });
                app.website.socket.on('website chat history', function(msgs) {
                    app.website.chat_messages = [];

                    for(var z in msgs) {
                        app.website.chat_messages.push(msgs[z]);
                    }
                    setTimeout(function() { $('.chat-messages').scrollTop($('.chat-messages')[0].scrollHeight); }, 1000);
                });
                app.website.socket.on('website chat clear', function() {
                    app.website.chat_messages = [];
                });

                // profile
                app.website.socket.on('user info', function(user) {
                    app.user.rank = user.rank;
                    app.user.keys = user.keys;
                });

                app.website.socket.on('user keys', function(keys) {
                    app.user.keys = keys;
                });
                // 

                // website
                app.website.socket.on('website info', function(web) {
                    app.website.users_registered = web.users;
                    app.website.cases_opened = web.cases;
                    app.website.amount_won = web.preturile;
                });
                // 

                // user trade
                app.website.socket.on('user trade', function(id, tradeurl) {
                    app.user.case.tradeid = id;
                    app.user.case.tradeurl = tradeurl;

                    $('.tradeid').text(id);
                    $('.tradeurl').html(`
                        Click <a target="_blank" href="` + tradeurl + `">here</a> to open the trade!
                    `);

                    $('#tradeModal').modal('toggle');
                });
                // 

                app.website.socket.on('website live cases', function(ss) {
                    $('.live-opened').prepend(`
                        <div class="case animated flip" style="border-color: ` + ss.color + `">
                            <div class="img">
                                    <img src="` + ss.image + `">
                                </div>
                                <div class="opener">` + ss.user + `</div>
                                <div class="idcase">#` + ss.id + `</div>
                                <div class="name_weapon">` + ss.name + `</div>
                                <div class="price" style="color: #965e0d">$` + app.format_number(ss.price) + `</div>
                            </div>
                        </div>
                    `);
                });

                app.website.socket.on('website live cases history', function(history) {
                    var $html = '';
                    for(var z in history) {
                        var ss = history[z];
                        $html += `
                            <div class="case" style="border-color: ` + ss.color + `">
                                <div class="img">
                                        <img src="` + ss.image + `">
                                    </div>
                                    <div class="opener">` + ss.user + `</div>
                                    <div class="idcase">#` + ss.id + `</div>
                                    <div class="name_weapon">` + ss.name + `</div>
                                    <div class="price">$` + app.format_number(ss.price) + `</div>
                                </div>
                            </div>
                        `;
                    }
                    $('.live-opened').html($html);
                });

                // cases
                app.website.socket.on('user to open cases', function(cases) {
                    app.user.case.cases = cases;
                    var $html_cases = "";
                    var $html_items = {};
                    $html_items['1'] = "";
                    $html_items['2'] = "";
                    $html_items['3'] = "";
                    $html_items['4'] = "";
                    $html_items['5'] = "";
                    $html_items['6'] = "";
                    var $html_casess = {};
                    $html_casess['1'] = "";
                    $html_casess['2'] = "";
                    $html_casess['3'] = "";
                    $html_casess['4'] = "";
                    $html_casess['5'] = "";
                    $html_casess['6'] = "";

                    for(var i in cases) {
                        var itm = cases[i][0];

                        $html_cases += `
                            <div class="case">
                                <div class="name">` + itm.name + `</div>
                                <div class="img">
                                    <img src="` + itm.img + `">
                                </div>
                                <div class="open" data-case="` + parseInt(i) + `"><i class="fas fa-key"></i> Open case</div>
                            </div>
                        `;

                        $html_items[i] = "";

                        var itemele = itm.items;
                        itemele.sort(function (a,b) { return b.price*100-a.price*100 });


                        $html_casess[i] += '<p style="float: left;margin-top: -55px;"> <img src="' + itm.img + '" width="145px" height="145px"></p><br>';
                        $html_casess[i] += '<p style="text-align: left; margin-top: -30px;">' + itm.name + '</p>';
                        $html_casess[i] += '<p style="text-align: left;font-size: 15px;margin-top: 10px; color: slategray;">Skins inside: <span style="color: #965e0d">' + itemele.length + '</span></p>';
                        $html_casess[i] += '<p style="text-align: left;font-size: 15px;margin-top: -20px; color: slategray;">Price range you can win: <span style="color: #965e0d"><i class="fas fa-dollar-sign"></i>' + app.format_number(itemele[itemele.length-1].price) + ' - <i class="fas fa-dollar-sign"></i>' + app.format_number(itemele[0].price) + '</span></p><br>';
                        $html_casess[i] += '<div style="padding: 0px 10px 0px 10px; font-size: 15px; border-bottom: 2px solid rgb(26, 41, 70);"></div>';
                        for(var z in itm.items) {
                            var item = itm.items[z];

                            var $type;
                            switch(item.type) {
                                case 'Factory New': $type = 'FN'; break;
                                case 'Minimal Wear': $type = 'MW'; break;
                                case 'Field-Tested': $type = 'FT'; break;
                                case 'Well-Worn': $type = 'WW'; break;
                                case 'Battle-Scarred': $type = 'BS'; break;
                            }

                            $html_items[i] += `
                                <div class="case_item">
                                    <div class="type">` + $type + `</div>
                                    <div class="price">$` + app.format_number(item.price) + `</div>
                                    <div class="img">
                                        <img src="` + item.image + `">
                                    </div>
                                    <div class="name" style="background-color :#757590">` + item.name + `</div>
                                </div>
                            `;
                        }
                    }

                    $('#cases').html($html_cases);
                    $('#opener_cases1').html($html_casess['1'] + '' + $html_items['1']);
                    $('#opener_cases2').html($html_casess['2'] + '' + $html_items['2']);
                    $('#opener_cases3').html($html_casess['3'] + '' + $html_items['3']);
                    $('#opener_cases4').html($html_casess['4'] + '' + $html_items['4']);
                    $('#opener_cases5').html($html_casess['5'] + '' + $html_items['5']);
                    $('#opener_cases6').html($html_casess['6'] + '' + $html_items['6']);
                });

                app.website.socket.on('user successfull open cases', function(cases) {
                    app.user.case.clicked = false;
                    generateCases(cases);
                });

                app.website.socket.on('user waiting cases', function() {
                    $('.Case-rollers').html('<i class="fas fa-5x fa-sync fa-spin"></i>');
                    $('#tradeModal').modal('hide');
                });

                app.website.socket.on('website top unbox', function(top) {
                    app.website.top_unbox.name = top.name;
                    app.website.top_unbox.image = top.image;
                    app.website.top_unbox.value = top.value;
                    app.website.top_unbox.case = top.case;
                    app.website.top_unbox.opener = top.opener;
                    app.website.top_unbox.user = top.user;
                });
                //



                // REFERRALS
                app.website.socket.on('aff code set', function(code) {
                    app.user.referral_code = code;
                });
                app.website.socket.on('aff settings', function(settings) {
                    app.user.referral_code = settings.code;
                    app.user.referrals_cases_opened = settings.cases_opened;
                    app.user.referrals_count = settings.count;
                    app.user.refereed_by = settings.refereed_by;
                });
                app.website.socket.on('aff settings 2', function(settings) {
                    app.user.refereed_by = settings.refereed_by;
                });
                //
            },
            user_functions: function() {
                // cases
                $('.open-tab').on('click', '#cases .case .open', function() {
                    $('#back-button').removeClass('hidden');
                    $('#cases').addClass('hidden');
                    $('#opener_cases1').addClass('hidden');
                    $('#opener_cases2').addClass('hidden');
                    $('#opener_cases3').addClass('hidden');
                    $('#opener_cases4').addClass('hidden');
                    $('#opener_cases5').addClass('hidden');
                    $('#opener_cases6').addClass('hidden');
                    $('#opener_cases' + $(this).attr('data-case')).removeClass('hidden');
                    $('.case-opener').removeClass('hidden');

                    app.user.case.id = $(this).attr('data-case');
                });

                $('#back-button').click(function() {
                    $('.case-opener').addClass('hidden');
                    $('#back-button').addClass('hidden');
                    $('#cases').removeClass('hidden');
                    $('#opener_cases1').addClass('hidden');
                    $('#opener_cases2').addClass('hidden');
                    $('#opener_cases3').addClass('hidden');
                    $('#opener_cases4').addClass('hidden');
                    $('#opener_cases5').addClass('hidden');
                    $('#opener_cases6').addClass('hidden');
                });

                $('#openCases').click(function() {
                    if(app.user.case.clicked) return;
                    var $amount = $('#amountCases').val();
                    if($amount < 1 || $amount > 5) {
                        app.user.case.clicked = false;
                        toastr.error('You can open 1 case up to 5 cases at a time!');
                        return;
                    }
                    app.website.socket.emit('user open casess', app.user.case.id, $amount, app.user.token);
                    app.user.case.clicked = true;
                });
                // 

                // chat
                $(document).on('click', '#app', function() {
                    var $menu = $('.profile-menu');
                    if($menu.hasClass('toggled')) {
                        $menu.hide(100);
                        $menu.removeClass('toggled');
                    }
                });
                $(document).on('contextmenu', '.chat-msg', function(e) {
                    if(e.ctrlKey) return;
                    $('.profile-menu [data-action=2]').hide();
                    $('.profile-menu [data-action=3]').hide();
                    $('.profile-menu [data-action=4]').hide();
                    if(app.user.rank == 100) {
                        $('.profile-menu [data-action=2]').show();
                        $('.profile-menu [data-action=3]').show();
                        $('.profile-menu [data-action=4]').show();
                    }
                    e.preventDefault();
                    var steamid = $(this).attr('data-steamid');
                    var name = $(this).attr('data-name');
                    var $chat = $('.inputter');
                    $('.profile-menu [data-action=1]').html(name);
                    var $menu = $('.profile-menu');

                    $menu.addClass('toggled');
                    $menu.finish().toggle(100).
                    css({
                        position: "absolute",
                        left: '250px',
                        top: getMenuPosition(e.clientY, 'height', 'scrollTop')
                    }).off('click').on('click', 'li', function(e) {
                        var $action = $(this).attr('data-action');
                        e.preventDefault();
                        $menu.hide();
                        switch($action) {
                            case '1':
                                $chat.val($chat.val() + steamid);
                                break;
                            case '2':
                                $chat.val('/mute ' + steamid + ' 1');
                                break;
                            case '3':
                                $chat.val('/ban ' + steamid);
                                break;
                            case '4':
                                $chat.val('/unban ' + steamid);
                                break;
                        }

                        $('.inputter').focus();
                    });
                });
                // 

                // support
                $("#unboxGo").click(function() {
                    document.location.href = '/';
                });
                $("#gamesGo").click(function() {
                    document.location.href = '/games';
                });
                $("#supportGo").click(function() {
                    window.open('https://twitter.com/WinSkinsFUN');
                });
                $("#inventoryGo").click(function() {
                    window.open('https://trade.opskins.com/inventory');
                });
                $("#logoutGo").click(function() {
                    document.location.href = '/auth/logout';
                });
                $('#buyVKeysGo').click(function() {
                    document.location.href = 'https://opskins.com/?loc=shop_search&app=1912_1&search_item=Skeleton+Key&sort=lh';
                });
                //

                // 
                $('#createRefCode').click(function() {
                    var $ref_code = $('#aff_code').val();
                    var $wax_id = $('#wax_id').val();
                    if($ref_code && $wax_id) app.website.socket.emit('user create aff code', $ref_code, $wax_id, app.user.token);
                    else toastr.error('You need to fill both fields to create the referral code!');
                });

                if(getCookie('ref_code') != '') {
                    app.website.socket.emit('user use aff code', getCookie('ref_code'), app.user.token);
                    setCookie('ref_code', null);
                }
                // 

                app.website.chat = false;

                if(app.website.chat == true) {
                    $('#tabbb').html('<i class="fas fa-align-left"></i>');
                    $('#statsss').addClass('stats_goned');
                    $('#chattt').removeClass('chat_goned');
                    app.website.chat = false;
                } else {
                    $('#tabbb').html('<i class="fas fa-comments"></i>');
                    $('#statsss').removeClass('stats_goned');
                    $('#chattt').addClass('chat_goned');
                    app.website.chat = true;
                }

                $('.toggletab').click(function() {
                    if(app.website.chat == true) {
                        $('#tabbb').html('<i class="fas fa-align-left"></i>');
                        $('#statsss').addClass('stats_goned');
                        $('#chattt').removeClass('chat_goned');
                        app.website.chat = false;
                    } else {
                        $('#tabbb').html('<i class="fas fa-comments"></i>');
                        $('#statsss').removeClass('stats_goned');
                        $('#chattt').addClass('chat_goned');
                        app.website.chat = true;
                    }
                });

                $('.inputter').keyup(function(e) {
                    if(e.keyCode == 13) {
                        app.website.socket.emit('user chat message', $('.inputter').val(), app.user.token); $('.inputter').val('');
                    }
                });
            }
        }
    });

    app.connect();

    function getMenuPosition(mouse, direction, scrollDir) {
        var win = $(window)[direction](),
            scroll = $(window)[scrollDir](),
            menu = $(".profile-menu")[direction](),
            position = mouse + scroll;
        if (mouse + menu > win && menu < mouse)
            position -= menu;
        return position;
    }

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };

    function generateCases(cases) {
        var $html = '';

        for(var z in cases) {
            var casenumber = cases[z].number;
            $html += '<div class="case-roller animated fadeIn" data-id="' + casenumber + '"><div class="case-roller-holder"><div class="case-roller-container" style="margin-left: 0px;"></div></div></div>';
        }

        $('.Case-rollers').html($html);

        setTimeout(function() {
            for(var h in cases) {
                var caseid = cases[h].id;
                var casenumber = cases[h].number;
                var caseitem = cases[h].item;
                addItems(casenumber, caseid);
                caseRoll(caseid, casenumber, caseitem);
            }
        }, 50);
    }

    function addItems(casenumber, caseid) {
        var items = app.user.case.cases[caseid][0].items;
        setTimeout(function() {
            var s;
            if(caseid == 1) {s = 35;}
            else if(caseid == 2) {s = 36;}
            else {s = 61;}
            for(var i = 0; i < 101; i++) {
                var randIt = Math.floor(Math.random()*(5-1+1)+1);
                if(randIt == 5) var randomItem = Math.floor(Math.random()*(items.length-1-0+1)+0);
                else var randomItem = Math.floor(Math.random()*(items.length-1-s+1)+s);

                var itemul = items[randomItem];
                var element = '<div id="CardNumber' + i + '" class="item" style="background-image:url(' + itemul.image + '); border-bottom: 4px solid ' + itemul.color + ';"></div>';
                $(element).appendTo('.Case-rollers .case-roller[data-id="' + casenumber + '"] .case-roller-container');
            }
        }, 50);
    }

    function caseRoll(caseid, casenumber, item) {
        var randItem = item;
        $('.Case-rollers .case-roller[data-id="' + casenumber + '"] .case-roller-container').css('margin-left', '0px');
        $('.Case-rollers .case-roller[data-id="' + casenumber + '"] .case-roller-container #CardNumber78').css('background-image', '');
        $('.Case-rollers .case-roller[data-id="' + casenumber + '"] .case-roller-container #CardNumber78').css('border-bottom', '');
        setTimeout(function() {
            var min = 6580;
            var max = 6652;
            var pos = Math.floor(Math.random()*(max-min+1)+min);

            $('.Case-rollers .case-roller[data-id="' + casenumber + '"] .case-roller-container').css({
                transition: "all 8s cubic-bezier(.08,.6,0,1)"
            });
            $('.Case-rollers .case-roller[data-id="' + casenumber + '"] .case-roller-container #CardNumber78').css('background-image', 'url("' + randItem.image["600px"] + '")');
            $('.Case-rollers .case-roller[data-id="' + casenumber + '"] .case-roller-container #CardNumber78').css('border-bottom', '4px solid ' + randItem.color);
            setTimeout(function() {
                toastr.info('You just won item ' + randItem.name + ' worth of $' + app.format_number(randItem.price));
            }, 8500);
            $('.Case-rollers .case-roller[data-id="' + casenumber + '"] .case-roller-container').css('margin-left', '-' + pos + 'px');
        }, 300);
    }

});