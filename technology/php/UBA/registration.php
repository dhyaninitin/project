<?php
    
    session_start();
    include_once 'connect.php';

    $registerteam = $_POST['registerteam'];
    $registerbowler = $_POST['registerbowler'];

    $registerbowler = preg_split("#/#", $registerbowler);
    $bowlername = $registerbowler[0];
    $bowlerUBAID = $registerbowler[1];

    $_SESSION['bowlerID'] = $bowlerUBAID;

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `bowlerid` = '$bowlerUBAID'");
        $sql->execute();
        $checkBowlerStatus = $sql->fetch();
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    if(isset($_SESSION['error'])){
        $error = $_SESSION['error'];
        $bowlername = $_SESSION['bowlerFullName'];
    }
?>

    <!DOCTYPE html>
    <html>

    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Registration | UBA</title>
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

        <div class="register">
          <a href="index.php">Login</a>
        </div>
            
            <div class="login-page">

              <img src="images/UBA_logo.png">

              <div class="form">
                    
                    <h4>Member Registration:</h4>
                    <p><?php echo $error; ?> </p>
                    
                    <?php
                        if ($checkBowlerStatus['verified'] == 0) {
                    ?>
                        <form action="completeregistration.php" method="POST">
                        <div class="row">
                            <div class=" col-12">

                                <div class="form-group">
                                    <input type="text" name="bowlerFullName" id="bowlerFullName" required placeholder="Your Full Name"
                                    value="<?php echo $bowlername;?>"
                                    >
                                </div>

                                <div class="form-group">
                                    <input type="text" name="bowlerTeam" id="bowlerTeam" required placeholder="Your Team"
                                    value="<?php echo $registerteam;?>" readonly
                                    >
                                </div>

                                <div class="form-group">
                                    <input type="text" name="address" id="address" required placeholder="Your Mailing Address"
                                    <?php
                                        if(isset($_SESSION['error'])){
                                            echo 'value="'.$_SESSION['address'].'"';
                                        }
                                    ?>
                                    >
                                </div>

                                <div class="form-group">
                                    <input type="text" name="city" id="city" required placeholder="City"
                                    <?php
                                        if(isset($_SESSION['error'])){
                                            echo 'value="'.$_SESSION['city'].'"';
                                        }
                                    ?>
                                    >
                                </div>

                                <div class="form-group">
                                    <input type="text" name="state" id="state" required placeholder="State"
                                    <?php
                                        if(isset($_SESSION['error'])){
                                            echo 'value="'.$_SESSION['state'].'"';
                                        }
                                    ?>
                                    >
                                </div>

                                <div class="form-group">
                                    <input type="number" name="zipcode" id="zipcode" required placeholder="Zip"
                                    <?php
                                        if(isset($_SESSION['error'])){
                                            echo 'value="'.$_SESSION['zipcode'].'"';
                                        }
                                    ?>
                                    >
                                </div>

                                <div class="form-group">
                                    <input type="number" name="phone" id="phone" required placeholder="Your Phone Number"
                                    <?php
                                        if(isset($_SESSION['error'])){
                                            echo 'value="'.$_SESSION['phone'].'"';
                                        }
                                    ?>
                                    >
                                </div>

                                <div class="form-group">
                                    <input type="text" id="birthday" name="birthday" required placeholder="Your Birthday (MM/DD/YYYY)"
                                    pattern="(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d" title="MM/DD/YYYY"
                                    <?php
                                        if(isset($_SESSION['error'])){
                                            echo 'value="'.$_SESSION['birthday'].'"';
                                        }
                                    ?>
                                    >
                                </div>

                                <div class="form-group">
                                    <input type="password" id="ss" name="ss" placeholder="Your SS Number (Financial Purposes ONLY)">
                                </div>

                                <div class="form-group">
                                    <input type="email" id="uemail" name="uemail" required placeholder="Your Email"
                                    <?php
                                        if(isset($_SESSION['error'])){
                                            echo 'value="'.$_SESSION['uemail'].'"';
                                        }
                                    ?>
                                    >
                                </div>

                                <div class="form-group">
                                    <input type="email" id="uemailConfirm" name="uemailConfirm" required placeholder="Confirm Your Email">
                                    <p id="ednm">Emails Do Not Match</p>
                                </div>

                                <div class="form-group">
                                    <label for="upassword">(8 characters. 1 Uppercase, 1 lowercase, 1 number and 1 special character required)</label>
                                    <input type="password" id="upassword" name="upassword" required placeholder="Your Password"
                                    minlength="8" title="Eight or more characters" pattern="(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$"
                                    >
                                </div>

                                <div class="form-group">
                                    <label for="upasswordConfirm">(8 characters. 1 Uppercase, 1 lowercase, 1 number and 1 special character required)</label>
                                    <input type="password" id="upasswordConfirm" name="upasswordConfirm" required placeholder="Confirm Your Password"
                                    minlength="8" title="Eight or more characters" pattern="(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$"
                                    >
                                </div>

                                <div class="form-group">
                                    <input type="checkbox" name="agreeToTerms" id="agreeToTerms" value="agreeToTerms" required/> I, Agree that the information provided is accurate and of my own. The Uba has my permission to email me updates. 
                                </div>

                                <div class="form-group">
                                    <input type="submit" name="register" value="Complete Registration" class="submitBtn">
                                </div>
                            </div>
                        </div>
                    </form>
                    <?php
                        } else {
                    ?>
                    <p>You have already registered.</p>
                    <a href="emailVerify.php" class="resendBtn">Resend Email Verification Link</a>

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
        <script src="js/app.js"></script>

        <?php
            unset($_SESSION['error']);
        ?>

    </body>

    </html>