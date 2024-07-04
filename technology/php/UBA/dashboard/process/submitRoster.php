<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';

    if($_SESSION['userrole'] == 'admin' || $_SESSION['userrole'] == 'staff' || $_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'eventstaff'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    $teamName = $_SESSION['team'];

    $info = getdate();
    $date = $info['mday'];
    $month = $info['mon'];
    $year = $info['year'];
    $hour = $info['hours'];
    $min = $info['minutes'];
    $sec = $info['seconds'];

    // $currentdate = $month.'/'.$date.'-'.$year .' '. $hour.'-'.$min.'-'.$sec;

    // $currentdate = date('Y-m-d H:i:s',strtotime($currentdate));
    $currentdate = date_create()->format('Y-m-d H:i:s');

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT `rostersubmitted` FROM `teams` WHERE `teamname` = '$teamName'");
        $sql->execute();
        $checkTeamRoster = $sql->fetch();

        if ($checkTeamRoster == 1) {
            $sql = "DELETE FROM `submittedrosters` WHERE `team` = '$teamName'";
            $db->exec($sql);

            $sql = $db->prepare("SELECT `bowlerid`, `team`, `name`, `nickname1`, `bstatus`, `officeheld`, `uemail`, `sanction` FROM `bowlers` WHERE `team` = '$teamName'");
            $sql->execute();
            $dataFetched = $sql->fetchAll();

            foreach ($dataFetched as $bowler) {

                $bowlerID = $bowler['bowlerid'];
                $teamName = $bowler['team'];
                $bowlerName = $bowler['name'];
                $nickname1 = $bowler['nickname1'];
                $officeHeld = $bowler['officeheld'];
                $uemail = $bowler['uemail'];
                $sanction = $bowler['sanction'];
                
                $statement = $db->prepare("INSERT INTO submittedrosters (`bowlerid`, `team`, `name`, `nickname1`, `officeheld`, `uemail`, `sanction`)
                VALUES(:bowlerID, :teamName, :bowlerName, :nickname1, :officeHeld, :uemail, :sanction)");
                    
                $statement->execute(array(
                    "bowlerID" => $bowlerID,
                    "teamName" => $teamName,
                    "bowlerName" => $bowlerName,
                    "nickname1" => $nickname1,
                    "officeHeld" => $officeHeld,
                    "uemail" => $uemail,
                    "sanction" => $sanction
                )); 

            }

            $sql = "UPDATE teams 
                    SET `rostersubmissiondate` = :currentdate
                    WHERE `teamname` = :teamName";

            $stmt = $db->prepare($sql);                             
            $stmt->bindParam(':currentdate', $currentdate);
            $stmt->bindParam(':teamName', $teamName);
            $stmt->execute();

            $_SESSION['success'] = 'Roster Re-submitted';
            header("Location: ".$base_url."/dashboard/submitroster.php");
            // $_SESSION['error'] = 'Roster already submitted';
            // header("Location: /dashboard/submitroster.php");
        }

        $sql = $db->prepare("SELECT `bowlerid`, `team`, `name`, `nickname1`, `bstatus`, `officeheld`, `uemail`, `sanction` FROM `bowlers` WHERE `team` = '$teamName'");
        $sql->execute();
        $dataFetched = $sql->fetchAll();

        foreach ($dataFetched as $bowler) {

            $bowlerID = $bowler['bowlerid'];
            $teamName = $bowler['team'];
            $bowlerName = $bowler['name'];
            $nickname1 = $bowler['nickname1'];
            $officeHeld = $bowler['officeheld'];
            $uemail = $bowler['uemail'];
            $sanction = $bowler['sanction'];
            
            $statement = $db->prepare("INSERT INTO submittedrosters (`bowlerid`, `team`, `name`, `nickname1`, `officeheld`, `uemail`, `sanction`)
            VALUES(:bowlerID, :teamName, :bowlerName, :nickname1, :officeHeld, :uemail, :sanction)");
                
            $statement->execute(array(
                "bowlerID" => $bowlerID,
                "teamName" => $teamName,
                "bowlerName" => $bowlerName,
                "nickname1" => $nickname1,
                "officeHeld" => $officeHeld,
                "uemail" => $uemail,
                "sanction" => $sanction
            )); 

        }

        $rostersubmitted = 1;
        $submittedby = 'Team';

        $sql = "UPDATE teams 
                SET `rostersubmitted` = :rostersubmitted,
                `submittedby` = :submittedby,
                `rostersubmissiondate` = :currentdate
                WHERE `teamname` = :teamName";

        $stmt = $db->prepare($sql);                                  
        $stmt->bindParam(':rostersubmitted', $rostersubmitted);
        $stmt->bindParam(':submittedby', $submittedby);
        $stmt->bindParam(':currentdate', $currentdate);
        $stmt->bindParam(':teamName', $teamName);
        $stmt->execute();

        $_SESSION['success'] = 'Roster Submitted';
        header("Location: ".$base_url."/dashboard/submitroster.php");
            
        
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