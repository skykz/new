//\\//\\//\\//\\//\\//\\//\\
//File created by Yerassyl\\
//\\//\\//\\//\\//\\//\\//\\
var fs = require('fs');
var request = require('request');
var log4js = require('log4js');
var express = require('express');
var config = require('./config.js');
var options = {
    key: fs.readFileSync('echo.key'),
    cert: fs.readFileSync('echo.crt'),
    requestCert: true
};
var app = express();
var server = require('https').createServer(options, app);
var io = require('socket.io').listen(server);
server.listen(2096, '0.0.0.0');

log4js.configure({
    appenders: {
        console: {
            type: 'console'
        },
        default: {
            type: 'file',
            filename: 'logs/main_'+time()+'.log'
        }
    },
    categories: {
        default: {
            appenders: ['default', 'console'],
            level: 'trace'
        }
    }
});
var logger = log4js.getLogger();

var mysql = require('mysql');
var db_config = {
    host: config.sql.host,
    user: config.sql.user,
    password: config.sql.password,
    database: config.sql.database
};
var pool;

check_errors();
database_connection();

// vgo stuff
var vgo = {
    uid: null,
    name: null,
    auth: 'Basic ' + Buffer.from(config.api_key + ":", "ascii").toString("base64"),
    opskins_api: function(url, method, bodi, callback) {
        request({
            headers: {
                'Authorization': vgo.auth,
            },
            uri: url,
            method: method,
            form: bodi
        }, function(err, res, body) {
            if(err) throw err;
            var response = JSON.parse(body);
            callback(response);
        });
    }
};
// vgo stuff

//get bot infs
var now_url = 'https://api-trade.opskins.com/IUser/GetProfile/v1/';
vgo.opskins_api(now_url, 'GET', {}, function(res) {
    vgo.uid = res['response']['user']['id'];
    vgo.name = res['response']['user']['display_name'];
    logger.info('Bot ' + vgo.uid + ' (' + vgo.name + ') got from OPSkins!');
});
//

//global vars
var socketids = {};
var sockets = {};
var ssockets = {};
var users = {};
var chat_msgs = [];
var anti_spam_chat = {};
var tokens = {};
var website = {};
// cases
var ItemsCases = [];
var Cases = {};
var PendingTrades = {};
var UserTrades = {};
var Cases_History = [];
var TopUnbox = {};
// 
//global vars

//enable comissions
var network_id = 1;
var network_user_id = 5448004;
var referral_commission_rate = 7.50; //7.50 * 0.75 of $0.2
var now_url = 'https://api-trade.opskins.com/ICaseSite/UpdateCommissionSettings/v1';
vgo.opskins_api(now_url, 'POST', {'network_id': network_id, 'network_user_id': network_user_id, 'referral_commission_rate': referral_commission_rate}, function(res) {
    if(res.hasOwnProperty('message') && !res.hasOwnProperty('response')) return logger.error('Error on commission change: ' + res.message);

    if(res.response.network_id == network_id && res.response.network_user_id == network_user_id && res.response.referral_commission_rate == referral_commission_rate) {
        logger.info('Commission change done!');
    } else {
        logger.info('Commission didnt changed!');
        logger.info(res.response);
    }
});
//enable comissions

// 
getAllItems();
loadHistoryCases();
loadTopUnbox();
loadPendingTrades();
// 

