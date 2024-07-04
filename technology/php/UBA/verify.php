<?php
include_once 'baseurl.php';
    session_start();
    include_once 'connect.php';
    

    function getRealIpAddr()
    {
        if (!empty($_SERVER['HTTP_CLIENT_IP']))   //check ip from share internet
        {
        $ip=$_SERVER['HTTP_CLIENT_IP'];
        }
        elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR']))   //to check ip is pass from proxy
        {
        $ip=$_SERVER['HTTP_X_FORWARDED_FOR'];
        }
        else
        {
        $ip=$_SERVER['REMOTE_ADDR'];
        }
        return $ip;
    }

    if (isset($_POST['signin'])){
        $email = $_POST['uemail'];
        $password = $_POST['upassword'];
        $type = $_POST['utype'];


        try {
            $database = new Connection();
            $db = $database->openConnection();

            if ($type == 'staff') {
                $sql = $db->prepare("SELECT * FROM `users` WHERE `email` = '$email'");
                $sql->execute();
                $dataFetched = $sql->fetch(PDO::FETCH_ASSOC);
            } else {
                $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `uemail` = '$email'");
                $sql->execute();
                $dataFetched = $sql->fetch(PDO::FETCH_ASSOC);
            }

            if($dataFetched) {
                
                if ($type == 'staff') {
                    $hash = $dataFetched['password'];
                    $userrole = $dataFetched['userrole'];
                } else {
                    $hash = $dataFetched['upassword'];

                    if ($dataFetched['officeheld'] == 'Secretary') {
                        $userrole = 'secretary';
                    } else if ($dataFetched['officeheld'] == 'Vice President') {
                        $userrole = 'vicepresident';
                    } else if ($dataFetched['officeheld'] == 'Captain') {
                        $userrole = 'captain';
                    } else if ($dataFetched['officeheld'] == 'Treasurer') {
                        $userrole = 'treasurer';
                    } else {
                        $userrole = 'bowler';
                    }

                    if ($dataFetched['president'] == 1) {
                        $userrole = 'president';
                    } else if ($dataFetched['owner'] == 1) {
                        $userrole = 'owner';
                    }
                    

                    $_SESSION['team'] = $dataFetched['team'];
                }
                

                if (password_verify($password, $hash)) {

                    $userIP = getRealIpAddr();

                    $statement = $db->prepare("INSERT INTO bowlerlogins (email, userIP)
                    VALUES(:email, :userIP)");
                    $statement->execute(array(
                        "email" => "$email",
                        "userIP" => "$userIP"
                    ));
                    
                    $_SESSION['login_user'] = $dataFetched['name'];
                    $_SESSION['useremail'] = $email;
                    $_SESSION['userrole'] = $userrole;

                    if ($type == 'bowler') {
                        if ($dataFetched['verified'] == 0) {
                            $_SESSION['error'] = 'Please Verify Your Account';
                            header("Location: ".$base_url."/index.php");
                        }
                    }

                    if ($type == 'staff') {
                        header("Location: ".$base_url."/dashboard/home.php");
                    } else {
                        header("Location: ".$base_url."/dashboard/home.php");
                    }

                } else {
                    $_SESSION['error'] = 'Password is incorrect';
                    header("Location: ".$base_url."/index.php");
                }

            } else {
                $_SESSION['error'] = 'No User Found';
                header("Location: ".$base_url."/index.php");
            }
            
        } catch (PDOException $e) {
            echo "There was some problem with the connection: " . $e->getMessage();
        }


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