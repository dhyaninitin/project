<?php
    
    session_start();
    include_once 'connect.php';

    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;

    require 'PHPMailer/src/Exception.php';
    require 'PHPMailer/src/PHPMailer.php';
    require 'PHPMailer/src/SMTP.php';

    if(isset($_SESSION['error'])){
        $error = $_SESSION['error'];
    }

    $bowlerUBAID = $_SESSION['bowlerID'];

    $bowlerFullName = $_POST['bowlerFullName'];
    // $nickname1 = $_POST['nickname1'];
    $baddress = $_POST['address'];
    $bcity = $_POST['city'];
    $bstate = $_POST['state'];
    $bzipcode = $_POST['zipcode'];
    $bphone = $_POST['phone'];
    $birthday = $_POST['birthday'];
    $bss = $_POST['ss'];
    $uemail = $_POST['uemail'];
    $uemailConfirm = $_POST['uemailConfirm'];
    $upassword = $_POST['upassword'];
    $upasswordConfirm = $_POST['upasswordConfirm'];
    $agreeToTerms = $_POST['agreeToTerms'];

    $_SESSION['bowlerFullName'] = $bowlerFullName;
    // $_SESSION['nickname1'] = $nickname1;
    $_SESSION['address'] = $baddress;
    $_SESSION['city'] = $bcity;
    $_SESSION['state'] = $bstate;
    $_SESSION['zipcode'] = $bzipcode;
    $_SESSION['phone'] = $bphone;
    $_SESSION['birthday'] = $birthday;
    $_SESSION['uemail'] = $uemail;

    if ($uemail !== $uemailConfirm) {
        $_SESSION['error'] = 'Emails do not match';
        header("Location: /registration.php");
    }

    if ($upassword !== $upasswordConfirm) {
        $_SESSION['error'] = 'Passwords do not match';
        header("Location: /registration.php");
    }

    if ($agreeToTerms == '') {
        $_SESSION['error'] = 'Please Agree to Terms';
        header("Location: /registration.php");
    }

    $hash = password_hash($upassword, PASSWORD_DEFAULT);
    $verified = 0;

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `uemail` = '$uemail'");
        $sql->execute();
        $dataFetched = $sql->fetch(PDO::FETCH_ASSOC);

        if ($dataFetched) {
            $_SESSION['error'] = 'Another account has already been created using this Email ID';
            header("Location: /registration.php");
        }

        // $teamName = $dataFetched['team'];

        $sql = "UPDATE bowlers 
                SET `name` = :bowlerFullName,
                `address` = :baddress,
                `city` = :bcity,
                `state` = :bstate,
                `zipcode` = :bzipcode,
                `phone` = :bphone,
                `birthday` = :birthday,
                `ss` = :bss,
                `uemail` = :uemail,
                `upassword` = :upassword,
                `verified` = :verified
                WHERE bowlerid = :bowlerUBAID";

        $stmt = $db->prepare($sql);                                  

        $stmt->bindParam(':bowlerFullName', $bowlerFullName);
        $stmt->bindParam(':baddress', $baddress);
        $stmt->bindParam(':bcity', $bcity);
        $stmt->bindParam(':bstate', $bstate);
        $stmt->bindParam(':bzipcode', $bzipcode);
        $stmt->bindParam(':bphone', $bphone);
        $stmt->bindParam(':birthday', $birthday);
        $stmt->bindParam(':bss', $bss);
        $stmt->bindParam(':uemail', $uemail);
        $stmt->bindParam(':upassword', $hash);
        $stmt->bindParam(':verified', $verified);
        $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);

        $stmt->execute();     

        // Insert verification code

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

        $mail->addAddress($uemail);
        
        $mail->isHTML(true);
        $mail->Subject = "Verify your UBA account";
        $mail->Body = '<h2 style="color:#000;">Hi, '.$bowlerFullName.'</h2>
                    <p>Please verify your account by clicking on the verification click below</p>
                    <br> 
                    <a href="https://ubaaverages.com/emailVerify.php?verify='.$verificationcode.'">Verify Account</a>
                    ';

        if ($mail->send()) {
            // show a message of success and provide a true success variable
            $data['success'] = true;
            $data['message'] = 'Thank you for Subscribing!';
            header("Location: /emailVerify.php?id=y");
            // header('Location: ../thankyou.php?user='.$username);
            echo json_encode($data);
        } else {
            $data['success'] = false;
            $data['errors']  = 'Could not subscribe. Please try again';
            echo json_encode($data);
        }
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }
    
?>