io.on('connection', function(socket) {
    socket.on('login', function(token) {
        pool.query('SELECT steamid, name, avatar, rank, mute, steam_level, refs, refs_opened, ref, uid FROM users WHERE token = ' + pool.escape(token), function(err, row) {
            if(err) throw err;
            // not logged in
            socketids[socket.id] = token;
            sockets[token] = socket.id;
            io.sockets.emit('website users online', Object.keys(sockets).length);
            if(chat_msgs.length > 0) socket.emit('website chat history', chat_msgs);

            socket.emit('website top unbox', TopUnbox);

            socket.emit('user to open cases', Cases);
            socket.emit('website live cases history', Cases_History);

            getWebsiteInformations(function(users, cases, preturile) {
                website = {
                    users: users,
                    cases: cases,
                    preturile: parseFloat(parseFloat(preturile/100).toFixed(2))
                }
                io.sockets.emit('website info', website);
            });

            // not logged in
            if(row.length == 0) return;
            //logged in
            users[token] = {
                steamid: row[0].steamid,
                name: row[0].name,
                avatar: row[0].avatar,
                rank: row[0].rank,
                mute: row[0].mute,
                ref: row[0].ref,
                uid: row[0].uid,
                keys: 0,
                level: -1
            };

            var now_url = 'https://api-trade.opskins.com/ICaseSite/GetKeyCount/v1?steam_id=' + users[token].steamid;
            vgo.opskins_api(now_url, 'GET', {}, function(res) {
                if(res.hasOwnProperty('message') && !res.hasOwnProperty('response')) return;
                users[token].keys = parseInt(res.response.key_count);
                pool.query('UPDATE users SET `keys` = ' + pool.escape(users[token].keys) + ' WHERE token = ' + pool.escape(token), function(e, r) {
                    if(e) throw e;
                    logger.info('User ' + users[token].steamid + ' loaded with ' + users[token].keys + ' keys!');

                    checkSteamLevel(row[0].steamid, row[0].steam_level, function(level) {
                        pool.query('UPDATE users SET steam_level = ' + pool.escape(level) + ' WHERE token = ' + pool.escape(token), function(eee, rrr) {
                            if(eee) return;

                            users[token].level = level;

                            socket.emit('user info', users[token]);
                        });
                    });
                });
            });

            if(row[0].uid != 0) {
                pool.query('SELECT code FROM codes WHERE user = ' + pool.escape(row[0].uid), function(err, ro) {
                    if(err) return;
                    var code = ro[0].code;

                    socket.emit('aff settings', {code: code, cases_opened: row[0].refs_opened, count: row[0].refs});
                });
            }

            if(row[0].ref != 0) {
                pool.query('SELECT code FROM codes WHERE user = ' + pool.escape(row[0].ref), function(err, ro) {
                    if(err) return;
                    var code = ro[0].code;

                    socket.emit('aff settings 2', {refereed_by: code});
                });
            }

            tokens[row[0].steamid] = token;
            ssockets[row[0].steamid] = socket.id;
        });
    });

    socket.on('user open casess', function(caseid, amount, token) {
        if(caseid && amount && token) {
            if(!users.hasOwnProperty(token)) return socket.emit('user eroare', 'You need to login to open cases!');
            if(UserTrades.hasOwnProperty(users[token].steamid)) return socket.emit('user eroare', 'You have a pending trade, please accept/cancel it!');
            if(parseInt(users[token].keys) == 0) return socket.emit('user eroare', 'You do not have suficient keys to open cases!');
            if(parseInt(users[token].keys) < parseInt(amount)) return socket.emit('user eroare', 'Insuficient keys to open cases!');
            if(parseInt(amount) < 1 || parseInt(amount) > 5) return socket.emit('user eroare', 'You can open 1 case up to 5 cases at a time!');

            var steamid = users[token].steamid;
            var eth_address = config.address;

            var now_url = 'https://api-trade.opskins.com/ICaseSite/SendKeyRequest/v1';

            var something = {
                'steam_id': steamid,
                'case_id': caseid,
                'amount': amount,
                'affiliate_eth_address': eth_address
            }

            if(users[token].ref != 0) {
                something['referral_uid'] = users[token].ref;
            }

            vgo.opskins_api(now_url, 'POST', something, function(res) {
                if(res.hasOwnProperty('message') && !res.hasOwnProperty('response')) return socket.emit('user eroare', 'An error ocurred!');
                if(res.response.offer.state == 2) {
                    var tid = res.response.offer.id;
                    PendingTrades[tid] = users[token].steamid;
                    UserTrades[users[token].steamid] = tid;

                    pool.query('INSERT INTO trades SET user = ' + pool.escape(users[token].steamid) + ', tid = ' + pool.escape(tid) + ', chei = ' + pool.escape(amount) + ', status = "-1"', function(er, ro) {
                        if(er) throw er;

                        logger.info('User ' + users[token].steamid + ' created trade #' + tid + ' for ' + amount + ' of keys!');
                        socket.emit('user trade', tid, res.response.offer_url);
                        checkUserOpenCase(tid, token, socket, 90, false, users[token].ref);
                    });
                } else {
                    socket.emit('user Error', 'Failed to open cases!');
                }
            });
        }
    });

    socket.on('user chat message', function(msg, token) {
        if(msg && token) {
            var mesaj = chat_message_escape(msg);

            if(anti_spam_chat[token]+1 >= time()) return socket.emit('user error', 'Do not spam!');
            else anti_spam_chat[token] = time();

            if(mesaj.length > 128) return socket.emit('user error', 'The message is too long!');
            else if(mesaj.length < 3) return socket.emit('user error', 'The message is too short!');

            var args = null;
            if(args = /^\/mute ([0-9]*) ([0-9]*)/.exec(mesaj)) {
                if(users[token].rank == 100) {

                    var new_time = parseInt(time()+args[2]);

                    pool.query('UPDATE users SET mute = ' + pool.escape(new_time) + ' WHERE steamid = ' + pool.escape(args[1]), function(err, row) {
                        if(err) return socket.emit('user eroare', 'This user doesn\'t exists!');

                        users[tokens[args[1]]].mute = new_time;
                        socket.emit('user alerta', 'User successfully muted for ' + args[2] + ' seconds!');
                    });
                }
            } else if(args = /^\/ban ([0-9]*)/.exec(mesaj)) {
                if(users[token].rank == 100) {
                    pool.query('UPDATE users SET ban = 1 WHERE steamid = ' + pool.escape(args[1]), function(err, row) {
                        if(err) return socket.emit('user eroare', 'This user doesn\'t exists!');

                        socket.emit('user alerta', 'User successfully banned!');
                        if(io.sockets.connected[ssockets[args[1]]]) io.sockets.connected[ssockets[args[1]]].emit('user refresh');
                    });
                }
            } else if(args = /^\/unban ([0-9]*)/.exec(mesaj)) {
                if(users[token].rank == 100) {
                    pool.query('UPDATE users SET ban = 0 WHERE steamid = ' + pool.escape(args[1]), function(err, row) {
                        if(err) return socket.emit('user eroare', 'This user doesn\'t exists!');

                        socket.emit('user alerta', 'User successfully unbanned!');
                    });
                }
            } else if(args = /^\/clear/.exec(mesaj)) {
                if(users[token].rank == 100) {
                    chat_msgs = [];
                    io.sockets.emit('website chat clear');
                }
            } else if(args = /^\/check ([0-9]*)/.exec(mesaj)) {
                if(users[token].rank == 100) {
                    var now_url = 'https://api-trade.opskins.com/ICaseSite/GetTradeStatus/v1?offer_id=' + args[1];
                    vgo.opskins_api(now_url, 'GET', {}, function(res) {
                        console.log('checking trade #' + args[1]);
                        console.log(res);
                        console.log(res.response.cases);
                    });
                }
            } else {
                if(mesaj.includes('/mute') && users[token].rank == 100) return cmdSyntax('/mute', socket);
                else if(mesaj.includes('/ban') && users[token].rank == 100) return cmdSyntax('/ban', socket);
                else if(mesaj.includes('/unban') && users[token].rank == 100) return cmdSyntax('/unban', socket);
                else if(mesaj.includes('/clear') && users[token].rank == 100) return cmdSyntax('/clear', socket);


                if(users[token].mute-time() > 0) return socket.emit('user error', 'You are muted!');
                else {
                    var props = {
                        steamid: users[token].steamid,
                        name: users[token].name,
                        avatar: users[token].avatar,
                        rank: users[token].rank,
                        msg: mesaj
                    };

                    chat_msgs.push(props);
                    if(chat_message_escape >= 30) chat_msgs.shift();

                    io.sockets.emit('user chat message add', props);
                }
            }
        }
    });

    socket.on('user create aff code', function(ref_code, wax_id, token) {
        if(ref_code && wax_id && token) {
            ref_code = ref_code.replace(/[^a-z0-9]/gi,'');
            wax_id = wax_id.replace(/\D/g, '');

            pool.query('SELECT id, user FROM codes WHERE code = ' + pool.escape(ref_code), function(err, row) {
                if(err) return;
                if(row.length == 0) {
                    pool.query('INSERT INTO codes SET code = ' + pool.escape(ref_code) + ', user = ' + pool.escape(wax_id), function(err, row) {
                        if(err) return;

                        pool.query('UPDATE users SET uid = ' + pool.escape(wax_id) + ' WHERE token = ' + pool.escape(token), function(e, r) {
                            if(e) return;

                            socket.emit('user alerta', 'Referral code successfully set to ' + ref_code + ' !');
                            socket.emit('aff code set', ref_code);
                        });
                    });
                } else {
                    if(row.user == wax_id) return socket.emit('user error', 'You already have this code!');
                    else socket.emit('user error', 'This code is already claimed by someone else! Try a different one!');
                }
            });
        }
    });

    socket.on('user use aff code', function(code, token) {
        if(code && token) {
            pool.query('SELECT ref FROM users WHERE token = ' + pool.escape(token), function(jss, sjdj) {
                if(jss) return;
                if(sjdj[0].ref == 0) {
                    pool.query('SELECT id, user FROM codes WHERE code = ' + pool.escape(code), function(err, row) {
                        if(err) return;
                        if(row.length == 0) return;

                        if(row[0].user == users[token].uid) return socket.emit('user error', 'You can\'t redeem your own affiliate code!');

                        pool.query('UPDATE users SET ref = ' + pool.escape(row[0].user) + ' WHERE token = ' + pool.escape(token), function(e, r) {

                            pool.query('UPDATE users SET refs = refs + 1 WHERE uid = ' + pool.escape(row[0].user), function(eeee, rrrr) {
                                users[token].ref = row[0].user;
                                socket.emit('user alerta', 'Successfully affiliate changed to ' + code);
                            });
                        });
                    });
                }
            });
        }
    });

    socket.on('disconnect', function() {
        delete sockets[socketids[socket.id]];
        delete socketids[socket.id];
        io.sockets.emit('website users online', Object.keys(sockets).length);
    });
});


