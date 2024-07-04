<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';

    if($_SESSION['userrole'] == 'president' || $_SESSION['userrole'] == 'secretary' || $_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'eventstaff' || $_SESSION['userrole'] == 'owner'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    $oldTeamName = $_POST['oldTeamName'];
    $teamName = $_POST['teamName'];
    $conference = $_POST['conference'];
    $teamDivision = $_POST['teamDivision'];
    $homeHouse = $_POST['homeHouse'];
    // $teamPresident = $_POST['teamPresident'];
    // $teamVicePresident = $_POST['teamVicePresident'];
    // $teamCaptain = $_POST['teamCaptain'];
    $teamContact = 'Null';

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `teams` WHERE `teamname` = :oldTeamName");
        $sql->execute([':oldTeamName' => $oldTeamName]);
        $dataFetched = $sql->fetch(PDO::FETCH_ASSOC);

        $teamID = $dataFetched['id'];

        $sql = "UPDATE teams 
                SET `teamname` = :teamName,
                `conference` = :conference,
                `division` = :teamDivision,
                `homeHouse` = :homeHouse,
                `contact` = :teamContact
                WHERE `id` = :teamID";

        $stmt = $db->prepare($sql);                                  

        $stmt->bindParam(':teamName', $teamName);
        $stmt->bindParam(':conference', $conference);
        $stmt->bindParam(':teamDivision', $teamDivision);
        $stmt->bindParam(':homeHouse', $homeHouse);
        // $stmt->bindParam(':teamPresident', $teamPresident);
        // $stmt->bindParam(':teamVicePresident', $teamVicePresident);
        // $stmt->bindParam(':teamCaptain', $teamCaptain);
        $stmt->bindParam(':teamContact', $teamContact);
        $stmt->bindParam(':teamID', $teamID);

        $stmt->execute();       
        
        // Change Team name in bowler list

        if ($oldTeamName != $teamName) {
            $sql = "UPDATE bowlers 
                SET `team` = :teamName
                WHERE `team` = :oldTeamName";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':teamName', $teamName);
            $stmt->bindParam(':oldTeamName', $oldTeamName);
            $stmt->execute();

            // Change team name in the Events Data

            $sql = "UPDATE bowlerdata 
                    SET `team` = :teamName
                    WHERE `team` = :oldTeamName";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':teamName', $teamName);
            $stmt->bindParam(':oldTeamName', $oldTeamName);
            $stmt->execute();

            // Change team name in the Season Data

            $sql = "UPDATE bowlerdataseason 
                    SET `team` = :teamName
                    WHERE `team` = :oldTeamName";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':teamName', $teamName);
            $stmt->bindParam(':oldTeamName', $oldTeamName);
            $stmt->execute();
        }

        

        //     $statement = $db->prepare("INSERT INTO teams (`teamname`, `conference`, `division`, `homehouse`, `president`, `vp`, `captain`, `contact`)
        //     VALUES(:teamName, :conference, :teamDivision, :homeHouse, :teamPresident, :teamVicePresident, :teamCaptain, :teamContact)");
                
        //     $statement->execute(array(
        //         "teamName" => $teamName,
        //         "conference" => $conference,
        //         "teamDivision" => $teamDivision,
        //         "homeHouse" => $homeHouse,
        //         "teamPresident" => $teamPresident,
        //         "teamVicePresident" => $teamVicePresident,
        //         "teamCaptain" => $teamCaptain,
        //         "teamContact" => $teamContact
        //     ));      

            $_SESSION['success'] = 'Team Updated';
            $_SESSION['teamName'] = $teamName;
            header("Location: ".$base_url."/dashboard/editTeam.php");
            
        
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