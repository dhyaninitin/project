<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    $userID = $_POST['userID'];
    $newpassword = $_POST['newpassword'];
    $newpasswordcheck = $_POST['newpasswordcheck'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `users` WHERE `id` = '$userID'");
        $sql->execute();
        $dataFetched = $sql->fetch(PDO::FETCH_ASSOC);

        $hash = $dataFetched['password'];

        if($newpassword === $newpasswordcheck) {

            $hash = password_hash($newpassword, PASSWORD_DEFAULT);

            $sql = "UPDATE users 
                    SET `password` = :newpassword
                    WHERE id = :userID";

            $stmt = $db->prepare($sql);                                  

            $stmt->bindParam(':newpassword', $hash);
            $stmt->bindParam(':userID', $userID);

            $stmt->execute();            

            $_SESSION['success'] = 'User Password Updated';

            header("Location: ".$base_url."/dashboard/editUser.php?id=".$userID);

        } else {

            $_SESSION['error'] = 'Passwords do not match';
            header("Location: ".$base_url."/dashboard/editUser.php?id=".$userID);

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