function checkUserOpenCase(tid, token, socket, seconds, id, ref) {
    logger.info('checkUserOpenCase #' + tid + ' ');

    var tries = 0;

    var done = setInterval(function() {
        tries++;
        var now_url = 'https://api-trade.opskins.com/ICaseSite/GetTradeStatus/v1?offer_id=' + tid;
        vgo.opskins_api(now_url, 'GET', {}, function(res) {
            if(tries >= seconds) {
                pool.query('UPDATE trades SET status = "0" WHERE tid = ' + pool.escape(tid), function(er, ro) {
                    if(er) throw er;
                    logger.info('Offer #' + tid + ' cancelled due to ' + seconds + ' tries!');
                });
                clearInterval(done);
            } else {
                if(res.hasOwnProperty('message') && !res.hasOwnProperty('response')) {
                    logger.error(tid + ' error ' + res.message);
                    if(!id) socket.emit('user eroare', res.message);
                    pool.query('UPDATE trades SET status = "0" WHERE tid = ' + pool.escape(tid), function(er, ro) {
                        if(er) throw er;
                        logger.info('An error occurred with trade #' + tid);
                    });
                    delete PendingTrades[tid];
                    delete UserTrades[users[token].steamid];
                    return;
                }

                if(res.response.offer.state == 9) {
                    if(!id) socket.emit('user alerta', 'Your trade has been approved! Waiting for WAX Blockchain to confirm the transaction!');
                    if(!id) socket.emit('user waiting cases');

                    var done2 = setInterval(function() {
                        var now_url = 'https://api-trade.opskins.com/ICaseSite/GetTradeStatus/v1?offer_id=' + tid;
                        vgo.opskins_api(now_url, 'GET', {}, function(res) {
                            if(res.hasOwnProperty('response') && res.response.hasOwnProperty('cases') && res.response.offer.state == 3) {
                                var cases = res.response.cases;
                                var casess = [];
                                for(var i in cases) {
                                    var itm = cases[i];
                                    pool.query('INSERT INTO cases SET trade_id = ' + pool.escape(res.response.offer.id) + ', item_color = ' + pool.escape(itm.item.color) + ', case_id = ' + pool.escape(itm.item.id) + ', item_image = ' + pool.escape(itm.item.image["600px"]) + ', name = ' + pool.escape(users[token].name) + ', user = ' + pool.escape(users[token].steamid) + ', item_name = ' + pool.escape(itm.item.name) + ', item_price = ' + pool.escape(itm.item.suggested_price) + ', caseid = ' + pool.escape(itm.case_id) + ', time = ' + pool.escape(time()), function(ee, rr) {
                                        if(ref != 0) pool.query('UPDATE users SET refs_opened = refs_opened + 1 WHERE uid = ' + pool.escape(ref));
                                    });

                                    casess.push({
                                        id: itm.case_id,
                                        number: itm.item.id,
                                        item: itm.item
                                    });

                                    users[token].keys = users[token].keys - 1;
                                    if(!id) socket.emit('user keys', users[token].keys);

                                    emitHistory(token, itm);
                                }

                                if(!id) socket.emit('user successfull open cases', casess);

                                pool.query('UPDATE trades SET status = "1" WHERE tid = ' + pool.escape(tid), function(er, ro) {
                                    if(er) throw er;
                                    logger.info('Trade #' + tid + ' successfully accepted and user got items!');
                                });

                                setTimeout(function() {
                                    getWebsiteInformations(function(users, cases, preturile) {
                                        website = {
                                            users: users,
                                            cases: cases,
                                            preturile: parseFloat(parseFloat(preturile/100).toFixed(2))
                                        }
                                        io.sockets.emit('website info', website);

                                        setTimeout(function() {
                                            newTopUnbox();
                                        }, 2500);
                                    });
                                }, 9000);

                                delete PendingTrades[tid];
                                delete UserTrades[users[token].steamid];

                                clearInterval(done2);
                            }
                        });
                    }, 2500);

                    clearInterval(done);
                } else if((res.response.offer.state != 3 || res.response.offer.state != 9 || res.response.offer.state != 10 || res.response.offer.state != 12) && (res.hasOwnProperty('cases') && Object.keys(res.cases).lenght > 1)) {
                    if(!id) socket.emit('user error', 'An error ocurred with your trade!');
                    delete PendingTrades[tid];
                    delete UserTrades[users[token].steamid];
                    clearInterval(done);
                } else if(res.response.offer.state == 7) {
                    if(!id) socket.emit('user error', 'Trade declined!');
                    delete PendingTrades[tid];
                    delete UserTrades[users[token].steamid];
                    clearInterval(done);
                }
            }
        });
    }, 3000);
}

