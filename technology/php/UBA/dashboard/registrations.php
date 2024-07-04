<?php

    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] != 'admin'){
        header("Location: /dashboard/home.php");
    }

    try {
        $database = new Connection();
        $db = $database->openConnection();

            $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `uemail` != ''");
            $sql->execute();
            $dataFetched = $sql->fetchAll();
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    $title = 'Registrations';

    include 'inc/header.php';

    if (isset($_SESSION['success'])) {
        $msg = '<div class="col-12"><p class="successMsg">'.$_SESSION['success'].'</p></div>';
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

                <h4>Registered Bowlers</h4>
                <hr>

                <div class="row">

                    <div class="col-12">
                        <table id="registrationTable">
                            <thead>
                                <th>No.</th>
                                <th>UBA ID</th>
                                <th>Name</th>
                                <th>Team</th>
                                <th>President</th>
                                <th>Entering Avg</th>
                                <th>Sanction #</th>
                                <th>Verified</th>
                                <th>Edit</th>
                                <th>Verify User</th>
                                <th>Resend Email</th>
                            </thead>
                            <tbody>
                            <?php
                                $i = 1;
                                foreach ($dataFetched as $bowlers) {
                                    $bsystemID = $bowlers['id'];
                            ?>
                                <tr>
                                    <td><?php echo $i; ?></td>
                                    <td><?php echo $bowlers['bowlerid']; ?></td>
                                    <td><?php echo $bowlers['name']; ?></td>
                                    <td><?php echo $bowlers['team']; ?></td>
                                    <td><?php if($bowlers['president'] == 1){echo 'Yes';} else {echo'No';} ?></td>
                                    <td><?php echo $bowlers['enteringAvg']; ?></td>
                                    <td><?php echo $bowlers['sanction']; ?></td>
                                    <td><?php if($bowlers['verified'] == 1){echo 'Yes';} else {echo'No';} ?></td>
                                    <td><a href="editBowler.php?id=<?php echo $bowlers['id']; ?>"><i class="fas fa-pen-square"></i></a></td>
                                    <td><?php if($bowlers['verified'] == 1){echo '-';} else {echo '<a href="verifyBowler.php?id='.$bsystemID.'"><i class="fas fa-check"></i></a>';} ?></td>
                                    <td><?php if($bowlers['verified'] == 1){echo '-';} else {echo'<a href="resendVerification.php?id='.$bsystemID.'"><i class="fas fa-envelope"></i></i></a>';} ?></td>
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
    </div>
</div>

<?php

unset($_SESSION['success']);
unset($_SESSION['error']);
unset($_SESSION['teamName']);
include 'inc/footer.php';

?>