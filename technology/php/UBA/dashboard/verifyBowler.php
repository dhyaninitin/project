<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    $bowlerID = $_GET['id'];    

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `id` = '$bowlerID'");
        $sql->execute();
        $verifyBowler = $sql->fetch();

        $bowlerUBAID = $verifyBowler['bowlerid'];
        $bowlerVerificationCode = $verifyBowler['verificationcode'];

        $_SESSION['success'] = 'Bowler Successfully Verified';

        $verified = 1;

        $sql = "UPDATE bowlers 
                SET `verified` = :verified
                WHERE bowlerid = :bowlerUBAID";
        $stmt = $db->prepare($sql);                                  

        $stmt->bindParam(':verified', $verified);
        $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
        $stmt->execute();  

        $sql = "UPDATE emailverification 
                SET `verified` = :verified
                WHERE bowlerid = :bowlerUBAID";
        $stmt = $db->prepare($sql);                                  

        $stmt->bindParam(':verified', $verified);
        $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
        $stmt->execute();  

        header("Location: ".$base_url."/dashboard/registrations.php");
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

?>]