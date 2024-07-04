<?php
    
    session_start();

    if(isset($_SESSION['error'])){
        $error = $_SESSION['error'];
    }
?>

    <!DOCTYPE html>
    <html>

    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Login | UBA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">
        <link rel="stylesheet" type="text/css" media="screen" href="css/bootstrap.min.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="css/animate.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="css/style.css" />

        <link rel="icon" href="images/favicon.ico" type="image/x-icon" />

    </head>

    
<body>
<div class="container">
    <div class="row">
        <div class="col-sm-12">

        <div class="register">
          <a href="register.php">Register</a>
        </div>
            
            <div class="login-page">

              <img src="images/UBA_logo.png">
    <hr>
              <!-- <h4 style="color:red; text-align: center;"><b>Attention:</b> All Bowlers are requested to use the 'Reset Password' button and reset their password</h4>
              <hr> -->
              <div class="form">
                    <p class="error"><?php echo $error; ?> </p>
                    <h4>Member Sign In:</h4>
                    
                    <form action="verify.php" method="POST">
                        <div class="row">
                            <div class=" col-12">
                                <div class="form-group select">
                                    <select name="utype" id="utype">
                                        <option value="bowler" selected> Bowler</option>
                                        <option value="staff">Staff</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="uemail" id="email-label">
                                    <input type="email" name="uemail" id="uemail" required placeholder="Your Email ID">
                                    </label>
                                </div>
                                
                                <div class="form-group">
                                    <label for="upassword" id="pass-label">
                                    <input type="password" name="upassword" id="upassword" required placeholder="Your Password">
                                    </label>
                                </div>

                                <div class="form-group">
                                    <input type="submit" name="signin" value="Sign In" class="submitBtn">
                                </div>
                            </div>
                        </div>
                    </form>
                    <p><a href="resetPassword.php">Reset Password</a></p>
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