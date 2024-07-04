<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';

    if($_SESSION['userrole'] != 'admin'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    $status = $_GET['id'];
    $bowlerUBAID = $_GET['bowler'];
    $tableID = $_GET['tab'];
    $type = $_GET['type'];


    try {
        $database = new Connection();
        $db = $database->openConnection();
        


        if ($status == 'y') {
            $president = 0;

            $sql = $db->prepare("SELECT * FROM `bowlerTransfers` WHERE `id` = :tableID");
            $sql->execute([':tableID' => $tableID]);
            $transferDeets = $sql->fetch();
            $newTeam = $transferDeets['toteam'];

            $sql = "UPDATE bowlers 
                    SET `team` = :newTeam,
                        `president` = :president,
                        `owner` = :president
                    WHERE bowlerid = :bowlerUBAID";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':newTeam', $newTeam);
            $stmt->bindParam(':president', $president);
            $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
            $stmt->execute(); 
            
            $president = 1;
            $sql = "UPDATE bowlerTransfers 
                    SET `approved` = :president
                    WHERE `id` = :tableID";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':president', $president);
            $stmt->bindParam(':tableID', $tableID);
            $stmt->execute(); 


            //update the bowlerTran           
            $sql = "UPDATE bowlersreleased 
                    SET `isTransferred` = 1
                    WHERE `bowlerid` = :bowlerUBAID1";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':bowlerUBAID1', $bowlerUBAID);
            $stmt->execute(); 


            
            if($type == 'saveAndAddToTheRoster'){
                $sql = "UPDATE submittedrosters 
                    SET `team` = :newTeam2
                    WHERE `bowlerid` = :bowlerUBAID2";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':newTeam2', $newTeam);
            $stmt->bindParam(':bowlerUBAID2', $bowlerUBAID);            
            $stmt->execute(); 

            $sql = "DELETE FROM `submittedrosters` WHERE `bowlerid` = '$bowlerUBAID'";
            $db->exec($sql);


            //date time

            $info = getdate();
            $date = $info['mday'];
            $month = $info['mon'];
            $year = $info['year'];
            $hour = $info['hours'];
            $min = $info['minutes'];
            $sec = $info['seconds'];

            $currentdate = date_create()->format('Y-m-d H:i:s');             

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

            //Add to current roster







            }//end of saveAndAddToTheRoster

            // $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `bowlerid` = :bowlerUBAID");
            // $sql->execute([':bowlerUBAID' => $bowlerUBAID]);
            // $bowlerDeets = $sql->fetch();

            // $bowlername = $bowlerDeets['name'];
            // $teamname = $bowlerDeets['team'];
            
            // $sql = "UPDATE teams 
            //         SET `president` = :bowlername
            //         WHERE `teamname` = :teamname";

            // $stmt = $db->prepare($sql);                                  
            // $stmt->bindParam(':bowlername', $bowlername);
            // $stmt->bindParam(':teamname', $teamname);
            // $stmt->execute(); 

            $_SESSION['success'] = 'Bowler Transfer Request Approved';
        } else {
        
            $sql = "DELETE FROM `bowlerTransfers` WHERE `id`='$tableID'";
            $db->exec($sql);

            $_SESSION['success'] = 'Bowler Transfer Request Denied';
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
