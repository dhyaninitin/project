<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    $email = $_SESSION['useremail'];

    $oldEmail = $_POST['curemail'];
    $newEmail = $_POST['newemail'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $verified = 0;

        if ($_SESSION['userrole'] == 'admin' || $_SESSION['userrole'] == 'staff') {
            $sql = "UPDATE users 
            SET `email` = :newEmail
            WHERE `email` = :email";

            $stmt = $db->prepare($sql);                                  

            $stmt->bindParam(':newEmail', $newEmail);
            $stmt->bindParam(':email', $oldEmail);
        } 
        
        if ($_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'president') {
            $sql = "UPDATE bowlers 
            SET `uemail` = :newEmail,
            `verified` = :verified,
            WHERE `uemail` = :email";

            $stmt = $db->prepare($sql);                                  

            $stmt->bindParam(':newEmail', $newEmail);
            $stmt->bindParam(':verified', $verified);
            $stmt->bindParam(':email', $oldEmail);
        }

        $stmt->execute(); 
        
        $_SESSION['success'] = 'Email ID changed';

        function random_code($limit) {
            return substr(base_convert(sha1(uniqid(mt_rand())), 16, 36), 0, $limit);
        }
        
        $verificationcode = random_code(25);

        $statement = $db->prepare("INSERT INTO emailverification (`bowlerid`,`verificationcode`,`verified`)
            VALUES(:bowlerid, :verificationcode, :verified)");
            
            $statement->execute(array(
                "bowlerid" => "$bowlerUBAID",
                "verificationcode" => "$verificationcode",
                "verified" => "$verified"
            ));

// $errors         = array();      // array to hold validation errors
// $data           = array();      // array to pass back data

        $mail = new PHPMailer;
        $mail->From = "info@ubaaverages.com"; //
        $mail->FromName = "UBA";

        $mail->addAddress($newEmail);
        
        $mail->isHTML(true);
        $mail->Subject = "Verify your UBA account";
        $mail->Body = '<h2 style="color:#000;">Hi, '.$bowlerFullName.'</h2>
                    <p>Please verify your account by clicking on the verification click below</p>
                    <br> 
                    <a href="https://ubaaverages.com/emailVerify.php?verify='.$verificationcode.'">Verify Account</a>
                    ';

        if ($mail->send()) {
            // show a message of success and provide a true success variable
            header("Location: ".$base_url."/dashboard/settings.php");
            // header('Location: ../thankyou.php?user='.$username);
        } else {
            echo json_encode($data);
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