<?php

    include_once '../session.php';
    include_once '../connect.php';

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $useremail = $_SESSION['useremail'];
        $bowler = $_SESSION['login_user'];
        $teamName = $_SESSION['team'];

        $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `uemail` = '$useremail'");
        $sql->execute();
        $bowlerDeets = $sql->fetch();
        $bowlerUBAID = $bowlerDeets['bowlerid'];

        $statement = $db->prepare("INSERT INTO presidency (`bowlerid`,`bowler`, `team`)
        VALUES(:bowlerUBAID, :bowler, :teamName)");
            
        $statement->execute(array(
            "bowlerUBAID" => $bowlerUBAID,
            "bowler" => $bowler,
            "teamName" => $teamName
        )); 

    // $_SESSION['success'] = 'Bowler Added';

    header("Location: /dashboard/home.php");
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

?>