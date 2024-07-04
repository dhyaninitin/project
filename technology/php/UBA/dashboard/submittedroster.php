<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] != 'admin'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `teams` ORDER BY `rostersubmissiondate` DESC");
        $sql->execute();
        // $sql->execute();
        $teamDeets = $sql->fetchAll();


    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    $title = 'Submitted Team Rosters';

    include 'inc/header.php';

    if (isset($_SESSION['success'])) {
        $msg = '<div class="col-12"><p class="successMsg">"'.$_SESSION['teamName'].'" '.$_SESSION['success'].'</p></div>';
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

                <h4>Team Rosters - Submitted</h4>
                <p>Click on the Team name to view the submitted roster for that team</p>
                <hr>


                <table id="submitted_rosters" class="display">
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Team</th>
                        <th>Roster Submitted</th>
                        <th>Submitted By</th>
                        <th>Submitted On</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                                    $i = 1;
                                    foreach ($teamDeets as $team) {
                                ?>
                    <tr>
                        <td>
                            <?php echo $i; ?>
                        </td>
                        <td>
                            <a href="submittedrosterlist.php?id=<?php echo $team['id'];?>">
                                <?php echo $team['teamname']; ?>
                            </a>
                        </td>
                        <td>
                            <?php if($team['rostersubmitted'] == 1) {echo 'Yes';} else {echo 'No';}; ?>
                        </td>
                        <td>
                            <?php if($team['submittedby'] == 'Team') {echo 'Team';} else {echo 'Auto';};?>
                        </td>
                        <td>
                        <?php
                            //Our YYYY-MM-DD date.
                            $ymd = $team['rostersubmissiondate'];
                            //Convert it into a timestamp.
                            $timestamp = strtotime($ymd);
                            //Convert it to DD-MM-YYYY
                            $dmy = date("m-d-Y H:m:s", $timestamp);
                            //Echo it
                            echo $dmy;
                        ?>
                        </td>
                    </tr>
                    <?php
                        $i++;
                        }
                    ?>
                </tbody>
            </table>

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
