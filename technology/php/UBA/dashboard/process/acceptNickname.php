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

    try {
        $database = new Connection();
        $db = $database->openConnection();

        if ($status == 'y') {
            $president = 0;

            $sql = $db->prepare("SELECT * FROM `bowlerupdates` WHERE `id` = :tableID");
            $sql->execute([':tableID' => $tableID]);
            $transferDeets = $sql->fetch();
            $newNickname = $transferDeets['nickname1'];

            $sql = "UPDATE bowlers 
                    SET `nickname1` = :newNickname,
                    WHERE bowlerid = :bowlerUBAID";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':newNickname', $newNickname);
            $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
            $stmt->execute(); 
            
            $president = 1;
            $sql = "UPDATE bowlerupdates 
                    SET `approvedNickname` = :president
                    WHERE `id` = :tableID";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':president', $president);
            $stmt->bindParam(':tableID', $tableID);
            $stmt->execute(); 

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

            $_SESSION['success'] = 'Bowler Nickname Request Approved';
        } else {
        
            $sql = "DELETE FROM `bowlerupdates` WHERE `id`='$tableID'";
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