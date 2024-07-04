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

    $title = 'Add User';

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
                <div class="col-12">
                    <h4>Add User</h4>
                    <form action="process/userAdded.php" method="post">
                        <div class="form-group">
                            <label for="username">User's Name</label>
                            <input type="text" name ="username" id="username" required placeholder="Enter User's Name">
                        </div>

                        <div class="form-group">
                            <label for="useremail">User's Email</label>
                            <input type="email" name ="useremail" id="useremail" required placeholder="Enter User's Email">
                        </div>

                        <div class="form-group">
                            <label for="userrole">User Role</label>
                            <select name="userrole" id="userrole" required>
                                <option value="-" selected disabled>-</option>
                                <option value="admin">Admin</option>
                                <option value="staff">Staff</option>
                                <option value="eventstaff">Event Staff</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="finance">Finance Department</label>
                            <select name="finance" id="finance" required>
                                <option value="1">Yes</option>
                                <option value="0" selected>No</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="newpassword">Password:</label>
                            <input type="password" name="newpassword" id="newpassword" placeholder="Enter your new password"
                                required minlength="8" title="Eight or more characters" pattern="(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$">
                        </div>

                        <div class="form-group">
                            <label for="newpasswordcheck">Re-enter Password:</label>
                            <input type="password" name="newpasswordcheck" id="newpasswordcheck" placeholder="Re-enter your new password"
                                required minlength="8" title="Eight or more characters" pattern="(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$">
                        </div>

                        <div class="form-group">
                            <input type="submit" value="Add User">
                        </div>

                    </form>
                </div>
            </div>
        </div>
    </div>

<?php

unset($_SESSION['success']);
unset($_SESSION['error']);
include 'inc/footer.php';

?>
