<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] != 'admin'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    $userID = $_GET['id'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `users` WHERE `id` = '$userID'");
        $sql->execute();
        $dataFetched = $sql->fetch();
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    $title = 'Edit User';

    include 'inc/header.php';

    if (isset($_SESSION['success'])) {
        $msg = '<div class="col-12"><p class="successMsg">'.$_SESSION['success'].'</p></div>';
    } else if (isset($_SESSION['error'])) {
        $msg = '<div class="col-12"><p class="errorMsg">'.$_SESSION['error'].'</p></div>';
    } else {
        $msg = '';
    }


?>

    <div class="users">
        <?php echo $msg; ?>
        
        <div class="container">
            <div class="row">
                <div class="col-6">
                    <h4>Edit User</h4>
                    <form action="process/userEdits.php" method="post">
                        <input type="hidden" name="userID" id="userID" value="<?php echo $userID;?>">
                        <div class="form-group">
                            <label for="username">User's Name</label>
                            <input type="text" name ="username" id="username" value="<?php echo $dataFetched['name']; ?>" required placeholder="Enter User's Name">
                        </div>

                        <div class="form-group">
                            <label for="useremail">User's Email</label>
                            <input type="email" name ="useremail" id="useremail" value="<?php echo $dataFetched['email']; ?>" required placeholder="Enter User's Email">
                        </div>

                        <div class="form-group">
                            <label for="userrole">User Role</label>
                            <select name="userrole" id="userrole">
                                <?php
                                    if ($dataFetched['userrole'] == 'admin') {
                                ?>
                                    <option value="admin" selected>Admin</option>
                                    <option value="staff">Staff</option>
                                <?php
                                    } else {
                                ?>
                                    <option value="admin">Admin</option>
                                    <option value="staff" selected>Staff</option>
                                <?php
                                    }
                                ?>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="finance">Finance Department</label>
                            <select name="finance" id="finance">
                                <?php
                                    if ($dataFetched['finance'] == 1) {
                                ?>
                                    <option value="1" selected>Yes</option>
                                    <option value="0">No</option>
                                <?php
                                    } else {
                                ?>
                                    <option value="1">Yes</option>
                                    <option value="0" selected>No</option>
                                <?php
                                    }
                                ?>
                            </select>
                        </div>

                        <div class="form-group">
                            <input type="submit" value="Update User Details">
                        </div>

                    </form>
                </div>
                <div class="col-6">
                    <h4>Edit User Password</h4>
                    <form action="userPasswordChange.php" method="POST">

                        <input type="hidden" name="userID" id="userID" value="<?php echo $userID;?>">
            
                        <div class="form-group">
                            <label for="newpassword">New Password:</label>
                            <input type="password" name="newpassword" id="newpassword" placeholder="Enter your new password"
                                required minlength="8" title="Eight or more characters" pattern="(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$">
                        </div>

                        <div class="form-group">
                            <label for="newpasswordcheck">Re-enter New Password:</label>
                            <input type="password" name="newpasswordcheck" id="newpasswordcheck" placeholder="Re-enter your new password"
                                required minlength="8" title="Eight or more characters" pattern="(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$">
                        </div>

                        <div class="form-group">
                            <input type="submit" value="Change User Password">
                        </div>
                    </form>
                </div>

                <div class="col-12">
                    <hr>
                    <a href="process/deleteUser.php?id=<?php echo $userID;?>" class="deleteUser"><i class="fas fa-times"></i> Delete User</a>
                </div>
            </div>
        </div>
    </div>

<?php

unset($_SESSION['success']);
unset($_SESSION['error']);
include 'inc/footer.php';

?>