function loadPendingTrades() {
    pool.query('SELECT * FROM trades WHERE status = "-1"', function(err, row) {
        if(err) throw err;
        if(row.length == 0) return;

        for(var i in row){
            var itm = row[i];
            var tid = itm.tid;
            var token = tokens[itm.user];
            var socket = io.sockets.connected[ssockets[itm.user]];
            logger.info('Trade #' + tid + ' resumed for pending trades!');
            checkUserOpenCase(tid, token, socket, 20, true);
        }
    });
}

function loadTopUnbox() {
    pool.query('SELECT * FROM cases WHERE time > ' + pool.escape(time()-86400) + ' ORDER BY item_price DESC LIMIT 1', function(err, row) {
        if(err) return;
        if(row.length == 0) return;

        TopUnbox = {
            user: row[0].user,
            name: row[0].item_name,
            image: row[0].item_image,
            value: parseFloat(row[0].item_price/100).toFixed(2),
            case: row[0].case_id,
            opener: row[0].name
        };
    });
}

function newTopUnbox() {
    pool.query('SELECT * FROM cases WHERE time > ' + pool.escape(time()-86400) + ' ORDER BY item_price DESC LIMIT 1', function(err, row) {
        if(err) return;
        if(row.length == 0) return;

        TopUnbox = {
            user: row[0].user,
            name: row[0].item_name,
            image: row[0].item_image,
            value: parseFloat(row[0].item_price/100).toFixed(2),
            case: row[0].case_id,
            opener: row[0].name
        };

        io.sockets.emit('website top unbox', TopUnbox);
    });
}

