<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';

    if($_SESSION['userrole'] == 'president' || $_SESSION['userrole'] == 'secretary' || $_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'eventstaff' || $_SESSION['userrole'] == 'owner'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    $mainevent = $_POST['mainEvent'];
    $subevent = $_POST['subEvent'];
    $eventdate = date('Y-m-d H:i:s',strtotime($_POST['datepicker']));
    $noOfSquads = $_POST['squads'];
    $maxEntryPerSquad = $_POST['maxBowlers'];
    $costPerBowler = $_POST['cost'];
    $eventlocation = $_POST['eventType'];
    $entryEvent = $_POST['entryEvent'];
    $bowlerRegister = $_POST['bowlerRegister'];
    $eventActive = $_POST['eventActive'];

    if($entryEvent == 'team') {
        $bowlersPerTeam = $_POST['bowlersPerTeam'];
        $teamStructure = $_POST['teamStructure'];
    } else {
        $bowlersPerTeam = 0;
        $teamStructure = '-';
    }

    if($bowlerRegister == 'yes') {
        $bowlerRegister = 1;
    } else {
        $bowlerRegister = 0;
    }

    if($eventActive == 'yes') {
        $eventActive = 1;
    } else {
        $eventActive = 0;
    }

    $eventname =  $mainevent .' | '. $subevent.' | '. $eventdate;

    try {
        $database = new Connection();
        $db = $database->openConnection();

            $statement = $db->prepare("INSERT INTO `events` (`mainevent`, `subevent`, `eventdate`, `eventname`, `evententry`, `perteam`, `teamstructure`, `noOfSquads`, `maxEntryPerSquad`, `costPerBowler`, `location`, `bowlerregister`, `active`)
            VALUES(:mainevent, :subevent, :eventdate, :eventname, :evententry, :perteam, :teamstructure, :noOfSquads, :maxEntryPerSquad, :costPerBowler, :eventlocation, :bowlerregister, :active)");
                
            $statement->execute(array(
                "mainevent" => $mainevent,
                "subevent" => $subevent,
                "eventdate" => $eventdate,
                "eventname" => $eventname,
                "evententry" => $entryEvent,
                "perteam" => $bowlersPerTeam,
                "teamstructure" => $teamStructure,
                "noOfSquads" => $noOfSquads,
                "maxEntryPerSquad" => $maxEntryPerSquad,
                "costPerBowler" => $costPerBowler,
                "eventlocation" => $eventlocation,
                "bowlerregister" => $bowlerRegister,
                "active" => $eventActive
            ));      

            $_SESSION['success'] = 'Event Added';
            header("Location: ".$base_url."/dashboard/addEvent.php");
            
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    // echo password_hash("Hoolale.27", PASSWORD_BCRYPT, $options);

    // $hash = password_hash("Hoolale.27", PASSWORD_DEFAULT);

    // if (password_verify('Hoolale.27', $hash)) {
    //     echo 'Password is valid!';
    // } else {
    //     echo 'Invalid password.';
    // }

    

    // try {
    //     $database = new Connection();
    //     $db = $database->openConnection();

    //     $sql = $db->prepare("SELECT * FROM `teams` WHERE `$column` LIKE '%$searchTerm%' GROUP BY `teamname` ORDER BY `teamname`");
    //     $sql->execute();
    //     $dataFetched = $sql->fetchAll();
        
    // } catch (PDOException $e) {
    //     echo "There was some problem with the connection: " . $e->getMessage();
    // }

?>