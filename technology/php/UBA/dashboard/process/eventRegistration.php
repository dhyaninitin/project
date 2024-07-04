<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';

    // if($_SESSION['userrole'] == 'president' || $_SESSION['userrole'] == 'secretary' || $_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'eventstaff' || $_SESSION['userrole'] == 'owner'){
    //     header("Location: /dashboard/home.php");
    // }

    $eventID = $_POST['event'];
    $squad = $_POST['squad'];
    $mainbowler = $_POST['mainbowler'];
    $teammates = $_POST['teammates'];
    
    $team;
    for ($i=0; $i < sizeof($teammates); $i++) { 
        $team .= $teammates[$i].', ';
    }

    $useremail = $_SESSION['useremail'];
    

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `events` WHERE `id` = '$eventID'");
        $sql->execute();
        $eventDeets = $sql->fetch();

        $eventname = $eventDeets['eventname'];
        $eventID = $eventDeets['id'];

        $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `uemail` = '$useremail'");
        $sql->execute();
        $bowlerDeets = $sql->fetch();

        $bowlerUBAID = $bowlerDeets['bowlerid'];
        $bowlername = $bowlerDeets['name'];

        if ($eventDeets['evententry'] == 'team') {
            $statement = $db->prepare("INSERT INTO `eventregistrations` (`eventname`, `eventid`, `bowlerid`, `bowler`, `squad`, `teammates`)
            VALUES(:eventname, :eventID, :bowlerUBAID, :bowlername, :squad, :teammates)");
                
            $statement->execute(array(
                "eventname" => $eventname,
                "eventID" => $eventID,
                "bowlerUBAID" => $bowlerUBAID,
                "bowlername" => $bowlername,
                "squad" => $squad,
                "teammates" => $team
            ));      
            
        } else {
            $statement = $db->prepare("INSERT INTO `eventregistrations` (`eventname`, `eventid`, `bowlerid`, `bowler`, `squad`)
            VALUES(:eventname, :eventID, :bowlerUBAID, :bowlername, :squad)");
                
            $statement->execute(array(
                "eventname" => $eventname,
                "eventID" => $eventID,
                "bowlerUBAID" => $bowlerUBAID,
                "bowlername" => $bowlername,
                "squad" => $squad
            ));      

        }

        
        $_SESSION['success'] = 'Registered for event';
        header("Location: ".$base_url."/dashboard/registerEvent.php");
            
        
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