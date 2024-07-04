<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';

    if($_SESSION['userrole'] != 'admin'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    $status = $_GET['id'];
    $bowlerUBAID = $_GET['bowler'];
    $type = $_GET['type'];


    try {
        $database = new Connection();
        $db = $database->openConnection();

        if ($status == 'y') {
            $president = 1;

            $sql = "UPDATE bowlers 
                SET `active` = :president
                WHERE bowlerid = :bowlerUBAID";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':president', $president);
            $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
            $stmt->execute(); 

            $_SESSION['success'] = 'Bowler is now active in the system';
        } else {
            $president = 0;

            $sql = "DELETE FROM `bowlers` WHERE `bowlerid`='$bowlerUBAID'";
            $db->exec($sql);

            $_SESSION['success'] = 'Bowler is deleted from the system';
        }


           if($type == 'addAndAddToTheRoster'){ 

            //date time

            $info = getdate();
            $date = $info['mday'];
            $month = $info['mon'];
            $year = $info['year'];
            $hour = $info['hours'];
            $min = $info['minutes'];
            $sec = $info['seconds'];

            $currentdate = date_create()->format('Y-m-d H:i:s');             


            $sql = "DELETE FROM `submittedrosters` WHERE `bowlerid` = '$bowlerUBAID'";
            $db->exec($sql);
            
            $sql = "DELETE FROM `currentroster` WHERE `bowlerid` = '$bowlerUBAID'";
            $db->exec($sql);

            $sql = $db->prepare("SELECT `bowlerid`, `team`, `name`, `nickname1`, `bstatus`, `officeheld`, `uemail`, `sanction` FROM `bowlers` WHERE `bowlerid` = '$bowlerUBAID'");
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

            //CURRENT ROSTER

             foreach ($dataFetched as $bowler) {

                $bowlerID = $bowler['bowlerid'];
                $teamName = $bowler['team'];
                $bowlerName = $bowler['name'];
                $nickname1 = $bowler['nickname1'];
                $officeHeld = $bowler['officeheld'];
                $uemail = $bowler['uemail'];
                $sanction = $bowler['sanction'];               

                //current roster

                 $statement = $db->prepare("INSERT INTO currentroster (`bowlerid`, `team`, `name`, `nickname1`, `officeheld`, `uemail`, `sanction`)
                VALUES(:bowlerID1, :teamName1, :bowlerName1, :nickname11, :officeHeld1, :uemail1, :sanction1)");
                    
                $statement->execute(array(
                    "bowlerID1" => $bowlerID,
                    "teamName1" => $teamName,
                    "bowlerName1" => $bowlerName,
                    "nickname11" => $nickname1,
                    "officeHeld1" => $officeHeld,
                    "uemail1" => $uemail,
                    "sanction1" => $sanction
                )); 


            }


            //update the team
//             $tempTeam = strtoupper($teamName);
//             $sql = "UPDATE teams 
//                     SET `rostersubmissiondate` = '$currentdate'                  
//                     WHERE `teamname` = '$tempTeam'";
// //  `submittedby` = 'Admin' 
//             $stmt = $db->prepare($sql);                             
//             $stmt->execute();


            // $sql = "UPDATE teams 
            //         SET  `submittedby` = 'Admin'                  
            //         WHERE `teamname` = '$tempTeam'";
            // $stmt = $db->prepare($sql);                             
            // $stmt->execute();

            }
        
        header("Location: ".$base_url."/dashboard/home.php");
        
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