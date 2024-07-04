<?php

    session_start();
    include_once 'connect.php';

    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;

    require 'PHPMailer/src/Exception.php';
    require 'PHPMailer/src/PHPMailer.php';
    require 'PHPMailer/src/SMTP.php';

    $uemail = $_POST['uemail'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `uemail` = '$uemail'");
        $sql->execute();
        $fetchBowler = $sql->fetch();

        $bowlerUBAID = $fetchBowler['bowlerid'];
        $bowlerFullName = $fetchBowler['name'];

        function random_code($limit) {
            return substr(base_convert(sha1(uniqid(mt_rand())), 16, 36), 0, $limit);
        }
        
        $verificationcode = random_code(25);

        $statement = $db->prepare("INSERT INTO resentPassword (`bowlerid`,`verificationcode`, `usertype`)
            VALUES(:bowlerid, :verificationcode,:usertype)");
            
            $statement->execute(array(
                "bowlerid" => "$bowlerUBAID",
                "usertype" => "$usertype",
                "verificationcode" => "$verificationcode"
            ));


            $mail = new PHPMailer;
            $mail->From = "info@ubaaverages.com"; //
            $mail->FromName = "UBA";

            $mail->addAddress($uemail);
            
            $mail->isHTML(true);
            $mail->Subject = "Change Password";
            $mail->Body = '<h2 style="color:#000;">Hi, '.$bowlerFullName.'</h2>
                        <p>Please reset your password using the link below</p>
                        <br> 
                        <a href="https://ubaaverages.com/resetPassword.php?reset='.$verificationcode.'">Reset Password</a>
                        ';

            if ($mail->send()) {
                // show a message of success and provide a true success variable
                $data['success'] = true;
                $data['message'] = 'Thank you for Subscribing!';
                header("Location: /resetPassword.php?resetted=y");
                // header('Location: ../thankyou.php?user='.$username);
                echo json_encode($data);
            } else {
                header("Location: /resetPassword.php");
                $data['success'] = false;
                $data['errors']  = 'Could not subscribe. Please try again';
                echo json_encode($data);
            }  
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }


?>