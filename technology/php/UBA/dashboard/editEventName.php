<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    // if($_SESSION['userrole'] != 'admin'){
    //     header("Location: /dashboard/home.php");
    // }

    if($_SESSION['userrole'] == 'staff' || $_SESSION['userrole'] == 'eventstaff' || $_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'president' || $_SESSION['userrole'] == 'owner'  || $_SESSION['userrole'] == 'secretary'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    try {
        $database = new Connection();
        $db = $database->openConnection();

        if (isset($_POST['changeEventName'])) {

                $dataType = $_POST['dataByEvent'];
                $eventSelected = $_POST['eventSelected'];
                $newEventName = $_POST['newEventName'];
                // $eventdate = date('Y-d-m',strtotime($_POST['datepicker']));

                

            if ($eventSelected != $newEventName) {
                if ($dataType == 'event') {

                    $sql = "UPDATE `bowlerdata` 
                            SET `event` = :newEventName
                            WHERE `event` = :eventSelected";
    
                    $stmt = $db->prepare($sql);                                  
    
                    $stmt->bindParam(':newEventName', $newEventName);
                    $stmt->bindParam(':eventSelected', $eventSelected);
                    $stmt->execute(); 

                    $_SESSION['success'] = 'Event name updated';
    
                } else {
                    
                    $sql = "UPDATE `bowlerdataseason` 
                            SET `event` = :newEventName
                            WHERE `event` = :eventSelected";
    
                    $stmt = $db->prepare($sql);                                  
    
                    $stmt->bindParam(':newEventName', $newEventName);
                    $stmt->bindParam(':eventSelected', $eventSelected);
                    $stmt->execute(); 

                    $_SESSION['success'] = 'Event name updated';
                }
            }
               
        }
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    $title = 'Change Event Name';

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

                    <div class="row">

                        <div class="col-6">
                            <h4>Change Event Name</h4>

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
                                <!-- <label for="dataSelected">Select</label> -->
                                    <input type="text" name="newEventName" placeholder="Enter new event name" required>
                                </div>
                                

                                <div class="form-group">
                                    <input type="submit" name="changeEventName" value="Change Name">
                                </div>
                            </form>
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