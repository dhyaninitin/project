<?php
    
    session_start();
    include_once 'connect.php';

    if(isset($_SESSION['error'])){
        $error = $_SESSION['error'];
    }

    if(isset($_SESSION['success'])){
        $error = $_SESSION['success'];
    }

    if (isset($_GET['reset'])) {
        $verificationcode = $_GET['reset'];

        try {
            $database = new Connection();
            $db = $database->openConnection();
    
            $sql = $db->prepare("SELECT * FROM `resentPassword` WHERE `verificationcode` = '$verificationcode'");
            $sql->execute();
            $verifyBowler = $sql->fetch();

            
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
        <title>Reset Password | UBA</title>
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
          <a href="index.php">Login</a>
        </div>
            
            <div class="login-page verifiPage">

              <img src="images/UBA_logo.png">

              <div class="form">
                    
              <p><?php echo $error; ?> </p>

                <?php
                    if (!isset($_GET['change'])) {
                        if (!isset($_GET['reset'])) {
                ?>
                    <?php
                        if (isset($_GET['resetted'])) {
                            echo '<p>A password reset link has been sent to your registered email address.</p>';
                        }
                    ?>
                    <form action="resendPassword.php" METHOD="POST">
                        
                        <div class="form-group">
                            <input type="email" required name="uemail" id="uemail" placeholder="Registered Email Address">
                        </div>

                        <div class="form-group">
                            <input type="submit" value="Reset Password">
                        </div>
                        
                        
                    </form>
                    
                <?php 
                    } else {
                ?>
                    <form action="passwordChanged.php" METHOD="POST">
                        <input type="text" name="verificationcode" hidden required value="<?php echo $verificationcode;?>">
                        <div class="form-group">
                            <input type="password" id="upassword" name="upassword" required placeholder="Your Password"
                            minlength="8" title="Eight or more characters" pattern="(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$"
                            >
                        </div>

                        <div class="form-group">
                            <input type="password" id="upasswordConfirm" name="upasswordConfirm" required placeholder="Confirm Your Password"
                            minlength="8" title="Eight or more characters" pattern="(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$"
                            >
                        </div>
                        <input type="submit" value="Reset Password">
                    </form>
                <?php
                    } 
                } else {
                ?>
                    <p>Your Password has been changed.</p>
                    <a href="index.php">Login Here</a>
                <?php
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
            unset($_SESSION['success']);
        ?>

    </body>

    </html>