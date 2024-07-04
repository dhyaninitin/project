<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';

    if($_SESSION['userrole'] == 'staff' || $_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'eventstaff'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    $userID = $_GET['id'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `bowlersreleased` WHERE `id` = '$userID'");
        $sql->execute();
        $bowlerFetched = $sql->fetch();

        $bowler = $bowlerFetched['bowler'];
        $bowlerUBAID = $bowlerFetched['bowlerid'];

        $suspended = 0;
        $sql = "UPDATE `bowlers` 
                SET `suspended` = :suspended
                WHERE `bowlerid` = :bowlerUBAID";

        $stmt = $db->prepare($sql);                                  
        $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
        $stmt->bindParam(':suspended', $suspended);
        $stmt->execute(); 

        // $sql = "DELETE FROM `bowlersreleased` WHERE `id`='$userID'";
        // $db->exec($sql);

        $_SESSION['success'] = $bowler. ' Reinstated';

        header("Location: ".$base_url."/dashboard/rsbowler.php");
        
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