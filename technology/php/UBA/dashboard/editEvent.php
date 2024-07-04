<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] == 'staff' || $_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'eventstaff' || $_SESSION['userrole'] == 'president' || $_SESSION['userrole'] == 'owner' || $_SESSION['userrole'] == 'secretary'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    try {
        $database = new Connection();
        $db = $database->openConnection();

        if (isset($_POST['eventSelected'])) {

            $eventId = $_POST['eventSelected'];

            $sql = $db->prepare("SELECT * FROM `teams` ORDER BY `teamname` ASC");
            $sql->execute();
            $teams = $sql->fetchAll();   

            $sql = $db->prepare("SELECT * FROM `events` WHERE `id` = '$eventId'");
            $sql->execute();
            $selectedEvent = $sql->fetch();

            if ($selectedEvent['mainevent'] == 'Other') {
                $eventList = ['Unholy Alliance', 'Rankings Qualifier', 'Last Man/Woman Standing', 'Team Relay', 'Last Team Standing', 'The Draft', 'Conference Classic', 'Gauntlet'];
            } elseif ($selectedEvent['mainevent'] == 'Mega Bowl') {
                $eventList = ['Open Men Singles', 'Open Women Singles', 'Unholy Alliance', '5 Man Capped', '5 Man Uncapped', '200-220 Singles', 'Men Under 200', 'Women Under 200', 'Franchise 645 Triples', 'Franchise Open Doubles', 'Franchise 450 Doubles', 'Franchise Open Triples', 'Open Mixed Doubles', 'Capped Mixed Doubles'];
            } elseif ($selectedEvent['mainevent'] == 'Battle Bowl') {
                $eventList = ['Unholy Alliance', 'Rankings Qualifier', 'Last Man/Woman Standing', 'Team Relay', 'Last Team Standing', 'The Draft', 'Conference Classic', 'Gauntlet'];
            }

            $_SESSION['eventSelected'] = $_POST['eventSelected'];

        }

        $sql = $db->prepare("SELECT * FROM `events`");
        $sql->execute();
        $events = $sql->fetchAll();
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    $title = 'Add Event';

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
                    <h4>Edit Event</h4>
                    <hr>
                    <?php
                        if(!isset($_POST['eventSelected'])) {
                    ?>                    

                            <form action="" method="post">
                                <div class="form-group">
                                <label for="eventSelected">Select Event</label>
                                <select name="eventSelected" id="eventSelected">
                                    <option value="-" disabled selected>Select</option>
                                    <?php
                                        foreach ($events as $event) {
                                    ?>
                                    <option style="text-transform: capitalize;" value="<?php echo $event['id']; ?>"><?php echo $event['mainevent']; ?> | <?php echo $event['subevent']; ?> | <?php echo $event['eventdate']; ?></option>
                                    <?php
                                        }
                                    ?>
                                </select>
                                </div>
                                

                                <div class="form-group">
                                    <input type="submit" value="Select Event">
                                </div>
                            </form>
                        
                    <?php
                        } else {
                    ?>
                    <form action="process/eventEdited.php" method="post">

                    <input type="hidden" name="eventid" value="<?php echo $selectedEvent['id'];?>">

                        <div class="form-group">
                            <label for="mainEvent">Main Event</label>
                            <input type="text" name="mainEvent" required readonly value="<?php echo $selectedEvent['mainevent'];?>">
                        </div>

                        <div class="form-group">
                            <label for="subEvent">Event Name:</label>
                            <select name="subEvent" id="subEvent" required>
                                <?php
                                    for ($i=0; $i < sizeof($eventList); $i++) { 
                                        if ($eventList[$i] == $selectedEvent['subevent']) {
                                ?>
                                    <option selected value="<?php echo $selectedEvent['subevent']?>"><?php echo $selectedEvent['subevent']?></option>
                                <?
                                        } else {
                                ?>
                                    <option value="<?php echo $eventList[$i]?>"><?php echo $eventList[$i]?></option>
                                <?php
                                        }
                                    }
                                ?>                           
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="datepicker">Date:</label>
                            <input type="text" id="datepicker" name="datepicker" required value="<?php echo $selectedEvent['eventdate'];?>">
                        </div>

                        <div class="form-group">
                            <label for="entryEvent">Registration per Bowler or Team:</label>
                            <input type="text" id="entryEvent" name="entryEvent" required readonly value="<?php echo $selectedEvent['evententry'];?>">
                            
                        </div>

                        <?php
                            if ($selectedEvent['evententry'] == 'team') {
                        ?>
                            <div id="perteam">
                                <div class="form-group">
                                    <label for="bowlersPerTeam">How many bowlers per Team:</label>
                                    <input type="number" id="bowlersPerTeam" name="bowlersPerTeam" required value="<?php echo $selectedEvent['perteam'];?>">
                                </div>
                                <div class="form-group">
                                    <label for="teamStructure">Bowlers form the Team from same roster or different rosters :</label>
                                    <select name="teamStructure" id="teamStructure">
                                        <option value="-" selected disabled>-</option>  
                                        <option value="same">Same Roster</option>                              
                                        <option value="different">Different Roster</option> 
                                    </select>
                                </div>
                            </div>
                        <?php
                            }
                        ?>

                        <div class="form-group">
                            <label for="squads">How Many Squads:</label>
                            <input type="number" name ="squads" id="squads" required value="<?php echo $selectedEvent['noOfSquads'];?>">
                        </div>

                        <div class="form-group">
                            <label for="maxBowlers">Max entry per squad:</label>
                            <input type="number" name ="maxBowlers" id="maxBowlers" required value="<?php echo $selectedEvent['maxEntryPerSquad'];?>">
                        </div>

                        <div class="form-group">
                            <label for="cost">Cost ($):</label>
                            <input type="number" name ="cost" id="cost" required value="<?php echo $selectedEvent['costPerBowler'];?>">
                        </div>

                        <div class="form-group">
                            <label for="eventType">Location:</label>
                            <input type="text" id="eventType" name="eventType" required value="<?php echo $selectedEvent['location'];?>">
                        </div>

                        <div class="form-group">
                            <label for="bowlerRegister">Bowlers can register for this event?</label>
                            <select name="bowlerRegister" id="bowlerRegister" required>
                                <?php
                                        if ($selectedEvent['bowlerregister'] == 0) {
                                ?>
                                    <option value="yes">Yes</option>                              
                                    <option value="no" selected>No</option> 
                                <?
                                        } else {
                                ?>
                                    <option value="yes" selected>Yes</option>                              
                                    <option value="no" >No</option> 
                                <?php
                                        }
                                ?>  
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="eventActive">Event Active</label>
                            <select name="eventActive" id="eventActive" required>
                                <?php
                                        if ($selectedEvent['active'] == 0) {
                                ?>
                                    <option value="yes">Yes</option>                              
                                    <option value="no" selected>No</option> 
                                <?
                                        } else {
                                ?>
                                    <option value="yes" selected>Yes</option>                              
                                    <option value="no" >No</option> 
                                <?php
                                        }
                                ?>  
                            </select>
                        </div>

                        <div class="form-group">
                            <input type="submit" value="Update Event">
                        </div>

                    </form>
                    <?php
                        }
                    ?>
                    
                </div>
            </div>
        </div>
    </div>

<?php

unset($_SESSION['success']);
unset($_SESSION['error']);
include 'inc/footer.php';

?>
