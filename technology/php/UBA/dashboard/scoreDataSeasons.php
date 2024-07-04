<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] != 'admin'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    $userID = $_GET['id'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `id` = '$userID'");
        $sql->execute();
        $dataFetched = $sql->fetch();

        $sql = $db->prepare("SELECT * FROM `teams` ORDER BY `teamname` ASC");
        $sql->execute();
        $allTeams = $sql->fetchAll();
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    $title = 'Edit Season Score Data';

    include 'inc/header.php';

    if (isset($_SESSION['success'])) {
        $msg = '<div class="col-12"><p class="successMsg">'.$_SESSION['success'].'</p></div>';
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
                <h4>Edit Event Score</h4>
                <form action="process/scoreSeasonEdits.php" method="post">
                    <input type="hidden" name="userID" id="userID" value="<?php echo $userID;?>">

                    <div class="row">
                        <div class="col-12 col-sm-6">
                            <div class="form-group">
                                <label for="datepicker">Date:</label>
                                <input type="text" id="datepicker" name="datepicker" required value="<?php 
                                    //Our YYYY-MM-DD date.
                                    $ymd = $dataFetched['eventdate'];
                                    //Convert it into a timestamp.
                                    $timestamp = strtotime($ymd);
                                    //Convert it to DD-MM-YYYY
                                    $dmy = date("m-d-Y", $timestamp);
                                    //Echo it
                                    echo $dmy; ?>">
                            </div>

                            <div class="form-group">
                                <label for="year">Year:</label>
                                <select name="year" id="year" required>
                                    <option value="-" disabled>Select</option>
                                    <?php
                                    $val = 17;
                                    for ($i=0; $i < 3; $i++) { 
                                        $yearVal = '20'.$val;
                                        $finalVal = $yearVal . '/'. ($val+1);
                                        
                                        if ($dataFetched['year'] == $finalVal) {
                                            echo '<option value="'.$finalVal.'" selected>'.$finalVal.'</option>';
                                        } else {
                                            echo '<option value="'.$finalVal.'">'.$finalVal.'</option>';
                                        }
                                        $val++;
                                    }
                                ?>

                                </select>
                            </div>

                            <div class="form-group">
                                <label for="eventName">Event Name:</label>
                                <input type="text" id="eventName" name="eventName" required value="<?php echo $dataFetched['event']?>">
                            </div>

                            <div class="form-group">
                                <label for="location">Location:</label>
                                <input type="text" id="location" name="location" required value="<?php echo $dataFetched['location']?>">
                            </div>

                            <div class="form-group">
                                <label for="team">Team:</label>
                                <select name="team" id="team" required>
                                    <option value="-" disabled selected>Select</option>
                                    <?php
                                    foreach ($allTeams as $team) {
                                        $teamname = $team['teamname'];

                                        if ($dataFetched['team'] == $teamname) {
                                            echo '<option value="'.$teamname.'" selected>'.$teamname.'</option>';
                                        } else {
                                            echo '<option value="'.$teamname.'">'.$teamname.'</option>';
                                        }
                                    }
                                ?>
                                </select>
                            </div>

                            
                        </div>

                        <div class="col-12 col-sm-6">

                        <div class="form-group">
                                <label for="bowler">Bowler:</label>
                                <input type="text" id="bowler" name="bowler" required value="<?php echo $dataFetched['name']?>">
                            </div>
                            
                            <div class="form-group">
                                <label for="game1">Game 1:</label>
                                <input type="number" id="game1" name="game1" required value="<?php echo $dataFetched['game1']?>">
                            </div>

                            <div class="form-group">
                                <label for="game2">Game 2:</label>
                                <input type="number" id="game2" name="game2" required value="<?php echo $dataFetched['game2']?>">
                            </div>

                            <div class="form-group">
                                <label for="game3">Game 3:</label>
                                <input type="number" id="game3" name="game3" required value="<?php echo $dataFetched['game3']?>">
                            </div>
                        </div>
                    </div>



                    <div class="form-group">
                        <input type="submit" value="Update Score Data">
                    </div>

                </form>
            </div>

            <div class="col-12">
                <hr>
                <a href="process/deleteScoreSeasonEntry.php?id=<?php echo $userID;?>" class="deleteUser"><i class="fas fa-times"></i>
                    Delete Score Entry</a>
            </div>
        </div>
    </div>
</div>

<?php

unset($_SESSION['success']);
unset($_SESSION['error']);
include 'inc/footer.php';

?>