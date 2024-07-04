<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    $email = $_SESSION['useremail'];

    $oldpassword = $_POST['oldpassword'];
    $newpassword = $_POST['newpassword'];
    $newpasswordcheck = $_POST['newpasswordcheck'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        if ($_SESSION['userrole'] == 'admin' || $_SESSION['userrole'] == 'staff') {
            $sql = $db->prepare("SELECT * FROM `users` WHERE `email` = '$email'");
            $sql->execute();
            $dataFetched = $sql->fetch(PDO::FETCH_ASSOC);

            $hash = $dataFetched['password'];
        } else {
            $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `uemail` = '$email'");
            $sql->execute();
            $dataFetched = $sql->fetch(PDO::FETCH_ASSOC);

            $hash = $dataFetched['upassword'];
        }

        if (password_verify($oldpassword, $hash)) {

            if($newpassword === $newpasswordcheck) {

                $hash = password_hash($newpassword, PASSWORD_DEFAULT);

                if ($_SESSION['userrole'] == 'admin' || $_SESSION['userrole'] == 'staff') {
                    $sql = "UPDATE users 
                    SET `password` = :newpassword
                    WHERE email = :email";
                } else {
                    $sql = "UPDATE bowlers 
                    SET `upassword` = :newpassword
                    WHERE uemail = :email";
                }

                $stmt = $db->prepare($sql);                                  

                $stmt->bindParam(':newpassword', $hash);
                $stmt->bindParam(':email', $email);

                $stmt->execute(); 
                
                $_SESSION['user'] = $dataFetched['name'];
                $_SESSION['useremail'] = $email;

                $_SESSION['success'] = 'Password changed';

                header("Location: ".$base_url."/dashboard/settings.php");

            } else {

                $_SESSION['error'] = 'Passwords do not match';
                header("Location: ".$base_url."/dashboard/settings.php");

            }

        } else {

            $_SESSION['error'] = 'Old password incorrect';
            header("Location: ".$base_url."/dashboard/settings.php");

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