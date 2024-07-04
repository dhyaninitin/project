<?php
	include_once '../baseurl.php';
    if($_SESSION['userrole'] == 'eventstaff'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

?>