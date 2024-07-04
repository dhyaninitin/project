<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] != 'admin'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `emailverification` WHERE `verified` = 1");
        $sql->execute();
        $dataFetched = $sql->fetchAll();

        foreach ($dataFetched as $verified) {
            $bowlerUBAID = $verified['bowlerid'];

            $yes = 1;

            $sql = "UPDATE bowlers 
                    SET `verified` = :yes
                    WHERE `bowlerid` = :bowlerUBAID";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':yes', $yes);
            $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
            $stmt->execute();  
        }
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }


?>