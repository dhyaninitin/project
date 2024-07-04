<?php

include_once '../session.php';
include_once '../connect.php';

// if($_SESSION['userrole'] != 'admin' || $_SESSION['userrole'] == 'eventstaff' || $_SESSION['userrole'] == 'staff'){
//     header("Location: /dashboard/home.php");
// }

$title = 'Register for Event';
include 'inc/header.php';

$useremail = $_SESSION['useremail'];

try {
    $database = new Connection();
    $db = $database->openConnection();

    $positive = 1;

    if (isset($_POST['eventRegister'])) {

        $eventSel = $_POST['eventRegister'];

        $sql = $db->prepare("SELECT * FROM `events` WHERE `id`=:eventSel");
        $sql->execute([':eventSel' => $eventSel]);
        $selectedEvent = $sql->fetch();

        $useremail = $_SESSION['useremail'];

        $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `uemail` = '$useremail'");
        $sql->execute();
        $bowlerDeets = $sql->fetch();

        $bowlerUBAID = $bowlerDeets['bowlerid'];
        $bowlername = $bowlerDeets['name'];

        if ($selectedEvent['teamstructure'] == 'same') {
            $teamname = $_SESSION['team'];

            $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `team`=:teamname");
            $sql->execute([':teamname' => $teamname]);
            $bowlersList = $sql->fetchAll();            
        }

        if ($selectedEvent['teamstructure'] == 'different') {
            $sql = $db->prepare("SELECT * FROM `teams` ORDER BY `teamname` ASC ");
            $sql->execute();
            $teams = $sql->fetchAll();
        }

    } else {
        $sql = $db->prepare("SELECT * FROM `events` WHERE `bowlerregister`=:positive AND `active`=:positive");
        $sql->execute([':positive' => $positive]);
        $eventsList = $sql->fetchAll();
    }

    
    
} catch (PDOException $e) {
    echo "There was some problem with the connection: " . $e->getMessage();
}

if (isset($_SESSION['success'])) {
    $msg = '<div class="col-12"><p class="successMsg">"'.$_SESSION['success'].'</p></div>';
} else if (isset($_SESSION['error'])) {
    $msg = '<div class="col-12"><p class="errorMsg">'.$_SESSION['error'].'</p></div>';
} else {
    $msg = '';
}


?>

<div class="passwordChange">
    <div class="container">
        <div class="row">

            <div class="col-12">
                <?php echo $msg; ?>
            </div>

            <?php
                if (!isset($_POST['eventRegister'])) {
            ?>
                <div class="col-12">
                    <form action="" method="post">

                        <div class="form-group">
                            <label for="eventRegister">Select Event</label>
                            <select name="eventRegister" id="eventRegister">
                                <option value="-" disabled selected>-</option>
                                <?php
                                foreach($eventsList as $event) {
                            ?>
                                <option value="<?php echo $event['id'];?>">
                                    <?php echo $event['eventname'];?>
                                </option>
                                <?php
                                }
                            ?>
                            </select>
                        </div>

                        <div class="form-group">
                            <input type="submit" value="Select Event">
                        </div>

                    </form>

                </div>
            <?php
                } else {
            ?>
                <div class="col-12">
                    <form action="process/eventRegistration.php" method="post">
                        <input type="hidden" name='event' required value='<?php echo $selectedEvent['id'];?>'>
                        <div class="form-group">
                            <label for="squad">Select Squad</label>
                            <select name="squad" id="squad">
                                <option value="-" disabled selected>-</option>
                                <?php
                                for ($i=1; $i <=sizeof($selectedEvent['noOfSquads']); $i++) { 
                            ?>
                                <option value="<?php echo $i;?>">
                                    <?php echo 'Squad '.$i;?>
                                </option>
                                <?php
                                }
                            ?>
                            </select>
                        </div>

                        <hr>

                        <?php
                            if ($selectedEvent['teamstructure'] == 'same') {
                        ?>
                            <h4>Team: <?php
                                if ($selectedEvent['teamstructure'] == 'same') {
                                    echo 'Teammates from same team';
                                }
                            ?></h4>
                            <div class='form-group'>
                                <label for="mainbowler">Your Entry</label>
                                <input type="text" id='mainbowler' name='teammates[]' value="<?php echo $bowlerUBAID.' | '.$bowlername;?>" required readonly>
                            </div>
                        <?php
                                for ($i=1; $i < $selectedEvent['perteam']; $i++) { 
                        ?>  
                            <div class='form-group'>
                                <label for="teammates">Select Teammate</label>
                                <select name="teammates[]" id="teammates" required>
                                    <option value="-" disabled selected>-</option>
                                    <?php
                                        foreach ($bowlersList as $bowler) {
                                    ?>
                                    <option value="<?php echo $bowler['bowlerid'].' | '.$bowler['name'];?>">
                                        <?php echo $bowler['name'];?>
                                    </option>
                                    <?php
                                    }
                                ?>
                                </select>
                            </div>
                        <?php 
                                } 
                            }
                            if ($selectedEvent['teamstructure'] == 'different') {
                        ?>
                            <h4>Team: <?php
                                if ($selectedEvent['teamstructure'] == 'same') {
                                    echo 'Teammates from same team';
                                }
                            ?></h4>
                            <div class='form-group'>
                                <label for="mainbowler">Your Entry</label>
                                <input type="text" id='mainbowler' name='teammates[]' value="<?php echo $bowlerUBAID.' | '.$bowlername;?>" required readonly>
                            </div>
                        <?php
                            for ($i=1; $i < $selectedEvent['perteam']; $i++) { 
                        ?>  
                            <div id="erTeamBox<?php echo $i; ?>">
                                <div class='form-group'>
                                    <label for="team<?php echo $i;?>">Select Teammate</label>
                                    <select name="teams[]" class="erTeam" id="team<?php echo $i;?>" required>
                                        <option value="-" disabled selected>-</option>
                                        <?php
                                            foreach ($teams as $team) {
                                        ?>
                                        <option value="<?php echo $team['teamname'];?>">
                                            <?php echo $team['teamname'];?>
                                        </option>
                                        <?php
                                        }
                                    ?>
                                    </select>
                                </div>
                                <div class='form-group'>
                                    <label for="teammates<?php echo $i;?>">Select Teammate</label>
                                    <select name="teammates[]" class="erTeammates" id="teammates<?php echo $i;?>" required>
                                        <option value="-" disabled selected>-</option>
                                    </select>
                                </div>
                            </div>
                            
                        <?php 
                                }
                            } 
                        ?>

                        <hr>

                        <div class="form-group">
                            <div class="fee">Fee for Event: $<?php echo $selectedEvent['costPerBowler'];?></div>
                        </div>

                        <div class="form-group">
                            <input type="submit" value="Register for Event">
                        </div>

                    </form>

                </div>
            <?php
                }
            ?>

            

        </div>
    </div>
</div>

<?php

unset($_SESSION['success']);
unset($_SESSION['error']);
// $registerevent = true;
include 'inc/footer.php';

?>