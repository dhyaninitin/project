<?php
include_once '../baseurl.php';
include_once '../session.php';
include_once '../connect.php';

$title = 'Personal Details';
include 'inc/header.php';

$useremail = $_SESSION['useremail'];

try {
    $database = new Connection();
    $db = $database->openConnection();

    $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `uemail` = '$useremail'");
    $sql->execute();
    $dataFetched = $sql->fetch();

    $bowlerDbID = $dataFetched['id'];
    
} catch (PDOException $e) {
    echo "There was some problem with the connection: " . $e->getMessage();
}

if (isset($_SESSION['success'])) {
    $msg = '<div class="col-12"><p class="successMsg">'.$_SESSION['success'].'</p></div>';
} else if (isset($_SESSION['error'])) {
    $msg = '<div class="col-12"><p class="errorMsg">'.$_SESSION['error'].'</p></div>';
}

// var_dump($dataFetched);

?>

<div class="passwordChange">
    <div class="container">
        <div class="row">
            
            <div class="col-12">
                <?php echo $msg; ?>
            </div>
        </div>
             
                
            <div class="col-12">
                <form action="process/updateDetails.php" method="post">
                <div class="row">
                    <div class="col-md-6 col-sm-6">
                        <div class="form-group">
                            <label for="bowlerName">Name</label>
                            <input type="text" name ="bowlerName" id="bowlerName" value="<?php echo $dataFetched['name']; ?>" required>
                        </div>
                    </div>
                    <div class="col-md-6 col-sm-6">
                         <div class="form-group">
                            <label for="nickname1">Nickname</label>
                            <input type="text" name ="nickname1" id="nickname1" value="<?php echo $dataFetched['nickname1']; ?>" required>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 col-sm-6">
                        <div class="form-group">
                            <label for="sanction">Sanction No.</label>
                            <input type="text" name ="sanction" id="sanction" required value="<?php echo $dataFetched['sanction']; ?>">
                        </div>                        
                    </div>
                    <div class="col-md-6 col-sm-6">
                        <div class="form-group">
                            <label for="address">Address</label>
                            <input type="text" name ="address" id="address" value="<?php echo $dataFetched['address']; ?>" required>
                        </div>
                    </div>                    
                </div>
                <div class="row">
                    <div class="col-md-6 col-sm-6">
                         <div class="form-group">
                            <label for="city">City</label>
                            <input type="text" name ="city" id="city" value="<?php echo $dataFetched['city']; ?>" required>
                        </div>
                    </div>
                    <div class="col-md-6 col-sm-6">                        
                        <div class="form-group">
                            <label for="state">State</label>
                            <input type="text" name ="state" id="state" value="<?php echo $dataFetched['state']; ?>" required>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 col-sm-6">
                        <div class="form-group">
                            <label for="zipcode">Zipcode</label>
                            <input type="number" name ="zipcode" id="zipcode" value="<?php echo $dataFetched['zipcode']; ?>" required>
                        </div>                        
                    </div>
                    <div class="col-md-6 col-sm-6">
                        <div class="form-group">
                            <label for="phone">Phone</label>
                            <input type="number" name ="phone" id="phone" value="<?php echo $dataFetched['phone']; ?>" required>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 col-sm-6">
                        <div class="form-group">
                            <label for="birthday">Birthday</label>
                            <input type="text" name ="birthday" id="birthday" value="<?php echo $dataFetched['birthday']; ?>" required
                            placeholder="Your Birthday (MM/DD/YYYY)"
                            pattern="(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d" title="MM/DD/YYYY"
                            >
                        </div>                        
                    </div>
                    <div class="col-md-6 col-sm-6">
                        <div class="form-group">
                            <label for="ss">SS#</label>
                            <input type="text" name ="ss" required id="ss" value="<?php echo $dataFetched['ss']; ?>">
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6 col-sm-6">
                        <div class="form-group">
                            <input type="submit" value="Update Details">
                        </div>
                    </div>
                    <div class="col-md-6 col-sm-6">
                        <a href="process/suspendBowler.php?id=<?php echo $bowlerDbID;?>" class="deleteUser"><i class="fas fa-times"></i> Release Yourself from Team</a>
                    </div>    
                </div> 
            </form>
                <hr>    
            </div>                
             


        
    </div>
</div>

<?php

unset($_SESSION['success']);
unset($_SESSION['error']);

include 'inc/footer.php';

?>

