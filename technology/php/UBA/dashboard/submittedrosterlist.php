<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] != 'admin'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    $teamID = $_GET['id'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `teams` WHERE `id` = '$teamID' ORDER BY `teamname` ASC");
        $sql->execute();
        // $sql->execute();
        $teamDeets = $sql->fetch();

        $teamName = $teamDeets['teamname'];

        $sql = $db->prepare("SELECT * FROM `submittedrosters` WHERE `team` = :teamName");
        $sql->execute([':teamName' => $teamName]);
        // $sql->execute();
        $bowlerDeets = $sql->fetchAll();


    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    $title = 'Submitted Team Rosters List';

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

                <h4> <?php echo $teamName; ?> - Team Roster - Submitted List</h4>
                <hr>
                

                <table id="submitted_rosters_list" class="display">
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Bowler ID</th>
                        <th>Team</th>
                        <th>Name</th>
                        <th>Nicknames</th>
                        <th>Sanction</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                                    $i = 1;
                                    foreach ($bowlerDeets as $team) {
                                ?>
                    <tr>
                        <td>
                            <?php echo $i; ?>
                        </td>
                        <td>
                                <?php echo $team['bowlerid']; ?>
                        </td>
                        <td>
                            <?php echo $team['team']; ?>
                        </td>
                        <td>
                            <?php echo $team['name']; ?>
                        </td>
                        <td>
                            <?php echo $team['nickname1']; ?>
                        </td>
                        <td>
                            <?php echo $team['sanction']; ?>
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