<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    // if($_SESSION['userrole'] != 'admin'){
    //     header("Location: /dashboard/home.php");
    // }

    if($_SESSION['userrole'] == 'eventstaff' || $_SESSION['userrole'] == 'staff' || $_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'president' || $_SESSION['userrole'] == 'owner'  || $_SESSION['userrole'] == 'secretary'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `teams` ORDER BY `teamname` ASC");
        $sql->execute();
        $teamDeets = $sql->fetchAll();

        // $sql = $db->prepare("SELECT * FROM `teams` GROUP BY `division` ORDER BY `teamname` ASC ");
        // $sql->execute();
        // $divisionDeets = $sql->fetchAll();

        if (isset($_POST['dataByTeam'])) {

                $dataType = $_POST['dataByTeam'];
                $teamSelected = $_POST['teamSelected'];
                // $eventdate = date('Y-d-m',strtotime($_POST['datepicker']));

            if ($dataType == 'event') {
                $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `team` = '$teamSelected' ORDER BY `id` DESC");
                $sql->execute();
                $scoreDeets = $sql->fetchAll();

                $_SESSION['scoreDataType'] = 'event';
                $_SESSION['scoreDataTeam'] = $teamSelected;
                $_SESSION['dataChosen'] = 1;

            } else {
                $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `team` = '$teamSelected' ORDER BY `id` DESC");
                $sql->execute();
                $scoreDeets = $sql->fetchAll();
                $_SESSION['scoreDataType'] = 'season';
                $_SESSION['scoreDataTeam'] = $teamSelected;
                $_SESSION['dataChosen'] = 1;
            }
               
        }

        // if (isset($_POST['dataByName'])) {
        //     echo $_POST['dataByName'];
        //     exit();
        // } else {
            
        //     exit();
        // }
        

        if (isset($_POST['dataByName'])) {

            $dataType = $_POST['dataByName'];
            $bowlerSelected = $_POST['nameSelected'];
            // $eventdate = date('Y-d-m',strtotime($_POST['datepicker']));

            if ($dataType == 'event') {
                $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `name` LIKE '%$bowlerSelected%' ORDER BY `id` DESC");
                $sql->execute();
                $scoreDeets = $sql->fetchAll();

                $_SESSION['scoreDataType'] = 'event';
                $_SESSION['scoreDataBowler'] = $bowlerSelected;
                $_SESSION['dataChosen'] = 2;

            } else {
                $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `name` LIKE '%$bowlerSelected%' ORDER BY `id` DESC");
                $sql->execute();
                $scoreDeets = $sql->fetchAll();
                $_SESSION['scoreDataType'] = 'season';
                $_SESSION['scoreDataBowler'] = $bowlerSelected;
                $_SESSION['dataChosen'] = 2;
            }
            
        }

        if (isset($_POST['dataByEvent'])) {

            $dataType = $_POST['dataByEvent'];
            $eventSelected = $_POST['eventSelected'];
            // $eventdate = date('Y-d-m',strtotime($_POST['datepicker']));

            if ($dataType == 'event') {
                $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `event` = :eventSelected ORDER BY `id` DESC");
                $sql->execute([':eventSelected' => $eventSelected]);
                $scoreDeets = $sql->fetchAll();

                $_SESSION['scoreDataType'] = 'event';
                $_SESSION['scoreDataEventName'] = $eventSelected;
                $_SESSION['dataChosen'] = 3;

            } else {
                $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `event` = :eventSelected ORDER BY `id` DESC");
                $sql->execute([':eventSelected' => $eventSelected]);
                $scoreDeets = $sql->fetchAll();
                $_SESSION['scoreDataType'] = 'season';
                $_SESSION['scoreDataEventName'] = $eventSelected;
                $_SESSION['dataChosen'] = 3;
            }
            
        }
        
        if ($_SESSION['dataChosen'] == 1) {

                $dataType = $_SESSION['scoreDataType'];
                $teamSelected = $_SESSION['scoreDataTeam'];

                if ($dataType == 'event') {
                    $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `team` = '$teamSelected' ORDER BY `id` DESC");
                    $sql->execute();
                    $scoreDeets = $sql->fetchAll();

                } else {
                    $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `team` = '$teamSelected' ORDER BY `id` DESC");
                    $sql->execute();
                    $scoreDeets = $sql->fetchAll();
                } 
        }

        if ($_SESSION['dataChosen'] == 2) {
                $dataType = $_SESSION['scoreDataType'];
                $bowlerSelected = $_SESSION['scoreDataBowler'];

                if ($dataType == 'event') {
                    $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `name` LIKE '%$bowlerSelected%' ORDER BY `id` DESC");
                    $sql->execute();
                    $scoreDeets = $sql->fetchAll();

                } else {
                    $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `name` LIKE '%$bowlerSelected%' ORDER BY `id` DESC");
                    $sql->execute();
                    $scoreDeets = $sql->fetchAll();
                }
        }

        if ($_SESSION['dataChosen'] == 3) {
            $dataType = $_SESSION['scoreDataType'];
            $eventSelected = $_SESSION['scoreDataEventName'];

            if ($dataType == 'event') {
                $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `event` = :eventSelected ORDER BY `id` DESC");
                $sql->execute([':eventSelected' => $eventSelected]);
                // $sql->execute();
                $scoreDeets = $sql->fetchAll();

            } else {
                $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `event` = :eventSelected ORDER BY `id` DESC");
                $sql->execute([':eventSelected' => $eventSelected]);
                // $sql->execute();
                $scoreDeets = $sql->fetchAll();
            }
        }
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    $title = 'Score Data';

    include 'inc/header.php';

    if (isset($_SESSION['success'])) {
        $msg = '<div class="col-12"><p class="successMsg">"'.$_SESSION['success'].'</p></div>';
    } else if (isset($_SESSION['error'])) {
        $msg = '<div class="col-12"><p class="errorMsg">'.$_SESSION['error'].'</p></div>';
    } else {
        $msg = '';
    }

?>

<div class="users scoreData">
    <?php echo $msg; ?>

    <div class="container">
        <div class="row">
            <div class="col-12">

                <?php
                
                    if (!isset($_POST['searchDB']) && !isset($_SESSION['dataChosen'])) {

                ?>

                    <div class="row">
                        <div class="col-6">
                            <h4>Search by Team</h4>

                            <form action="" method="post">
                                <div class="form-group">
                                <!-- <label for="dataSelected">Select</label> -->
                                <select name="dataByTeam" id="dataByTeam" required>
                                    <option value="-" disabled selected>Select</option>
                                    <option value="event">Event Score Data</option>
                                    <option value="season">Season Score Data</option>
                                </select>
                                </div>

                                <div class="form-group">
                                <!-- <label for="dataSelected">Select</label> -->
                                <select name="teamSelected" id="teamSelected" required>
                                    <option value="-" disabled selected>Select</option>
                                    <?php
                                        foreach ($teamDeets as $team) {
                                    ?>
                                    <option value="<?php echo $team['teamname'];?>"><?php echo ucwords(strtolower($team['teamname']));?></option>
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

                        <div class="col-6">
                            <h4>Search by Bowler Name</h4>

                            <form action="" method="post">
                                <div class="form-group">
                                <!-- <label for="dataSelected">Select</label> -->
                                <select name="dataByName" id="dataByName" required>
                                    <option value="-" disabled selected>Select</option>
                                    <option value="event">Event Score Data</option>
                                    <option value="season">Season Score Data</option>
                                </select>
                                </div>

                                <div class="form-group">
                                <!-- <label for="dataSelected">Select</label> -->
                                    <input type="text" name="nameSelected" id="nameSelected" required>
                                </div>
                                

                                <div class="form-group">
                                    <input type="submit" name="searchDB" value="Search">
                                </div>
                            </form>      
                        </div>
                    </div>

                    <hr>

                    <div class="row">

                        <div class="col-6">
                            <h4>Search by Event</h4>

                            <form action="" method="post">
                                <div class="form-group">
                                <!-- <label for="dataSelected">Select</label> -->
                                <select name="dataByEvent" id="dataByEvent" required>
                                    <option value="-" disabled selected>Select</option>
                                    <option value="event">Event Score Data</option>
                                    <option value="season">Season Score Data</option>
                                </select>
                                </div>

                                <div class="form-group">
                                <!-- <label for="dataSelected">Select</label> -->
                                <select name="eventSelected" id="eventSelected" required>
                                    <option value="-" disabled selected>-</option>
                                </select>
                                </div>
                                

                                <div class="form-group">
                                    <input type="submit" name="searchDB" value="Search">
                                </div>
                            </form>
                        </div>

                    </div>

                <?php
                        
                    } else {

                ?>

                <div class="row">
                    <!-- <div class="col-12">
                        <a href="/dashboard/editTeam.php" class="backTeamBtn"><i class="fas fa-chevron-left"></i> Select Team</a>
                        <hr>
                    </div> -->
                </div>

                <h4 style="text-transform: capitalize"><?php echo $dataType; ?> Score Data</h4>
                <a href="resetInput.php?id=scoreData" class="backTeamBtn">Reset Search</a>
                <hr>
                <p>Click on <b style="text-decoration: underline">'No.'</b> or <b style="text-decoration: underline">'Name'</b> to edit the score entry. Click 'Reset Seach' button above to go back to the search screen.</p>
                <hr>
                <?php
                    if ($dataType == 'admin') {
                ?>
                <a href="#" id="multiSelect"><i class="fas fa-check"></i> Select All Entries</a>
                <p> Only visible entries on the page will be selected. <br> To select more entries, change the number of entries shown from the dropdown below and then press the 'Select All' button</p>
                <hr>
                <?php
                    }
                ?>

                <div class="row">
                    
                    <div class="col-12">
                        
                        <?php
                            if ($dataType == 'event') {
                                if($_SESSION['userrole'] == 'admin') {
                        ?>
                        <form action="multiEdit.php" id="form1" method="POST">
                            <table id="table_1_events" class="display scoreTable">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>No.</th>
                                    <th>Date</th>
                                    <th>Year</th>
                                    <th>Event Name</th>
                                    <th>Bowler ID</th>
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
                                    foreach ($scoreDeets as $singleScoreData) {
                                ?>
                                    <tr>
                                        <td><input type="checkbox" name="check_list[]" class="checkboxes" value="<?php echo $singleScoreData['id'];?>" form="form1"></td>
                                        <td><a href="scoreDataEvents.php?id=<?php echo $singleScoreData['id'];?>"><?php echo $i; ?></a></td>
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
                                        <td><?php echo $singleScoreData['bowlerid'];?></td>
                                        <td><a href="scoreDataEvents.php?id=<?php echo $singleScoreData['id'];?>"><?php echo $singleScoreData['name']; ?></a></td>
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
                        <hr>
                            <a href="#" id="selCheckboxs">Select All</a>                        
                            <input type="submit" value="Edit Entries">
                        </form>
                        <?php
                                } else {
                            ?>
                            <table id="table_1_events_es" class="display">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Date</th>
                                    <th>Year</th>
                                    <th>Event Name</th>
                                    <th>Bowler ID</th>
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
                                    foreach ($scoreDeets as $singleScoreData) {
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
                                        <td><?php echo $singleScoreData['bowlerid'];?></td>
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
                            <?php
                                }
                            } else {
                                if($_SESSION['userrole'] == 'admin') {
                        ?>
                        
                        <form action="multiEdit.php" id="form2" method="POST">
                            <table id="table_1_seasons" class="display scoreTable">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>No.</th>
                                    <th>Date</th>
                                    <th>Year</th>
                                    <th>Event Name</th>
                                    <th>Location</th>
                                    <th>Bowler ID</th>
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
                                    foreach ($scoreDeets as $singleScoreData) {
                                ?>
                                    <tr>
                                        <td><input type="checkbox" name="check_list[]" class="checkboxes" value="<?php echo $singleScoreData['id'];?>"></td>
                                        <td><a href="scoreDataSeasons.php?id=<?php echo $singleScoreData['id'];?>"><?php echo $i; ?></a></td>
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
                                        <td><?php echo $singleScoreData['bowlerid'];?></td>
                                        <td><a href="scoreDataSeasons.php?id=<?php echo $singleScoreData['id'];?>"><?php echo $singleScoreData['name']; ?></a></td>
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
                        <hr>
                            <a href="#" id="selCheckboxs">Select All</a>                        
                            <input type="submit" value="Edit Entries">
                        </form>
                        <?php
                                } else {
                        ?>
                            <table id="table_1_seasons_es" class="display">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Date</th>
                                    <th>Year</th>
                                    <th>Event Name</th>
                                    <th>Location</th>
                                    <th>Bowler ID</th>
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
                                    foreach ($scoreDeets as $singleScoreData) {
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
                                        <td><?php echo $singleScoreData['bowlerid'];?></td>
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
                        <?php
                                }
                            }
                        ?>
                        
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