function getWebsiteInformations(cb) {
    pool.query('SELECT COUNT(*) AS users FROM users', function(eeee, rrrr) {
        pool.query('SELECT COUNT(*) AS cases, SUM(`item_price`) AS preturile FROM cases', function(e1e, r1r) {
            var users = rrrr[0].users;
            var cases = r1r[0].cases;
            var preturile = r1r[0].preturile;

            cb(users, cases, preturile);
        });
    });
}

function loadHistoryCases() {
    pool.query('SELECT name, case_id, item_name, item_image, item_price, item_color, time FROM cases ORDER BY id DESC LIMIT 10', function(err, row) {
        if(err) throw err;
        if(row.length == 0) return;

        Cases_History = [];

        for(var z in row) {
            var itm = row[z];
            Cases_History.push({
                color: itm.item_color,
                image: itm.item_image,
                name: itm.item_name,
                user: itm.name,
                id: itm.case_id,
                price: parseFloat(parseFloat(itm.item_price/100).toFixed(2))
            });
        }
    });
}

function emitHistory(token, itm) {
    setTimeout(function() {
        Cases_History.unshift({
            color: itm.item.color,
            image: itm.item.image["600px"],
            name: itm.item.name,
            user: users[token].name,
            id: itm.item.id,
            price: parseFloat(parseFloat(itm.item.suggested_price/100).toFixed(2))
        });

        var toemit = {
            color: itm.item.color,
            image: itm.item.image["600px"],
            user: users[token].name,
            name: itm.item.name,
            id: itm.item.id,
            price: parseFloat(parseFloat(itm.item.suggested_price/100).toFixed(2))
        };

        io.sockets.emit('website live cases', toemit);
    }, 10000);
}

