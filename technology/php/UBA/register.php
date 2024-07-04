<?php
    
    session_start();
    include_once 'connect.php';

    if(isset($_SESSION['error'])){
        $error = $_SESSION['error'];
    }

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `teams` ORDER BY `teamname` ASC");
        $sql->execute();
        $teamDeets = $sql->fetchAll();
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }
?>

    <!DOCTYPE html>
    <html>

    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Register | UBA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">
        <link rel="stylesheet" type="text/css" media="screen" href="css/bootstrap.min.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="css/animate.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="css/style.css" />
        <link rel="icon" href="images/favicon.ico" type="image/x-icon" />

    </head>

    <body>

        <div class="container ">
    <div class="row">
        <div class="col-sm-12">

        <div class="register registerDeets">
            <a href="index.php">Login</a>
            <a href="emailVerify.php">Resend Verification</a>
        </div>
            
            <div class="login-page">

              <img src="images/UBA_logo.png">

              <div class="form">
                    
                    <h4>Member Registration:</h4>
                    <p><?php echo $error; ?> </p>
                    <form action="registration.php" method="POST">
                        <div class="row">
                            <div class=" col-12">
                                <div class="form-group">
                                    <select name="registerteam" id="registerteam">
                                        <option value="-" disabled selected>-</option>
                                        <?php
                                            foreach ($teamDeets as $team) {
                                        ?>
                                            <option value="<?php echo $team['teamname'];?>"><?php echo ucwords(strtolower($team['teamname']));?></option>
                                        <?php
                                            }
                                        ?>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <select name="registerbowler" id="registerbowler">
                                        <option value="-" disabled selected>Select Team First</option>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <input type="submit" name="register" value="Register" class="submitBtn">
                                </div>
                            </div>
                        </div>
                    </form>
                    
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