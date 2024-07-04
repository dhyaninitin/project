<?php
include_once 'baseurl.php';
	session_start();

	if(!$_SESSION['login_user']) {
		header("Location: ".$base_url."/index.php"); //redirect to login page to secure the welcome page without login access.
	}

?>