function getAllItems() {
    var now_url = 'https://api-trade.opskins.com/IItem/GetItems/v1/';
    vgo.opskins_api(now_url, 'GET', {}, function(res) {
        if(res.status == 1) {
            var items = res.response.items;
            for(var z in items) {
                if(items[z].length == 1) continue;
                ItemsCases.push({
                    sku: z,
                    name: items[z]['1'].name,
                    color: items[z]['1'].color,
                    rarity: items[z]['1'].rarity,
                    type: items[z]['1'].name.match(/\((.*)\)/)[1],
                    image: items[z]['1'].image['600px'],
                    price: items[z]['1'].suggested_price
                });
            }

            logger.info('All Items loaded. Total items loaded: ' + ItemsCases.length);

            getCasesSchema();
        } else {
            logger.error('Error getting AllItems');
            setTimeout('getAllItems', 5000);
        }
    });
}

function getCasesSchema() {
    var now_url = 'https://api-trade.opskins.com/ICase/GetCaseSchema/v1';
    vgo.opskins_api(now_url, 'GET', {}, function(res) {
        if(res.status == 1) {
            var cases = res.response.cases;
            for(var z in cases) {
                var itm = cases[z];
                if(!Cases.hasOwnProperty(itm.id)) Cases[itm.id] = [];
                var items = [];

                for(var j in itm.skus) {
                    var itmID = itm.skus[j];

                    for(var h in ItemsCases) {
                        if(itmID == ItemsCases[h].sku) {
                            items.push({
                                name: ItemsCases[h].name,
                                color: ItemsCases[h].color,
                                rarity: ItemsCases[h].rarity,
                                type: ItemsCases[h].type,
                                image: ItemsCases[h].image,
                                price: parseFloat(ItemsCases[h].price/100).toFixed(2)
                            });
                        }
                    }
                }

                Cases[itm.id].push({
                    name: itm.name,
                    img: itm.image['300px'],
                    items: items
                });
            }

            logger.info('CaseSchema loaded successfully! Total cases loaded: ' + Object.keys(Cases).length);
        } else {
            logger.error('Error getting CaseSchema');
            setTimeout('getCasesSchema', 5000);
        }
    });
}

function checkSteamLevel(steamid, current_level, cb) {
    if(current_level == -1) {
        var url = 'http://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=EE7FB681DD96C0447B91E670E446BB69&steamid=' + encodeURIComponent(steamid);
        request(url, function(err, res, body) {
            if(res.statusCode == 200) {
                var level = JSON.parse(body);
                cb(level.response.player_level);
            } else cb(0);
        });
    } else cb(current_level);
}

function cmdSyntax(cmd, socket) {
    if(cmd == '/mute') socket.emit('user alerta', 'Syntax: /mute [steamid] [seconds]');
    else if(cmd == '/ban') socket.emit('user alerta', 'Syntax: /ban [steamid]');
    else if(cmd == '/unban') socket.emit('user alerta', 'Syntax: /unban [steamid]');
    else if(cmd == '/clear') socket.emit('user alerta', 'Syntax: /clear');
}

function makeSecret() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i=0;i<8;i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function makePercentage() {
    return Math.random() * (99.9999999999 - 0.0000000001) + 0.0000000001;
}

function check_errors() {
    process.on('uncaughtException', function (err) {
        logger.error('[ERROR]');
        logger.error(err);
    });
}

function database_connection() {
    pool = mysql.createConnection(db_config);
    pool.connect(function(err) {
        if(err) {
            logger.error('[ERROR] Connecting to database "' + err.toString() + '"');
            setTimeout(function() { database_connection(); }, 2500);
        }
        else
        {
            logger.trace('[INFO] Connected to database!');
        }
    });
    pool.on('error', function(err) {
        logger.error('[ERROR] Syntax "' + err.toString() + '"');
        logger.error(err);
        if(err.code == 'PROTOCOL_CONNECTION_LOST') {
            setTimeout(function() { database_connection(); }, 2500);
            logger.trace('[INFO] Trying to reconnect to database...');
        }
        else
        {
            logger.error('[ERROR] Connecting to database ' + err.toString());
        }
    });
}

function chat_message_escape(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function time() {
    return parseInt(new Date().getTime()/1000);
}