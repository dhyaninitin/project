<?php

include_once '../session.php';
include_once '../connect.php';

$title = 'Settings';

include 'inc/header.php';

if (isset($_SESSION['success'])) {
    $msg = '<div class="col-12"><p class="successMsg">'.$_SESSION['success'].'</p></div>';
} else if (isset($_SESSION['error'])) {
    $msg = '<div class="col-12"><p class="errorMsg">'.$_SESSION['error'].'</p></div>';
}

?>

<div class="passwordChange">
    <div class="container">
        <div class="row">

            <div class="col-12">
                <?php echo $msg; ?>
            </div>

            <div class="col-6">
                <h3>Change Password</h3>
                <form action="passwordChange.php" method="POST">
                    <div class="form-group">
                        <label for="oldpassword">Old Password:</label>
                        <input type="password" name="oldpassword" id="oldpassword" placeholder="..."
                            required>
                    </div>

                    <div class="form-group">
                        <label for="newpassword">New Password:</label>
                        <input type="password" name="newpassword" id="newpassword" placeholder="..."
                            required minlength="8" title="Eight or more characters" pattern="(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$">
                    </div>

                    <div class="form-group">
                        <label for="newpasswordcheck">Re-enter New Password:</label>
                        <input type="password" name="newpasswordcheck" id="newpasswordcheck" placeholder="..."
                            required minlength="8" title="Eight or more characters" pattern="(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$">
                    </div>

                    <div class="form-group">
                        <input type="submit" value="Change Password">
                    </div>
                </form>
            </div>

            <!-- <div class="col-6">
                <h3>Change Email</h3>
                <form action="emailChange.php" method="POST">
                    <div class="form-group">
                        <label for="curemail">Current Email:</label>
                        <input type="email" name="curemail" id="curemail" placeholder="..." value="<?php echo $_SESSION['useremail'];?>"
                            required readonly>
                    </div>

                    <div class="form-group">
                        <label for="newemail">New Email:</label>
                        <input type="email" name="newemail" id="newemail" required>
                    </div>

                    <div class="form-group">
                        <input type="submit" value="Change Email">
                    </div>
                </form>
            </div> -->
        </div>
    </div>
</div>

<?php

unset($_SESSION['success']);
unset($_SESSION['error']);

include 'inc/footer.php';

?>

