<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] != 'admin'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    $entries = $_POST['check_list'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $allEntries = array();
        $noOfEntries = sizeof($entries);

        $dataType = $_SESSION['scoreDataType'];

        if ($_SESSION['scoreDataType'] == 'event') {
            for ($i=0; $i < $noOfEntries; $i++) {
                $rowID = $entries[$i];
                $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `id` = '$rowID'");
                $sql->execute();
                $entryDeets = $sql->fetch();
    
                array_push($allEntries, $entryDeets);
            }
        } else {
            for ($i=0; $i < $noOfEntries; $i++) {
                $rowID = $entries[$i];
                $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `id` = '$rowID'");
                $sql->execute();
                $entryDeets = $sql->fetch();
    
                array_push($allEntries, $entryDeets);
            }
        }

        $sql = $db->prepare("SELECT * FROM `teams` ORDER BY `teamname` ASC");
        $sql->execute();
        $allTeams = $sql->fetchAll();

    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    $title = 'Edit Multiple Entries';

    include 'inc/header.php';

    // var_dump($allTeams);
                                                

?>

<div class="users scoreData">
    <?php echo $msg; ?>

    <div class="container">
        <div class="row">
            <div class="col-12">

                <h4 style="text-transform: capitalize"><?php echo $dataType; ?> Score Data Edit</h4>
                <a href="scoreData.php" class="backTeamBtn">Back to Score Entries</a>
                <hr>

                <div class="row">
                    
                    <div class="col-12">
                        <p>The following entries will be updated/deleted</p>
                        <?php
                            if ($dataType == 'event') {
                        ?> 
                            <form action="process/confirmMultiEdit.php" method="POST">                             
                                <table id="table_1_events_me" class="display">
                                    <thead>
                                        <tr>
                                            <th>No.</th>
                                            <th>Date</th>
                                            <th>Year</th>
                                            <th>Event Name</th>
                                            <th>Event Type</th>
                                            <th>Bowler</th>
                                            <th>Team</th>
                                            <th>Game 1</th>
                                            <th>Game 2</th>
                                            <th>Game 3</th>
                                            <th>Game 4</th>
                                            <th>Game 5</th>
                                        </tr>
                                    </thead>
                                    
                                    <tbody>
                                        <?php
                                            $i = 1;
                                            foreach ($allEntries as $singleScoreData) {
                                        ?>
                                            <tr>
                                                <input type="hidden" name="tabID[]" value="<?php echo $singleScoreData['id'];?>">
                                                <td><?php echo $i; ?></td>
                                                <td><input type="text" id="datepicker" name="datepicker[]" required value="<?php echo $singleScoreData['eventdate']; ?>"></td>
                                                <td>
                                                    <select name="year[]" id="year" required>
                                                        <option value="-" disabled>Select</option>
                                                        <?php
                                                        $val = 17;
                                                        for ($j=0; $j < 3; $j++) { 
                                                            $yearVal = '20'.$val;
                                                            $finalVal = $yearVal . '/'. ($val+1);
                                                            
                                                            if ($singleScoreData['year'] == $finalVal) {
                                                                echo '<option value="'.$finalVal.'" selected>'.$finalVal.'</option>';
                                                            } else {
                                                                echo '<option value="'.$finalVal.'">'.$finalVal.'</option>';
                                                            }
                                                            $val++;
                                                        }
                                                        ?>
                                                    </select>
                                                </td>
                                                <td><input type="text" id="eventName" name="eventName[]" required value="<?php echo $singleScoreData['event']?>"></td>
                                                <td><input type="text" id="eventType" name="eventType[]" required value="<?php echo $singleScoreData['eventtype']?>"></td>
                                                <td><input type="text" id="bowler" name="bowler[]" required value="<?php echo $singleScoreData['name']?>"></td>
                                                <td>
                                                <select name="team[]" id="team" required>
                                                    <option value="-" disabled selected>Select</option>
                                                    <?php
                                                    foreach ($allTeams as $team) {
                                                        $teamname = $team['teamname'];

                                                        if (strtolower($singleScoreData['team']) == strtolower($teamname)) {
                                                            echo '<option value="'.$teamname.'" selected>'.$teamname.'</option>';
                                                        } else {
                                                            echo '<option value="'.$teamname.'">'.$teamname.'</option>';
                                                        }
                                                    }
                                                ?>
                                                </select>
                                                </td>
                                                <td><input type="number" id="game1" name="game1[]" required value="<?php echo $singleScoreData['game1']?>"></td>
                                                <td><input type="number" id="game2" name="game2[]" required value="<?php echo $singleScoreData['game2']?>"></td>
                                                <td><input type="number" id="game3" name="game3[]" required value="<?php echo $singleScoreData['game3']?>"></td>
                                                <td><input type="number" id="game4" name="game4[]" required value="<?php echo $singleScoreData['game4']?>"></td>
                                                <td><input type="number" id="game5" name="game5[]" required value="<?php echo $singleScoreData['game5']?>"></td>
                                            </tr>
                                        <?php
                                            $i++;
                                            }
                                        ?>
                                    </tbody>
                                </table>
                                <br>
                                <input type="submit" value="Confirm Multiple Edits">
                            </form>
                            <hr>

                                <br>
                                <form action="process/confirmMultiDelete.php" method="POST">
                                <?php
                                    for ($i=0; $i < $noOfEntries; $i++) {
                                        $rowID = $entries[$i];
                                ?>
                                    <input type="hidden" name="entries[]" value="<?php echo $rowID;?>">
                                <?php
                                    }
                                ?>
                                    <input type="submit" class="deleteEntries" value="Delete all the entries listed above">
                                </form>
                        <?php
                            } else {
                        ?>
                        <form action="process/confirmMultiEdit.php" method="POST"> 
                            <table id="table_1_seasons_me" class="display">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Date</th>
                                    <th>Year</th>
                                    <th>Event Name</th>
                                    <th>Location</th>
                                    <th>Bowler</th>
                                    <th>Team</th>
                                    <th>Game 1</th>
                                    <th>Game 2</th>
                                    <th>Game 3</th>
                                </tr>
                            </thead>
                                <tbody>
                                    <?php
                                        $i = 1;
                                        foreach ($allEntries as $singleScoreData) {
                                    ?>
                                        <tr>
                                            <input type="hidden" name="tabID[]" value="<?php echo $singleScoreData['id'];?>">
                                            <td><?php echo $i; ?></td>
                                            <td><input type="text" id="datepicker" name="datepicker[]" required value="<?php echo $singleScoreData['eventdate']; ?>"></td>
                                            <td>
                                                <select name="year[]" id="year[]" required>
                                                    <option value="-" disabled>Select</option>
                                                    <?php
                                                    $val = 17;
                                                    for ($j=0; $j < 3; $j++) { 
                                                        $yearVal = '20'.$val;
                                                        $finalVal = $yearVal . '/'. ($val+1);
                                                        
                                                        if ($singleScoreData['year'] == $finalVal) {
                                                            echo '<option value="'.$finalVal.'" selected>'.$finalVal.'</option>';
                                                        } else {
                                                            echo '<option value="'.$finalVal.'">'.$finalVal.'</option>';
                                                        }
                                                        $val++;
                                                    }
                                                    ?>
                                                </select>
                                            </td>
                                            <td><input type="text" id="eventName" name="eventName[]" required value="<?php echo $singleScoreData['event']?>"></td>
                                            <td><input type="text" id="location" name="location[]" required value="<?php echo $singleScoreData['location']?>"></td>
                                            <td><input type="text" id="bowler" name="bowler[]" required value="<?php echo $singleScoreData['name']?>"></td>
                                            <td>
                                            <select name="team[]" id="team" required>
                                                <option value="-" disabled selected>Select</option>
                                                <?php
                                                
                                                foreach ($allTeams as $team) {
                                                    $teamname = $team['teamname'];

                                                    if (strtolower($singleScoreData['team']) == strtolower($teamname)) {
                                                        echo '<option value="'.$teamname.'" selected>'.$teamname.'</option>';
                                                    } else {
                                                        echo '<option value="'.$teamname.'">'.$teamname.'</option>';
                                                    }
                                                }
                                            ?>
                                            </select>
                                            </td>
                                            <td><input type="number" id="game1" name="game1[]" required value="<?php echo $singleScoreData['game1']?>"></td>
                                            <td><input type="number" id="game2" name="game2[]" required value="<?php echo $singleScoreData['game2']?>"></td>
                                            <td><input type="number" id="game3" name="game3[]" required value="<?php echo $singleScoreData['game3']?>"></td>
                                        </tr>
                                    <?php
                                        $i++;
                                        }
                                    ?>
                                </tbody>
                            </table>
                            <br>
                            <input type="submit" value="Confirm Multiple Edits">
                        </form>
                        <hr>
                        <br>
                        <form action="process/confirmMultiDelete.php" method="POST">
                            <?php
                                for ($i=0; $i < $noOfEntries; $i++) {
                                    $rowID = $entries[$i];
                            ?>
                                <input type="hidden" name="entries[]" value="<?php echo $rowID;?>">
                            <?php
                                }
                            ?>
                            <input type="submit" class="deleteEntries" value="Delete all the entries listed above">
                        </form>
                        <?php
                            }
                        ?>
                        
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