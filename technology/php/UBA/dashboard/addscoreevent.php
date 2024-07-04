<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] == 'president' || $_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'eventstaff' || $_SESSION['userrole'] == 'owner' || $_SESSION['userrole'] == 'secretary'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    try {
        $database = new Connection();
        $db = $database->openConnection();

        if (isset($_POST['eventSelected'])) {

            $eventId = $_POST['eventSelected'];

            $sql = $db->prepare("SELECT * FROM `teams` ORDER BY `teamname`");
            $sql->execute();
            $teams = $sql->fetchAll();   

            $sql = $db->prepare("SELECT * FROM `events` WHERE `id` = '$eventId'");
            $sql->execute();
            $selectedEvent = $sql->fetch();

            $_SESSION['eventSelected'] = $_POST['eventSelected'];

        }

        $sql = $db->prepare("SELECT * FROM `events`");
        $sql->execute();
        $events = $sql->fetchAll();
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    $title = 'Add Event Scores';

    include 'inc/header.php';

    if ($_SESSION['eventData'] == true) {
        $resetBtn = '<a href="resetInput.php?page=event" id="resetInputs">Reset Input Data</a>';
    }

    $eventList = ['Unholy Alliance', 'Rankings Qualifier', 'Last Man/Woman Standing', 'Team Relay', 'Last Team Standing', 'The Draft', 'Conference Classic', 'Gauntlet'];


?>

    <div class="addscore">
        <div class="col-12">
            <h4>Add Event Scores</h4>
            <?php echo $msg; ?>
            <hr>
            <?php
                if(!isset($_POST['eventSelected'])) {
            ?>                    

                    <h4>Select Event</h4>

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
                    
                    </div>
            <?php
                } else {
            ?>
                <form action="process/scoreAddedEvent.php" method="POST">

                    <div class="form-group">
                        <label for="year">Year:</label>
                        <select name="year" id="year" required>
                            <option value="-" disabled selected>Select</option>
                            <?php
                                $val = 17;
                                for ($i=0; $i < 3; $i++) { 
                                    $yearVal = '20'.$val;
                                    $finalVal = $yearVal . '/'. ($val+1);
                                        echo '<option value="'.$finalVal.'">'.$finalVal.'</option>';                                
                                    $val++;
                                }
                            ?>
                            
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="eventdate">Date:</label>
                        <input type="text" id="eventdate" name="eventdate" value="<?php echo $selectedEvent['eventdate'];?>" required readonly>
                    </div>

                    <div class="form-group">
                        <label for="mainEvent">Main Event:</label>
                        <input type="text" id="mainEvent" name="mainEvent" value="<?php echo $selectedEvent['mainevent'];?>" required readonly>
                    </div>

                    <div class="form-group">
                        <label for="subEvent">Sub Event:</label>
                        <input type="text" id="subEvent" name="subEvent" value="<?php echo $selectedEvent['subevent'];?>" required readonly>
                    </div>

                    <div class="form-group">
                        <label for="eventType">Location:</label>
                        <input type="text" id="eventType" name="eventType" value="<?php echo $selectedEvent['location'];?>" required readonly>
                    </div>

                    <?php echo $resetBtn; ?>

                    <hr>

                    <!-- <div class="bowlerSet">
                        <ul class="bowlerScoreEntry">
                            <li>Bowler</li>
                            <li>Name</li>
                            <li>Game 1</li>
                            <li>Game 2</li>
                            <li>Game 3</li>
                            <li>Series</li>
                        </ul>

                        <ul class="bowlerScoreEntry">
                            <li>
                                <label for="b1">Bowler 1:</label>
                            </li>
                            <li>
                                <select name="b1" id="b1" required >
                                    <option value="-" disabled selected>Select</option>
                                </select>
                            </li>
                            <li><input type="number" name="b1g1" id="b1g1" class="b1g" required></li>
                            <li><input type="number" name="b1g2" id="b1g2" class="b1g" required></li>
                            <li><input type="number" name="b1g3" id="b1g3" class="b1g" required></li>
                            <li><span id="sb1Total"></span></li>
                        </ul>

                        <ul class="bowlerScoreEntry">
                            <li>
                                <label for="b2">Bowler 2:</label>                        
                            </li>
                            <li>
                                <select name="b2" id="b2" required>
                                    <option value="-" disabled selected>Select</option>
                                </select>
                            </li>
                            <li><input type="number" name="b2g1" id="b2g1" class="b2g" required></li>
                            <li><input type="number" name="b2g2" id="b2g2" class="b2g" required></li>
                            <li><input type="number" name="b2g3" id="b2g3" class="b2g" required></li>
                            <li><span id="sb2Total"></span></li>
                        </ul>

                    </div> -->

                    <div class="bowlerSetTwo">
                        <div class="teamSel" id="teamSel1">
                            <span class="teamBoxNo">1</span>
                            <div>
                                <label for="teams1">Team:</label>
                                <select name="teams[]" id="1" class="teamSelectBox" required="" wtx-context="4650D591-E300-4347-8E2F-AF5BE0F94C41">
                                    <option value="-" disabled="" selected="">Select</option>
                                    <?php
                                        foreach($teams as $team) {
                                    ?>
                                    <option value="<?php echo $team['teamname'];?>"><?php echo $team['teamname'];?></option>
                                    <?php
                                        }
                                    ?>
                                </select>
                            </div>
                            <div class="loadingIcon">
                                <img src="<?=$base_url;?>images/30.gif">
                            </div>
                            <ul class="bowlerScoreEntry" id="eventHeaders"><li>Name</li><li>Game 1</li><li>Game 2</li><li>Game 3</li><li>Game 4</li><li>Game 5</li><li>Series</li></ul><ul class="bowlerScoreEntry events" id="b1"><li><select name="bowler[]" id="bowler1" required="" wtx-context="101EF6C7-96C3-45F1-B85F-E56D7D749F4C"><option value="-" disabled="" selected="">Select</option></select></li><li><input type="number" name="bowlergame1[]" id="b1g1" class="b1g" wtx-context="544FA020-6F3A-40A2-8D6B-1060EB51E175"></li><li><input type="number" name="bowlergame2[]" id="b1g2" class="b1g" wtx-context="6F20C6ED-501B-4ED9-9C83-45A1F07D463E"></li><li><input type="number" name="bowlergame3[]" id="b1g3" class="b1g" wtx-context="4EB92C39-78BE-4B81-8CB1-6B6186C3AEE5"></li><li><input type="number" name="bowlergame4[]" id="b1g4" class="b1g" wtx-context="1709461C-A8BD-4D46-811E-37FB5760B119"></li><li><input type="number" name="bowlergame5[]" id="b1g5" class="b1g" wtx-context="FAF79FE6-B587-45A6-9CF5-B8A862D3C651"></li><li><span id="b1Total"></span></li></ul></div>
                    </div>

                    <a href="#" class="addEventBowlerBtn" style="display: none">Add Bowler</a>
                    <a href="#" class="deleteEventBowlerBtn" style="display: none">Delete Bowler</a>

                    <hr>

                    <div class="form-group">
                        <input type="submit" value="Add Scores" name="submit">
                    </div>
                </form>
            <?php
                }
            ?>
            
        </div>
    </div>

<?php

$addscore = true;
include 'inc/footer.php';

?>
