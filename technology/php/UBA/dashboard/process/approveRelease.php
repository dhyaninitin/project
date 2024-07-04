<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';

    if($_SESSION['userrole'] != 'admin'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    $status = $_GET['id'];
    $oldbowlerUBAID = $_GET['bowler'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $bowlerUBAID = preg_split("#-#", $oldbowlerUBAID);
        $bowlerUBAIDPre = $bowlerUBAID[0];
        $bowlerUBAIDMain = $bowlerUBAID[1];

        // $sql = $db->prepare("SELECT * FROM `teams` WHERE `teamname` = '$teamName'");
        // $sql->execute();
        // $teamDataFetched = $sql->fetch(PDO::FETCH_ASSOC);
        // $teamDistrict = $teamDataFetched['division'];

        // $sql = $db->prepare("SELECT * FROM `districtcodes` WHERE `division` = '$teamDistrict'");
        // $sql->execute();
        // $teamDistrictData = $sql->fetch(PDO::FETCH_ASSOC);
        // $teamDistrictCode = $teamDistrictData['bcode'];

        $bowlerUBAID = $oldbowlerUBAID;

        if ($status == 'y') {

            $teamName = 'Released Bowlers';

            $president = 1;

            $sql = "UPDATE bowlersreleased 
                SET `approved` = :president
                WHERE bowlerid = :oldbowlerUBAID";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':president', $president);
            $stmt->bindParam(':oldbowlerUBAID', $oldbowlerUBAID);
            $stmt->execute();

            $sql = "UPDATE `bowlers` 
                    SET `bowlerid` = :bowlerUBAID,
                        `team` = :teamName
                    WHERE `bowlerid` = :oldbowlerUBAID";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
            $stmt->bindParam(':teamName', $teamName);
            $stmt->bindParam(':oldbowlerUBAID', $oldbowlerUBAID);
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

            $sql = "UPDATE `currentroster` 
                    SET `bowlerid` = :bowlerUBAID,
                        `team` = :teamName
                    WHERE `bowlerid` = :oldbowlerUBAID";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
            $stmt->bindParam(':teamName', $teamName);
            $stmt->bindParam(':oldbowlerUBAID', $oldbowlerUBAID);
            $stmt->execute();  

            $_SESSION['success'] = 'Bowler release request approved';
        } else {
            $president = 0;

            $sql = "DELETE FROM `bowlersreleased` WHERE `bowlerid`='$oldbowlerUBAID'";
            $db->exec($sql);

            $_SESSION['success'] = 'Bowler successfully cleared from list.';
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