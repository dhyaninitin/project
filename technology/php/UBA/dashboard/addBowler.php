<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] == 'staff' || $_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'eventstaff'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    // $bowlerDbID = $_GET['id'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `teams` ORDER BY `teamname` ASC");
        $sql->execute();
        $dataFetched = $sql->fetchAll();
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    $title = 'Add Bowler';

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
                    <h4>Add Bowler</h4>
                    <hr>
                    <?php
                        if ($_SESSION['userrole'] == 'admin') {
                    ?>
                    <form action="process/bowlerAdded.php" method="post">
                        <div class="form-group">
                            <label for="bowlerName">Name</label>
                            <input type="text" name ="bowlerName" id="bowlerName" required placeholder="Enter Bowler's Name">
                        </div>

                        <div class="form-group">
                            <label for="nickname1">Nickname</label>
                            <input type="text" name ="nickname1" id="nickname1" required placeholder="Enter Bowler's Nickname">
                        </div>

                        <div class="form-group">
                            <label for="sanction">Sanction No.</label>
                            <input type="text" name ="sanction" id="sanction" required placeholder="...">
                        </div>

                        <div class="form-group">
                            <label for="teamName">Team</label>
                            <select name="teamName" id="teamName">
                                <option value="-" disabled selected>-</option>
                                <?php
                                    foreach ($dataFetched as $team) {
                                ?>
                                <option value="<?php echo $team['teamname'];?>"><?php echo $team['teamname'];?></option>
                                <?php   
                                    }
                                ?>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="officeHeld">Office Held</label>
                            <select name="officeHeld" id="officeHeld">
                                <option value="-" selected>-</option>
                                <?php
                                    $officePosList = ['Owner','President','Vice President','Captain','Secretary','Treasurer'];
                                    for ($i=0; $i < sizeof($officePosList); $i++) { 
                                ?>
                                <option value="<?php echo $officePosList[$i];?>"><?php echo $officePosList[$i];?></option>
                                <?php   
                                    }
                                ?>
                            </select>

                            <div class="form-group">
                                <label for="enterAvg">Entering Average</label>
                                <input type="number" name ="enterAvg" id="enterAvg" required placeholder="Enter Bowler's Entering Average">
                            </div>
                            
                        </div>

                        <div class="form-group">
                            <input type="submit" value="Add Bowler">
                        </div>

                    </form>
                    <?php
                        } else {
                    ?>
                        <form action="process/bowlerAddedPresident.php" method="post">
                    <div class="row">
                         <div class="col-md-6">
                            <div class="form-group">
                                <label for="bowlerName">Name</label>
                                <input type="text" name ="bowlerName" id="bowlerName" required placeholder="Enter Bowler's Name">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="nickname1">Nickname</label>
                                <input type="text" name ="nickname1" id="nickname1" required placeholder="Enter Bowler's Nickname">
                            </div>
                        </div>
                    </div>
                    <div class="row">
                         <div class="col-md-6">
                            <div class="form-group">
                                <label for="sanction">Sanction No.</label>
                                <input type="text" name ="sanction" id="sanction" required placeholder="...">
                            </div>
                         </div> 
                         <div class="col-md-6">
                             <div class="form-group">
                                <label for="officeHeld">Office Held</label>
                                <select name="officeHeld" id="officeHeld" required>
                                    <option value="-" selected>-</option>
                                    <?php
                                        $officePosList = ['President','Vice President','Captain','Secretary','Treasurer','Owner'];
                                        for ($i=0; $i < sizeof($officePosList); $i++) { 
                                    ?>
                                    <option value="<?php echo $officePosList[$i];?>"><?php echo $officePosList[$i];?></option>
                                    <?php   
                                        }
                                    ?>
                                </select>

                               <!--  <div class="form-group">
                                    <label for="enterAvg">Entering Average</label>
                                    <input type="number" name ="enterAvg" id="enterAvg" required placeholder="Enter Bowler's Entering Average">
                                </div> -->
                                
                            </div>
                         </div>
                         
                     </div>  
                        <!-- <div class="form-group">
                            <label for="bstatus">Status</label>
                            <select name="bstatus" id="bstatus">
                                <option value="-" disabled selected>-</option>
                                <?php
                                    $statusList = ['A','Y','I'];
                                    $statusListExt = ['Active','Youth','Inactive'];
                                    for ($i=0; $i < sizeof($statusListExt); $i++) { 
                                ?>
                                <option value="<?php echo $statusList[$i];?>"><?php echo $statusListExt[$i];?></option>
                                <?php   
                                    }
                                ?>
                            </select>
                        </div> -->

                       
                        <div class="row">
                         <div class="col-md-6">
                            <div class="form-group">
                                <input type="submit" value="Add Bowler">
                            </div>
                        </div>
                        <div class="col-md-6">                                
                                 <div class="form-group" style="margin-top:8px">
                                    <a href="teamroster.php" class="deleteUser" value="">Cancel</a>                          
                            </div>
                        </div>  
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
