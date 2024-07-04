<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    if ($_GET['id'] == 'scoreData') {
        unset($_SESSION['dataChosen']);
        unset($_SESSION['scoreDataType']);
        unset($_SESSION['scoreDataTeam']);
        unset($_SESSION['scoreDataBowler']);
        unset($_SESSION['scoreDataEventName']);
        header("Location: ".$base_url."/dashboard/scoreData.php");
    }

    if ($_GET['page'] == 'season') {
        unset($_SESSION['seasonYear']);
        unset($_SESSION['seasonDate']);
        unset($_SESSION['seasonTourStop']);
        unset($_SESSION['seasonLocation']);
        unset($_SESSION['seasonTeam']);
        $_SESSION['seasonData'] = false;
        header("Location: ".$base_url."/dashboard/addscoreseason.php");
    }

    if ($_GET['page'] == 'event') {
        $_SESSION['eventData'] = false;
        unset($_SESSION['eventYear']);
        unset($_SESSION['eventDate']);
        unset($_SESSION['eventName']);
        unset($_SESSION['eventLocation']);
        unset($_SESSION['eventTeam']);
        header("Location: ".$base_url."/dashboard/addscoreevent.php");
    }


?>