<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] == 'admin' || $_SESSION['userrole'] == 'staff' || $_SESSION['userrole'] == 'bowler'  || $_SESSION['userrole'] == 'eventstaff'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $teamName = $_SESSION['team'];

        $sql = $db->prepare("SELECT `rostersubmitted` FROM `teams` WHERE `teamname` = '$teamName' ORDER BY `teamname` ASC");
        $sql->execute();
        $checkTeamRoster = $sql->fetch(); 
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    $title = 'Submit Team Roster';

    include 'inc/header.php';

    if (isset($_SESSION['success'])) {
        $msg = '<div class="col-12"><p class="successMsg">'.$_SESSION['teamName'].'" '.$_SESSION['success'].'</p></div>';
    } else if (isset($_SESSION['error'])) {
        $msg = '<div class="col-12"><p class="errorMsg">'.$_SESSION['error'].'</p></div>';
    } else {
        $msg = '';
    }

    $info = getdate();
    $date = $info['mday'];
    $month = $info['mon'];
    $year = $info['year'];
    $hour = $info['hours'];
    $min = $info['minutes'];
    $sec = $info['seconds'];


?>

<div class="users roster">
    <?php echo $msg; ?>

    <div class="container">
        <div class="row">
            <div class="col-12">
                <h5>Important:</h5>
                <ol>
                    <li>Roster submission will be open from 19th to 26th of each month. The submit roster tab will only appear during this time frame.</li>
                    <li>If a roster is not submitted in this frame, the last submitted roster will automatically be re-submitted for the following month.</li>
                    <li>Only submitted rosters made during the 19th-26th time frame will appear on the front end effective the 1st of each month. No changes will take effect if a roster is submitted after the 26th of the month. If an edit is made outside of the listed timeframe, it will not take effect until your next roster submission.</li>
                </ol>
                

                <h6><b>Current Date:</b> <?php echo $month.'/'.$date.'/'.$year ?></h6>

                

                <?php
                    if ($date >= 19 && $date <= 26) {
                ?>
                    <p>Please submit your roster by clicking the button below.</p>
                    <a href="process/submitRoster.php" class="submitroster">Submit Roster</a>
                <?php
                    }
                ?>
            </div>
        </div>
    </div>
</div>

<?php

unset($_SESSION['success']);
unset($_SESSION['error']);
unset($_SESSION['teamName']);
include 'inc/footer.php';

?>