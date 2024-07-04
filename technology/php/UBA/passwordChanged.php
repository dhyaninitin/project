<?php

    // include_once '../session.php';
    include_once 'connect.php';

    $newpassword = $_POST['upassword'];
    $newpasswordcheck = $_POST['upasswordConfirm'];
    $verificationcode = $_POST['verificationcode'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `resentPassword` WHERE `verificationcode` = '$verificationcode'");
        $sql->execute();
        $dataFetched = $sql->fetch(PDO::FETCH_ASSOC);
        $bowlerUBAID = $dataFetched['bowlerid'];

        if($newpassword === $newpasswordcheck) {

            $hash = password_hash($newpassword, PASSWORD_DEFAULT);

            $verified = 1;

            $sql = "UPDATE bowlers 
                    SET `upassword` = :newpassword,
                    `verified` = :verified
                    WHERE bowlerid = :bowlerUBAID";

            $stmt = $db->prepare($sql);                                  

            $stmt->bindParam(':newpassword', $hash);
            $stmt->bindParam(':verified', $verified);
            $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);

            $stmt->execute();            

            $_SESSION['success'] = 'User Password Updated';

            header("Location: /resetPassword.php?change=y");

        } else {

            $_SESSION['error'] = 'Passwords do not match';
            header("Location: /resetPassword.php");

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