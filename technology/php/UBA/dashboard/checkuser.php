<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] != 'admin' || $_SESSION['userrole'] == 'staff') {
        header("Location: ".$base_url."/dashboard/logout.php"); //redirect to login page to secure the welcome page without login access.
    }

?>


