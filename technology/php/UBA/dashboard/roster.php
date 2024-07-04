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

    $reset = $_GET['reset'];

    if ($reset == 'y') {
        unset($_SESSION['rosterSelected']);
        unset($_SESSION['divisionSelected']);
    }

    try {
        $database = new Connection();
        $db = $database->openConnection();

        if ($_SESSION['rosterSelected']) {
            $teamName = $_SESSION['rosterSelected'];

            $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `team` = :teamName AND `active` > 0");
            $sql->execute([':teamName' => $teamName]);
            // $sql->execute();
            $teamDeets = $sql->fetchAll();
        }

        if ($_SESSION['divisionSelected']) {
            $divisionSelected = $_SESSION['divisionSelected'];

            $sql = $db->prepare("SELECT * FROM `teams` WHERE `division` = :divisionSelected  ORDER BY `teamname` ASC");
            $sql->execute([':divisionSelected' => $divisionSelected]);
            // $sql->execute();
            $divisionDeets = $sql->fetchAll();

            $allBowlers = array();
            $tempArr = array();

            foreach ($divisionDeets as $teams) {
                $teamName = $teams['teamname'];

                $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `team` = :teamName AND `active` > 0");
                $sql->execute([':teamName' => $teamName]);
                // $sql->execute();
                $divisionTeamDeets = $sql->fetchAll();
                $allBowlers = array_merge($allBowlers, $divisionTeamDeets);
                // foreach($divisionTeamDeets as $key=>$value){
                //     $allBowlers[$key] = $value;
                // }
            }
        }

        if (isset($_POST['teamSelected'])) {

            $teamName = $_POST['teamSelected'];

            $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `team` = :teamName AND `active` > 0");
            $sql->execute([':teamName' => $teamName]);
            // $sql->execute();
            $teamDeets = $sql->fetchAll();

            $_SESSION['rosterSelected'] = $_POST['teamSelected'];

        } else if(isset($_POST['divisionSelected'])) {

            $divisionSelected = $_POST['divisionSelected'];

            $sql = $db->prepare("SELECT * FROM `teams` WHERE `division` = :divisionSelected ORDER BY `teamname` ASC");
            $sql->execute([':divisionSelected' => $divisionSelected]);
            // $sql->execute();
            $divisionDeets = $sql->fetchAll();

            $allBowlers = array();

            foreach ($divisionDeets as $teams) {
                $teamName = $teams['teamname'];

                $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `team` = :teamName AND `active` > 0");
                $sql->execute([':teamName' => $teamName]);
                // $sql->execute();
                $divisionTeamDeets = $sql->fetchAll();
                $allBowlers = array_merge($allBowlers, $divisionTeamDeets);
                // foreach($divisionTeamDeets as $key=>$value){
                //     $allBowlers[$key] = $value;
                // }
            }

            $_SESSION['divisionSelected'] = $_POST['divisionSelected'];

        } else {
            $sql = $db->prepare("SELECT * FROM `teams` ORDER BY `teamname` ASC");
            $sql->execute();
            $dataFetched = $sql->fetchAll();

            $sql = $db->prepare("SELECT * FROM `teams` GROUP BY `division` ORDER BY `teamname` ASC ");
            $sql->execute();
            // $sql->execute();
            $divisionDeets = $sql->fetchAll();
        }

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

                <?php
                    if (isset($_POST['teamSelected']) || isset($_SESSION['rosterSelected']) || isset($_POST['divisionSelected']) || isset($_SESSION['divisionSelected'])) {

                ?>

                <div class="row">
                    <div class="col-12">
                        <a href="<?=$base_url?>/dashboard/roster.php?reset=y" class="backTeamBtn"><i class="fas fa-chevron-left"></i> Select Team</a>
                        <hr>
                    </div>
                </div>

                <?php
                    if (isset($_POST['teamSelected']) || isset($_SESSION['rosterSelected'])) {
                ?>
                    <h4>Team Roster: '<?php echo $teamName;?>'</h4>
                    <hr>
                    <div class="row">

                    <div class="col-12">
                        <table id="teamRoster">
                            <thead>
                                <th>No.</th>
                                <th>UBA ID</th>
                                <th>Name</th>
                                <th>Nickname</th>
                                <th>Office Held</th>
                                <th>Sanction #</th>
                                <th>Entering Avg</th>
                                <th>UBA Avg</th>
                                <th>ST Avg</th>
                                <th>Edit</th>
                            </thead>
                            <tbody>
                            <?php
                                $i = 1;
                                foreach ($teamDeets as $bowlers) {
                            ?>
                                <tr>
                                    <td><?php echo $i; ?></td>
                                    <td><?php echo $bowlers['bowlerid']; ?></td>
                                    <td><?php echo $bowlers['name']; ?></td>
                                    <td><?php echo $bowlers['nickname1']; ?></td>
                                    <td><?php echo $bowlers['officeheld']; ?></td>
                                    <td><?php echo $bowlers['sanction']; ?></td>
                                    <td><?php echo $bowlers['enteringAvg']; ?></td>
                                    <td><?php echo $bowlers['ubaAvg']; ?></td>
                                    <td><?php echo $bowlers['seasontourAvg']; ?></td>
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
                <?php
                    } else {
                ?>
                    <h4>Division Roster: '<?php echo $_SESSION['divisionSelected'];?>'</h4>
                    <hr>
                    <div class="row">

                    <div class="col-12">
                        <table id="divisionRoster">
                            <thead>
                                <th>No.</th>
                                <th>UBA ID</th>
                                <th>Name</th>
                                <th>Nickname</th>
                                <th>Team</th>
                                <th>Sanction #</th>
                                <th>Entering Avg</th>
                                <th>UBA Avg</th>
                                <th>ST Avg</th>
                                <th>Edit</th>
                            </thead>
                            <tbody>
                            <?php
                                $i = 1;
                                foreach ($allBowlers as $bowlers) {
                            ?>
                                <tr>
                                    <td><?php echo $i; ?></td>
                                    <td><?php echo $bowlers['bowlerid']; ?></td>
                                    <td><?php echo $bowlers['name']; ?></td>
                                    <td><?php echo $bowlers['nickname1']; ?></td>
                                    <td><?php echo $bowlers['team']; ?></td>
                                    <td><?php echo $bowlers['sanction']; ?></td>
                                    <td><?php echo $bowlers['enteringAvg']; ?></td>
                                    <td><?php echo $bowlers['ubaAvg']; ?></td>
                                    <td><?php echo $bowlers['seasontourAvg']; ?></td>
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
                <?php
                    }
                ?>






                <?php

                    } else {

                ?>

                 <div class="row">

                    <div class="col-6">

                    <h4>Team Roster</h4>

                        <form action="" method="post">
                            <div class="form-group">
                            <label for="teamSelected">Select Team</label>
                            <select name="teamSelected" id="teamSelected">
                                <option value="-" disabled selected>Select</option>
                                <?php
                                    foreach ($dataFetched as $team) {
                                ?>
                                <option value="<?php echo $team['teamname']; ?>"><?php echo $team['teamname']; ?></option>
                                <?php
                                    }
                                ?>
                            </select>
                            </div>


                            <div class="form-group">
                                <input type="submit" value="Select Team">
                            </div>
                        </form>

                    </div>



                        <div class="col-6">
                            <h4>Search by Division</h4>

                            <form action="" method="post">

                                <div class="form-group">
                                <!-- <label for="dataSelected">Select</label> -->
                                <select name="divisionSelected" id="divisionSelected" required>
                                    <option value="-" disabled selected>-</option>
                                    <?php
                                        foreach ($divisionDeets as $division) {
                                    ?>
                                        <option value="<?php echo $division['division'];?>" ><?php echo $division['division'];?></option>
                                    <?php
                                        }
                                    ?>
                                </select>
                                </div>


                                <div class="form-group">
                                    <input type="submit" name="searchDB" value="Search">
                                </div>
                            </form>
                        </div>

                </div>


                <?php

                    };

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
