<?php
    
    session_start();
    include_once 'connect.php';

    if(isset($_SESSION['error'])){
        $error = $_SESSION['error'];
    }

    if (isset($_GET['verify'])) {
        $verificationcode = $_GET['verify'];
        try {
            $database = new Connection();
            $db = $database->openConnection();
    
            $sql = $db->prepare("SELECT * FROM `emailverification` WHERE `verificationcode` = '$verificationcode'");
            $sql->execute();
            $verifyBowler = $sql->fetch();
    
            $bowlerUBAID = $verifyBowler['bowlerid'];
            $bowlerVerificationCode = $verifyBowler['verificationcode'];
    
            if ($bowlerVerificationCode === $verificationcode) {
                $msg = '<p>Your account is successfully verified</p>';
    
                $verified = 1;
    
                $sql = "UPDATE bowlers 
                        SET `verified` = :verified
                        WHERE bowlerid = :bowlerUBAID";
                $stmt = $db->prepare($sql);                                  
    
                $stmt->bindParam(':verified', $verified);
                $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
                $stmt->execute();  
    
                $sql = "UPDATE emailverification 
                        SET `verified` = :verified
                        WHERE bowlerid = :bowlerUBAID";
                $stmt = $db->prepare($sql);                                  
    
                $stmt->bindParam(':verified', $verified);
                $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
                $stmt->execute();  
            } else {
                $msg = '<p>Something went wrong</p>';
            }
            
        } catch (PDOException $e) {
            echo "There was some problem with the connection: " . $e->getMessage();
        }
    }

?>

    <!DOCTYPE html>
    <html>

    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Verify Email | UBA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">
        <link rel="stylesheet" type="text/css" media="screen" href="css/bootstrap.min.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="css/animate.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="css/style.css" />
        <link rel="icon" href="images/favicon.ico" type="image/x-icon" />

    </head>

    <body>

        <div class="container signin">
    <div class="row">
        <div class="col-sm-12">

        <div class="register registerDeets">
          <a href="register.php">Register</a>
          <a href="index.php">Login Here</a>
        </div>
            
            <div class="login-page verifiPage">

              <img src="images/UBA_logo.png">

              <div class="form">
                    
              <p><?php echo $error; ?> </p>

                <?php
                    if (!isset($_GET['verify'])) {
                ?>
                    <p>You account has been created and a verification email has been sent to your email address.</p>
                    <p>Click on the verification link in the email to activate your account.</p>
                    <form action="resendVerify.php" METHOD="POST">
                        <input type="email" required name="uemail" id="uemail" placeholder="Email ID used to create the account">
                        <input type="submit" value="Resend Verification Link">
                    </form>
                    
                <?php 
                    } else {
                        echo $msg;
                    }
                ?>      

              </div>

            </div>

        </div>
    </div>
</div>

        <script src="js/jquery.js"></script>
        <script src="js/popper.js"></script>                             
        <script src="js/bootstrap.js"></script>

        <?php
            unset($_SESSION['error']);
        ?>

    </body>

    </html>