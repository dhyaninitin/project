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

        $sql = $db->prepare("SELECT * FROM `teams` ORDER BY `teamname` ASC");
        $sql->execute();
        $dataFetched = $sql->fetchAll();
        
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

    $eventList = ['Unholy Alliance', 'Rankings Qualifier', 'Last Man/Woman Standing', 'Team Relay', 'Last Team Standing', 'The Draft', 'Conference Classic', 'Gauntlet'];

?>

    <div class="users">
        <?php echo $msg; ?>
        
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <h4>Add Event</h4>
                    <hr>
                    <form action="process/eventAdded.php" method="post">

                        <div class="form-group">
                            <label for="mainEvent">Main Event</label>
                            <select name="mainEvent" id="mainEvent">
                                <option value="-" disabled selected>-</option>
                                <option value="Mega Bowl"  >Mega Bowl</option>
                                <option value="Battle Bowl"  >Battle Bowl</option>
                                <option value="Other"  >Other</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="subEvent">Event Name:</label>
                            <select name="subEvent" id="subEvent" required>
                                <option value="-" selected disabled>-</option>                                
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="datepicker">Date:</label>
                            <input type="text" id="datepicker" name="datepicker" required>
                        </div>

                        <div class="form-group">
                            <label for="entryEvent">Registration per Bowler or Team:</label>
                            <select name="entryEvent" id="entryEvent" required>
                                <option value="-" selected disabled>-</option>  
                                <option value="bowler">Per Bowler</option>                              
                                <option value="team">Per Team</option> 
                            </select>
                        </div>

                        <div id="perteam">
                            <div class="form-group">
                                <label for="bowlersPerTeam">How many bowlers per Team:</label>
                                <input type="number" id="bowlersPerTeam" name="bowlersPerTeam">
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

                        <div class="form-group">
                            <label for="squads">How Many Squads:</label>
                            <input type="number" name ="squads" id="squads" required >
                        </div>

                        <div class="form-group">
                            <label for="maxBowlers">Max entry per squad:</label>
                            <input type="number" name ="maxBowlers" id="maxBowlers" required >
                        </div>

                        <div class="form-group">
                            <label for="cost">Cost ($):</label>
                            <input type="number" name ="cost" id="cost" required >
                        </div>

                        <div class="form-group">
                            <label for="eventType">Location:</label>
                            <input type="text" id="eventType" name="eventType" required>
                        </div>

                        <div class="form-group">
                            <label for="bowlerRegister">Bowlers can register for this event?</label>
                            <select name="bowlerRegister" id="bowlerRegister" required>
                                <option value="-" selected disabled>-</option>  
                                <option value="yes">Yes</option>                              
                                <option value="no">No</option> 
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="eventActive">Event Active</label>
                            <select name="eventActive" id="eventActive" required>
                                <option value="-" selected disabled>-</option>  
                                <option value="yes">Yes</option>                              
                                <option value="no">No</option> 
                            </select>
                        </div>

                        <div class="form-group">
                            <input type="submit" value="Add Event">
                        </div>

                    </form>
                    
                </div>
            </div>
        </div>
    </div>

<?php

unset($_SESSION['success']);
unset($_SESSION['error']);
include 'inc/footer.php';

?>
