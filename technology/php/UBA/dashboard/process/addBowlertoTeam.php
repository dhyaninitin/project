<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';

    if($_SESSION['userrole'] == 'staff' || $_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'admin' || $_SESSION['userrole'] == 'eventstaff'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    $userID = $_GET['id'];
    $teamName = $_SESSION['team'];
    $requestedby = $_SESSION['login_user'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $owner = 0;
        $president = 0;

        $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `bowlerid` = '$userID'");
        $sql->execute();
        $bowlerFetched = $sql->fetch();
        $bowlerUBAID = $bowlerFetched['bowlerid'];
        $bowlerName = $bowlerFetched['name'];
        $bowlerTeam = $bowlerFetched['team'];

        $statement = $db->prepare("INSERT INTO bowlerTransfers (`bowlerid`,`requestedby`, `bowler`, `fromteam`, `toteam`)
        VALUES(:bowlerUBAID, :requestedby, :bowlerName, :bowlerTeam, :teamName)");
            
        $statement->execute(array(
            "bowlerUBAID" => $bowlerUBAID,
            "requestedby" => $requestedby,
            "bowlerName" => $bowlerName,
            "bowlerTeam" => $bowlerTeam,
            "teamName" => $teamName
        )); 

        // $sql = "UPDATE `bowlerTransfers`
        //         SET `bowlerid` = :bowlerUBAID,
        //             `requestedby` = :requestedby,
        //             `bowler` = :bowlerName,
        //             `fromteam` = :bowlerTeam,
        //             `toteam` = :teamName
        //         WHERE `id` = :userID";

        // $stmt = $db->prepare($sql);                                  
        // $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
        // $stmt->bindParam(':requestedby', $requestedby);
        // $stmt->bindParam(':bowlerName', $bowlerName);
        // $stmt->bindParam(':bowlerTeam', $bowlerTeam);
        // $stmt->bindParam(':teamName', $teamName);
        // $stmt->bindParam(':userID', $userID);
        // $stmt->execute(); 

        $_SESSION['success'] = 'Bowler Transfer request sent';
        header("Location: ".$base_url."/dashboard/teamAddBowler.php");
        
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