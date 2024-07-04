<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';

    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;

    require '../PHPMailer/src/Exception.php';
    require '../PHPMailer/src/PHPMailer.php';
    require '../PHPMailer/src/SMTP.php';

    if($_SESSION['userrole'] == 'staff' || $_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'eventstaff'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    $userID = $_GET['id'];

    $info = getdate();
    $date = $info['mday'];
    $month = $info['mon'];
    $year = $info['year'];
    $hour = $info['hours'];
    $min = $info['minutes'];
    $sec = $info['seconds'];

    $currentdate = $month.'/'.$date.'/'.$year;

    if ($month == 10) {
        $nextMonth = 1;
        $nextYear = $year+1;
    } elseif ($month == 11) {
        $nextMonth = 2;
        $nextYear = $year+1;
    } elseif ($month == 12) {
        $nextMonth = 3;
        $nextYear = $year+1;
    } else {
        $nextMonth = $month+3;
        $nextYear = $year;
    }

    $suspendReleaseDate = $nextMonth.'/'.$date.'/'.$nextYear;

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `id` = '$userID'");
        $sql->execute();
        $bowlerFetched = $sql->fetch();

        $bowlerUBAID = $bowlerFetched['bowlerid'];
        $oldbowlerUBAID = $bowlerFetched['bowlerid'];
        $teamName = $bowlerFetched['team'];
        $bowlerName = $bowlerFetched['name'];
        $datesubmitted = date('Y-m-d H:i:s',strtotime($currentdate));

        if($_SESSION['userrole'] == 'admin'){
            $removedby = 'Admin';
        } else {
            $removedby = 'Self';
        }

        $currentstatus = 'Suspended';

        $eligibledate = date('Y-m-d H:i:s',strtotime($suspendReleaseDate));

        // $teamName = 'Independent';
        $owner = 0;
        $president = 0;
        $suspended = 1;

        // $bowlerUBAID = preg_split("#-#", $bowlerUBAID);
        // $bowlerUBAIDPre = $bowlerUBAID[0];
        // $bowlerUBAIDMain = $bowlerUBAID[1];

        // $sql = $db->prepare("SELECT * FROM `teams` WHERE `teamname` = '$teamName'");
        // $sql->execute();
        // $teamDataFetched = $sql->fetch(PDO::FETCH_ASSOC);
        // $teamDistrict = $teamDataFetched['division'];

        // $sql = $db->prepare("SELECT * FROM `districtcodes` WHERE `division` = '$teamDistrict'");
        // $sql->execute();
        // $teamDistrictData = $sql->fetch(PDO::FETCH_ASSOC);
        // $teamDistrictCode = $teamDistrictData['bcode'];

        // $bowlerUBAID = $teamDistrictCode.'-'.$bowlerUBAIDMain;
        $bowlerUBAID = $oldbowlerUBAID;

        if($_SESSION['userrole'] == 'admin'){
            
            // $teamName = 'Independent';
            $approved = 1;

            $statement = $db->prepare("INSERT INTO bowlersreleased (`bowlerid`, `bowler`, `team`, `datesubmitted`, `removedby`, `currentstatus`, `eligibledate`, `approved`)
            VALUES(:bowlerUBAID, :bowlerName, :teamName, :datesubmitted, :removedby, :currentstatus, :eligibledate, :approved)");
                
            $statement->execute(array(
                "bowlerUBAID" => $bowlerUBAID,
                "bowlerName" => $bowlerName,
                "teamName" => $teamName,            
                "datesubmitted" => $datesubmitted,
                "removedby" => $removedby,
                "currentstatus" => $currentstatus,
                "eligibledate" => $eligibledate,
                "approved" => $approved
            )); 
            
            $sql = "UPDATE `bowlers` 
                    SET `bowlerid` = :bowlerUBAID,
                        `team` = :teamName,
                        `owner` = :towner,
                        `president` = :president,   
                        `suspended` = :suspended
                    WHERE `id` = :userID";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
            $stmt->bindParam(':teamName', $teamName);
            $stmt->bindParam(':towner', $owner);
            $stmt->bindParam(':president', $president);
            $stmt->bindParam(':suspended', $suspended);
            $stmt->bindParam(':userID', $userID);
            $stmt->execute();   
            
            $sql = "UPDATE `bowlerdata` 
                    SET `bowlerid` = :bowlerUBAID,
                        `team` = :teamName
                    WHERE `bowlerid` = :oldbowlerUBAID";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
            $stmt->bindParam(':teamName', $teamName);
            $stmt->bindParam(':oldbowlerUBAID', $oldbowlerUBAID);
            $stmt->execute();   

            $sql = "UPDATE `bowlerdataseason` 
                    SET `bowlerid` = :bowlerUBAID,
                        `team` = :teamName
                    WHERE `bowlerid` = :oldbowlerUBAID";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
            $stmt->bindParam(':teamName', $teamName);
            $stmt->bindParam(':oldbowlerUBAID', $oldbowlerUBAID);
            $stmt->execute();  

        } else {
            $statement = $db->prepare("INSERT INTO bowlersreleased (`bowlerid`, `bowler`, `team`, `datesubmitted`, `removedby`, `currentstatus`, `eligibledate`)
            VALUES(:bowlerUBAID, :bowlerName, :teamName, :datesubmitted, :removedby, :currentstatus, :eligibledate)");
                
            $statement->execute(array(
                "bowlerUBAID" => $oldbowlerUBAID,
                "bowlerName" => $bowlerName,
                "teamName" => $teamName,            
                "datesubmitted" => $datesubmitted,
                "removedby" => $removedby,
                "currentstatus" => $currentstatus,
                "eligibledate" => $eligibledate
            )); 
        }

        $_SESSION['success'] = 'Bowler Suspended from Team';

        $mail = new PHPMailer;
        $mail->From = "info@ubaaverages.com"; //
        $mail->FromName = "UBA";

        $mail->addAddress($uemail);
        
        $mail->isHTML(true);
        $mail->Subject = "Released from ".$teamName." | UBA";
        $mail->Body = '<h2 style="color:#000;">Dear, '.$bowlerName.'</h2>
                    <p>A team officer or an administrator of the UBA has released you from your UBA Franchise effective '.$currentdate.' </p>
                    <br> 
                    <p>If you feel this has been an error, please contact your team officer.</p>
                    <br>
                    <p> Thank you, <br> UBA Admin </p>
                    ';

        if ($mail->send()) {
            if($_SESSION['userrole'] == 'admin'){
                header("Location: ".$base_url."/dashboard/roster.php");
            } else if ($_SESSION['userrole'] == 'president' || $_SESSION['userrole'] == 'owner'){
                
                $bowlerName = $bowlerFetched['name'];
    
                if ($_SESSION['login_user'] == $bowlerName) {
                    header("Location: ".$base_url."/dashboard/logout.php");
                } else {
                    header("Location: ".$base_url."/dashboard/teamroster.php");
                }
            }
        }

        
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