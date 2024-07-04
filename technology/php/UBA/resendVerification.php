<?php

    include_once '../session.php';
    include_once '../connect.php';

    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;

    require 'PHPMailer/src/Exception.php';
    require 'PHPMailer/src/PHPMailer.php';
    require 'PHPMailer/src/SMTP.php';

$bowlerID = $_GET['id'];

try {
    $database = new Connection();
    $db = $database->openConnection();

    $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `id` = '$bowlerID'");
    $sql->execute();
    $fetchBowler = $sql->fetch();

    $bowlerUBAID = $fetchBowler['bowlerid'];
    $bowlerFullName = $fetchBowler['name'];

    $sql = $db->prepare("SELECT * FROM `emailverification` WHERE `bowlerid` = '$bowlerUBAID'");
    $sql->execute();
    $bowlerVerify = $sql->fetch();

    $verificationcode = $bowlerVerify['verificationcode'];


    if ($bowlerVerify) {
        $mail = new PHPMailer;
        $mail->From = "info@ubaaverages.com"; //
        $mail->FromName = "UBA";

        $mail->addAddress($uemail);
        
        $mail->isHTML(true);
        $mail->Subject = "Verify your UBA account";
        $mail->Body = '<h2 style="color:#000;">Hi, '.$bowlerFullName.'</h2>
                    <p>Please verify your account by clicking on the verification click below</p>
                    <br> 
                    <a href="https://ubaaverages.com/emailVerify.php?verify='.$verificationcode.'">Verify Account</a>
                    ';

        if ($mail->send()) {
            // show a message of success and provide a true success variable\
            $_SESSION['success'] = 'Verifications Sent to the Bowler';
            header("Location: /dashboard/registrations.php");
            // header('Location: ../thankyou.php?user='.$username);
        } else {
            $_SESSION['error'] = 'There was a problem sending the email';
            header("Location: /dashboard/registrations.php");
        }  
    } else {
        $msg = '<p>Something went wrong</p>';
    }
    
} catch (PDOException $e) {
    echo "There was some problem with the connection: " . $e->getMessage();
}

?>]