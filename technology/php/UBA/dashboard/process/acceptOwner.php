<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';

    if($_SESSION['userrole'] != 'admin'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    $status = $_GET['id'];
    $bowlerUBAID = $_GET['bowler'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        if ($status == 'y') {
            $president = 1;

            $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `bowlerid` = :bowlerUBAID");
            $sql->execute([':bowlerUBAID' => $bowlerUBAID]);
            $bowlerDeets = $sql->fetch();

            $bowlername = $bowlerDeets['name'];
            $teamname = $bowlerDeets['team'];

            $sql = $db->prepare("SELECT * FROM `teams` WHERE `teamname` = :teamname");
            $sql->execute([':teamname' => $teamname]);
            $teamDeets = $sql->fetch();

            if ($teamDeets != '' || $teamDeets != '-') {
                $oldOwner = $teamDeets['owner'];
            }

            $old = 0;

            $sql = "UPDATE bowlers 
                SET `owner` = :old
                WHERE bowlerid = :oldOwner";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':old', $old);
            $stmt->bindParam(':oldOwner', $oldOwner);
            $stmt->execute(); 





            $sql = "UPDATE bowlers 
                SET `owner` = :president
                WHERE bowlerid = :bowlerUBAID";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':president', $president);
            $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
            $stmt->execute(); 
            
            // $sql = "UPDATE `ownership` 
            //         SET `approved` = :president
            //         WHERE bowlerid = :bowlerUBAID";

            // $stmt = $db->prepare($sql);                                  
            // $stmt->bindParam(':president', $president);
            // $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
            // $stmt->execute(); 
            
            $sql = "UPDATE teams 
                    SET `owner` = :bowlername
                    WHERE `teamname` = :teamname";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':bowlername', $bowlername);
            $stmt->bindParam(':teamname', $teamname);
            $stmt->execute(); 

            $sql = "DELETE FROM `ownership` WHERE `bowlerid`='$bowlerUBAID'";
            $db->exec($sql);

            $_SESSION['success'] = 'Ownership Request Approved';
        } else {
            $president = 0;

            $sql = "DELETE FROM `ownership` WHERE `bowlerid`='$bowlerUBAID'";
            $db->exec($sql);

            $_SESSION['success'] = 'Ownership Request Denied';
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