<?php

$groupid = 33177315;
$apikey = "078D5A5C7C8DA991FB118B9CC9AA2B81";

if(isset($_GET['steamid'])) $user_steamid = $_GET['steamid'];
else $user_steamid = 76561198247487024;

$jsonData = json_decode(file_get_contents('https://api.steampowered.com/ISteamUser/GetUserGroupList/v1?key='. $apikey .'&steamid=' . $user_steamid . '&format=json'));
$body = $jsonData->response;

if($body->success == true) {
	$groups = $body->groups;
	$found = false;
	foreach($groups as $key => $value) {
		$gid = $value->gid;
		if($gid == $groupid) $found = true;
	}
	if($found == true) printf('Group found!');
} else {
	printf('Group not found!');
}