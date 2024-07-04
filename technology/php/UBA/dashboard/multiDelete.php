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

    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    $title = 'Confirm Multiple Deletion';

    include 'inc/header.php';

?>

<div class="users scoreData">
    <?php echo $msg; ?>

    <div class="container">
        <div class="row">
            <div class="col-12">

                <h4 style="text-transform: capitalize"><?php echo $dataType; ?> Score Data Deletion</h4>
                <hr>
                

                <div class="row">
                    
                    <div class="col-12">
                        <p>The following entries will be deleted</p>
                        <?php
                            if ($dataType == 'event') {
                        ?>
                            
                                <table id="table_1_events" class="display">
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
                                                <td><?php echo $i; ?></td>
                                                <td><?php
                                                    //Our YYYY-MM-DD date.
                                                    $ymd = $singleScoreData['eventdate'];
                                                    //Convert it into a timestamp.
                                                    $timestamp = strtotime($ymd);
                                                    //Convert it to DD-MM-YYYY
                                                    $dmy = date("m-d-Y", $timestamp);
                                                    //Echo it
                                                    echo $dmy;
                                                ?></td>
                                                <td><?php echo $singleScoreData['year']; ?></td>
                                                <td><?php echo $singleScoreData['event']; ?></td>
                                                <td><?php echo $singleScoreData['eventtype'];?></td>
                                                <td><?php echo $singleScoreData['name']; ?></td>
                                                <td><?php echo $singleScoreData['team']; ?></td>
                                                <td><?php echo $singleScoreData['game1']; ?></td>
                                                <td><?php echo $singleScoreData['game2']; ?></td>
                                                <td><?php echo $singleScoreData['game3']; ?></td>
                                                <td><?php echo $singleScoreData['game4']; ?></td>
                                                <td><?php echo $singleScoreData['game5']; ?></td>
                                            </tr>
                                        <?php
                                            $i++;
                                            }
                                        ?>
                                    </tbody>
                                </table>
                                <form action="process/confirmMultiDelete.php" method="POST">
                                <?php
                                    for ($i=0; $i < $noOfEntries; $i++) {
                                        $rowID = $entries[$i];
                                ?>
                                    <input type="hidden" name="entries[]" value="<?php echo $rowID;?>">
                                <?php
                                    }
                                ?>
                                    <input type="submit" value="Confirm Deletion">
                                </form>
                        <?php
                            } else {
                        ?>
                            <table id="table_1_seasons" class="display">
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
                                        <td><?php echo $i; ?></td>
                                        <td><?php
                                            //Our YYYY-MM-DD date.
                                            $ymd = $singleScoreData['eventdate'];
                                            //Convert it into a timestamp.
                                            $timestamp = strtotime($ymd);
                                            //Convert it to DD-MM-YYYY
                                            $dmy = date("m-d-Y", $timestamp);
                                            //Echo it
                                            echo $dmy;
                                        ?></td>
                                        <td><?php echo $singleScoreData['year']; ?></td>
                                        <td><?php echo $singleScoreData['event']; ?></td>
                                        <td><?php echo $singleScoreData['location'];?></td>
                                        <td><?php echo $singleScoreData['name']; ?></td>
                                        <td><?php echo $singleScoreData['team']; ?></td>
                                        <td><?php echo $singleScoreData['game1']; ?></td>
                                        <td><?php echo $singleScoreData['game2']; ?></td>
                                        <td><?php echo $singleScoreData['game3']; ?></td>
                                    </tr>
                                <?php
                                    $i++;
                                    }
                                ?>
                            </tbody>
                        </table>
                        <form action="process/confirmMultiDelete.php" method="POST">
                            <?php
                                for ($i=0; $i < $noOfEntries; $i++) {
                                    $rowID = $entries[$i];
                            ?>
                                <input type="hidden" name="entries[]" value="<?php echo $rowID;?>">
                            <?php
                                }
                            ?>
                            <input type="submit" value="Confirm Deletion">
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