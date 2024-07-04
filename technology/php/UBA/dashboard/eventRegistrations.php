<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    // if($_SESSION['userrole'] != 'admin'){
    //     header("Location: /dashboard/home.php");
    // }

    if($_SESSION['userrole'] == 'staff' || $_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'president' || $_SESSION['userrole'] == 'owner'  || $_SESSION['userrole'] == 'secretary'){
        header("Location: ".$base_url."/dashboard/home.php");
    }


    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `eventregistrations`");
        // $sql->execute([':divisionSelected' => $divisionSelected]);
        $sql->execute();
        $eventRegistrationsDeets = $sql->fetchAll();
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    $title = 'Event Registrations';

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
                <h4>Event Registrations</h4>
                <hr>
                <table id="event_registrations_table">
                    <thead>
                        <th>No.</th>
                        <th>Event</th>
                        <th>Squad</th>
                        <th>Bowler</th>
                        <th>Payment</th>
                    </thead>
                    <tbody>
                    <?php
                        $i = 1;
                        foreach ($eventRegistrationsDeets as $bowlers) {
                    ?>
                        <tr>
                            <td><?php echo $i; ?></td>
                            <td><?php echo $bowlers['eventname']; ?></td>
                            <td><?php echo $bowlers['squad']; ?></td>
                            <td><?php echo $bowlers['bowler']; ?></td>
                            <td><?php if($bowlers['paypemt'] == 0){echo 'Not Cleared';} else {echo 'Cleared';}; ?></td>
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