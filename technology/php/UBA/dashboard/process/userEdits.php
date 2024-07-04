<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';

    if($_SESSION['userrole'] != 'admin'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    $userID = $_POST['userID'];
    $userName = $_POST['username'];
    $userEmail = $_POST['useremail'];
    $userRole = $_POST['userrole'];
    $finance = $_POST['finance'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `users` WHERE `id` = '$userID'");
        $sql->execute();
        $dataFetched = $sql->fetch(PDO::FETCH_ASSOC);

        $sql = "UPDATE users 
                SET `name` = :userName,
                `email` = :userEmail,
                `userrole` = :userRole,
                `finance` = :finance
                WHERE id = :userID";

        $stmt = $db->prepare($sql);                                  

        $stmt->bindParam(':userName', $userName);
        $stmt->bindParam(':userEmail', $userEmail);
        $stmt->bindParam(':userRole', $userRole);
        $stmt->bindParam(':finance', $finance);
        $stmt->bindParam(':userID', $userID);

        $stmt->execute();        

        $_SESSION['success'] = 'User Details changed';

        header("Location: ".$base_url."/dashboard/editUser.php?id=".$userID);
        
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