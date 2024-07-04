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

        $sql = $db->prepare("SELECT * FROM `bowlersreleased`");
        $sql->execute();
        // $sql->execute();
        $bowlerDeets = $sql->fetchAll(); 
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    $title = 'Released/Suspended Bowlers';

    include 'inc/header.php';

    if (isset($_SESSION['success'])) {
        $msg = '<div class="col-12"><p class="successMsg">"'.$_SESSION['teamName'].'" '.$_SESSION['success'].'</p></div>';
    } else if (isset($_SESSION['error'])) {
        $msg = '<div class="col-12"><p class="errorMsg">'.$_SESSION['error'].'</p></div>';
    } else {
        $msg = '';
    }



?>

<div class="users roster">
    <?php echo $msg; ?>

    <div class="container">
        <div class="row">
            <div class="col-12">

            <h4>Released/Suspended Bowlers List</h4>
                    <hr>
                <?php
                if ($bowlerDeets) {
                ?>
                    <table id="released_bowlers">
                            <thead>
                                <th>No.</th>
                                <th>UBA ID</th>
                                <th>Name</th>
                                <th>Team</th>
                                <th>Date Submitted</th>
                                <th>Removed by</th>
                                <th>Current Status</th>
                                <th>Eligible Date</th>
                                <th>Reinstate</th>
                            </thead>
                            <tbody>
                            <?php
                                $i = 1;
                                foreach ($bowlerDeets as $bowlers) {
                            ?>
                                <tr>
                                    <td><?php echo $i; ?></td>
                                    <td><?php echo $bowlers['bowlerid']; ?></td>
                                    <td><?php echo $bowlers['bowler']; ?></td>
                                    <td><?php echo $bowlers['team']; ?></td>
                                    <td><?php echo $bowlers['datesubmitted']; ?></td>
                                    <td><?php echo $bowlers['removedby']; ?></td>
                                    <td><?php echo $bowlers['currentstatus']; ?></td>
                                    <td><?php echo $bowlers['eligibledate']; ?></td>
                                    <td>
                                    <?php
                                        if ($bowlers['currentstatus'] == 'Suspended' || $bowlers['currentstatus'] == 'Released') {
                                    ?>
                                    <a href="process/reinstatebowler.php?id=<?php echo $bowlers['id'];?>">Reinstate</a>
                                    <?php
                                        } else {
                                            echo '-';
                                        }
                                    ?>
                                    </td>
                                </tr>
                            <?php
                                $i++;
                                }

                            ?>
                            </tbody>
                        </table>
                <?php
                } else {
                    echo 'No Data';
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