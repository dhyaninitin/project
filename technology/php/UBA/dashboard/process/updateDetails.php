<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';

    $useremail = $_SESSION['useremail'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `uemail` = '$useremail'");
        $sql->execute();
        $dataFetched = $sql->fetch();
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    $oldnickname = $dataFetched['nickname1'];

    $bowlerName = $_POST['bowlerName'];
    $nickname1 = $_POST['nickname1'];
    $baddress = $_POST['address'];
    $city = $_POST['city'];
    $bstate = $_POST['state'];
    $zipcode = $_POST['zipcode'];
    $phone = $_POST['phone'];
    $birthday = $_POST['birthday'];
    $ss = $_POST['ss'];

    // echo $baddress;
    // echo '<br>';
    // echo $bstate;
    // echo '<br>';
    // echo $zipcode;
    // echo '<br>';
    // exit();

    $nicknameChanged;

    if ($oldnickname == $nickname1) {
        $nicknameChanged = 0;
    } else {
        $nicknameChanged = 1;
    }

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `uemail` = '$useremail'");
        $sql->execute();
        $dataFetched = $sql->fetch(PDO::FETCH_ASSOC);

        $bowlerUBAID = $dataFetched['bowlerid'];

        if ($_SESSION['userrole'] != 'admin' || $_SESSION['userrole'] != 'president' || $_SESSION['userrole'] != 'owner') {

            $statement = $db->prepare("INSERT INTO bowlerupdates (`bowlerid`, `name`, `nickname1`, `address`, `city`, `state`, `zipcode`, `phone`, `birthday`, `ss`, `nicknameChanged`, `oldnickname`)
            VALUES(:bowlerUBAID, :bowlerName, :nickname1, :baddress, :city, :bstate, :zipcode, :phone, :birthday, :ss, :nicknameChanged, :oldnickname)");
                
            $statement->execute(array(
                "bowlerUBAID" => $bowlerUBAID,
                "bowlerName" => $bowlerName,
                "nickname1" => $nickname1,
                "baddress" => $baddress,
                "city" => $city,
                "bstate" => $bstate,
                "zipcode" => $zipcode,
                "phone" => $phone,
                "birthday" => $birthday,
                "ss" => $ss,
                "nicknameChanged" => $nicknameChanged,
                "oldnickname" => $oldnickname,
            ));
        } else {
            $sql = "UPDATE bowlers 
                    SET `name` = :bowlerName,
                    `nickname1` = :nickname1,
                    `address` = :baddress,
                    `city` = :city,
                    `state` = :bstate,
                    `zipcode` = :zipcode,
                    `phone` = :phone,
                    `birthday` = :birthday,
                    `ss` = :ss
                    WHERE uemail = :useremail";

            $stmt = $db->prepare($sql);                                  

            $stmt->bindParam(':bowlerName', $bowlerName);
            $stmt->bindParam(':nickname1', $nickname1);
            $stmt->bindParam(':baddress', $baddress);
            $stmt->bindParam(':bstate', $bstate);
            $stmt->bindParam(':city', $city);
            $stmt->bindParam(':zipcode', $zipcode);
            $stmt->bindParam(':phone', $phone);
            $stmt->bindParam(':birthday', $birthday);
            $stmt->bindParam(':ss', $ss);
            $stmt->bindParam(':useremail', $useremail);

            $stmt->execute();    

            $sql = "UPDATE bowlerdata 
                    SET `name` = :bowlerName
                    WHERE bowlerid = :bowlerUBAID";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':bowlerName', $bowlerName);
            $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
            $stmt->execute();    

            $sql = "UPDATE bowlerdataseason 
                    SET `name` = :bowlerName
                    WHERE bowlerid = :bowlerUBAID";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':bowlerName', $bowlerName);
            $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
            $stmt->execute();    
        }

        if ($_SESSION['userrole'] == 'bowler'  || $_SESSION['userrole'] == 'owner'  || $_SESSION['userrole'] == 'secretary' || $_SESSION['userrole'] == 'vicepresident' || $_SESSION['userrole'] == 'captain' || $_SESSION['userrole'] == 'treasurer') {
            $_SESSION['success'] = 'Details updated & sent for approval to the President / Owner';
        } else {
            $_SESSION['success'] = 'Details updated.';
        }

         
        
        // $sql = "UPDATE teams 
        //         SET `officeheld` = :officeHeld
        //         WHERE teamname = :teamName";

        header("Location: ".$base_url."/dashboard/details.php");
        
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