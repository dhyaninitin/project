<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] == 'admin' || $_SESSION['userrole'] == 'staff' || $_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'eventstaff'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    try {
        $database = new Connection();
        $db = $database->openConnection();

            $teamName = $_SESSION['team'];

            $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `team` = :teamName AND `active` = 1");
            $sql->execute([':teamName' => $teamName]);
            // $sql->execute();
            $teamDeets = $sql->fetchAll();
            //var_dump($teamDeets);
            $sql = $db->prepare("SELECT `rostersubmitted` FROM `teams` WHERE `teamname` = :teamName ORDER BY `teamname` ASC ");
            $sql->execute([':teamName' => $teamName]);
            $checkTeamRoster = $sql->fetch(); 
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    $title = 'Team Roster';

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

                <div class="row">
                    <div class="col-12">
                        <h5>Roster</h5>

                        <hr>
                        <?php
                            if ($checkTeamRoster['rostersubmitted'] == 1) {
                        ?>

                            <!-- <h6>Roster is submitted for the month. No more edits can be done till 26th</h6> -->
                            <hr>
                        <?php
                            } else {
                        ?>
                            <a href="addBowler.php" class="addBowlerBtn">Add New Bowler <i class="fas fa-plus-square"></i></a>
                            <a href="teamAddBowler.php" class="addBowlerBtn">Transfer Other Bowler to <?php echo $teamName;?> <i class="fas fa-plus-square"></i></a>
                        <?php
                            }
                        ?>
                    </div>
                </div>

                <h4>Team Roster: '<?php echo $teamName;?>'</h4>
                <hr>

                <div class="row">

                    <div class="col-12">

                            <table id="teamRosterTwo" class="display">
                            <thead>
                                
                                <th>UBA ID</th>
                                <th>Name</th>
                                <th>Nickname</th>
                                <th>Sanction number</th>
                                <th>Entering Avg.</th>
                                <th>UBA Average</th>
                                <th>Season Tour Avg.</th>
                                <th>Office Held</th>
                                <th>Edit</th>
                            </thead>
                            <tbody>
                            <?php
                                $i = 1;
                                foreach ($teamDeets as $bowlers) {
                            ?>
                                <tr>                                    
                                    <td><?php echo $bowlers['bowlerid']; ?></td>
                                    <td><?php echo $bowlers['name']; ?></td>
                                    <td><?php echo $bowlers['nickname1']; ?></td>
                                    <td><?php echo $bowlers['sanction']; ?></td>
                                    <td><?php echo $bowlers['enteringAvg']; ?></td>
                                    <td><?php echo $bowlers['ubaAvg']; ?></td>
                                    <td><?php echo $bowlers['seasontourAvg']; ?></td>
                                    <td><?php echo $bowlers['officeheld']; ?></td>
                                    <td><a href="editBowler.php?id=<?php echo $bowlers['id']; ?>"><i class="fas fa-pen-square"></i></a></td>
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