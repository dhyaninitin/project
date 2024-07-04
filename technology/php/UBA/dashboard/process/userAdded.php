<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';

    if($_SESSION['userrole'] != 'admin'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    $userName = $_POST['username'];
    $userEmail = $_POST['useremail'];
    $userRole = $_POST['userrole'];
    $finance = $_POST['finance'];
    $newpassword = $_POST['newpassword'];
    $newpasswordcheck = $_POST['newpasswordcheck'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        if($newpassword === $newpasswordcheck) {

            $hash = password_hash($newpassword, PASSWORD_DEFAULT);

            $statement = $db->prepare("INSERT INTO users (`email`, `name`, `password`, `userrole`, `finance`)
                VALUES(:userEmail, :userName, :userPassword, :userRole, :finance)");
                
                $statement->execute(array(
                    "userEmail" => $userEmail,
                    "userName" => $userName,
                    "userPassword" => $hash,
                    "userRole" => $userRole,
                    "finance" => $finance
                ));      

                $_SESSION['success'] = 'User Added';
                header("Location: ".$base_url."/dashboard/users.php");

        } else {
                $_SESSION['error'] = 'Passwords do not match';
                header("Location: ".$base_url."/dashboard/users.php");
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