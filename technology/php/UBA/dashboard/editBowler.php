<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] == 'staff' || $_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'eventstaff'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    $bowlerDbID = $_GET['id'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `id` = '$bowlerDbID'");
        $sql->execute();
        $dataFetched = $sql->fetch();
        //var_dump($dataFetched);

        if($_SESSION['userrole'] == 'president'){
            if (strtolower($_SESSION['team']) != strtolower($dataFetched['team'])) {
                header("Location: ".$base_url."/dashboard/home.php");
            }
        }

        $sql = $db->prepare("SELECT * FROM `teams` ORDER BY `teamname` ASC");
        $sql->execute();
        $teamDeets = $sql->fetchAll();
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    $title = 'Edit Bowler';

    include 'inc/header.php';

    if (isset($_SESSION['success'])) {
        $msg = '<div class="col-12"><p class="successMsg">'.$_SESSION['success'].'</p></div>';
    } else if (isset($_SESSION['error'])) {
        $msg = '<div class="col-12"><p class="errorMsg">'.$_SESSION['error'].'</p></div>';
    } else {
        $msg = '';
    }
    
    //Modify by team css for readonly logic
    $roleFlag='';

    if($_SESSION['userrole'] == 'president' || $_SESSION['userrole'] == 'owner' || $_SESSION['userrole'] == 'secretary'){
        $roleFlag=true;
    }else{
        $roleFlag=false;
    }

?>

    <div class="users">
        <?php echo $msg; ?>
        
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <?php
                        if($_SESSION['userrole'] == 'admin'){
                    ?>
                        <a href="<?=$base_url?>/dashboard/roster.php" class="backTeamBtn"><i class="fas fa-chevron-left"></i> Back to Roster</a>
                        <hr>
                    <?php
                        }else{
                     ?>       
                        <a href="<?=$base_url?>/dashboard/teamroster.php" class="backTeamBtn"><i class="fas fa-chevron-left"></i> Back to Roster</a>
                        <hr>
                     <?php    
                        }
                    ?>
                    <h4>Edit Bowler</h4>
                    <?php
                        if($_SESSION['userrole'] == 'admin'){
                            echo 'Bowler ID: '. $dataFetched['bowlerid'];
                        }
                    ?>
                    <hr>
                    <form action="process/bowlerEdits.php" method="post" id="editbowler">
                        <input type="hidden" name="userID" id="userID" value="<?php echo $bowlerDbID;?>">
                         
                        <div class="row">
                             <div class="col-md-6">
                                <div class="form-group">
                                    <label for="bowlerID">Bowler ID</label>
                                    <input type="text" name ="bowlerID" class="readonly" id="bowlerID" pattern="[0-9].{2,}+-[0-9].{4,}" value="<?php echo $dataFetched['bowlerid']; ?>" required placeholder="Enter Bowler's Name">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="bowlerName">Name</label>
                                    <input type="text" name ="bowlerName" id="username" value="<?php echo $dataFetched['name']; ?>" required placeholder="Enter Bowler's Name">
                                </div>
                            </div>    
                        </div>
                          
                        
                        <div class="row">
                             <div class="col-md-6">
                                <div class="form-group">
                                    <label for="nickname1">Nickname</label>
                                    <input type="text" name ="nickname1" id="nickname1" value="<?php echo $dataFetched['nickname1']; ?>" required placeholder="Enter Bowler's Nickname">
                                </div>
                             </div>
                             <div class="col-md-6">
                                <div class="form-group">
                                    <label for="nickname1">Entering Average</label>
                                    <input type="text" name ="enteringAverage" id="enteringAverage" value="<?php echo $dataFetched['enteringAvg']; ?>" required class="readonly" placeholder="Enter Entering Average">
                                </div>
                             </div>
                         </div>
                          <div class="row">
                             <div class="col-md-6">
                                <div class="form-group">
                                    <label for="nickname1">UBA Average</label>
                                    <input type="text" name ="ubaAverage" id="sanctionNumber" value="<?php echo $dataFetched['ubaAvg']; ?>" required class="readonly" placeholder="Enter UBA Average">
                                </div>
                             </div>
                             <div class="col-md-6">
                                <div class="form-group">
                                    <label for="nickname1">Season Tour Avg</label>
                                    <input type="text" name ="seasonTourAvg" id="seasonTourAvg" value="<?php echo $dataFetched['seasontourAvg']; ?>" required class="readonly" placeholder="Enter Season Tour Avg">
                                </div>
                             </div>
                         </div>
                          <div class="row">
                             <div class="col-md-6">
                                <div class="form-group">
                                    <label for="sanction">Sanction No.</label>
                                    <input type="text" name ="sanction" id="sanction" value="<?php echo $dataFetched['sanction']; ?>" required placeholder="Enter Bowler's Nickname">
                                </div>

                             </div>
                             <div class="col-md-6">

                                <?php
                                    if($_SESSION['userrole'] == 'admin'){
                                ?>
                                    <div class="form-group">
                                        <label for="teamName">Team</label>
                                        <select name="teamName" id="teamName">
                                            <?php
                                                foreach ($teamDeets as $team) {
                                                    if (strtolower($dataFetched['team']) == strtolower($team['teamname'])) {  
                                            ?>
                                                <option value="<?php echo $team['teamname'];?>" selected><?php echo $team['teamname'];?></option>
                                            <?php
                                                    } else {
                                            ?>
                                                <option value="<?php echo $team['teamname'];?>"><?php echo $team['teamname'];?></option>
                                            <?php
                                                    }
                                                }
                                            ?>
                                        </select>
                                    </div>
                                <?php
                                    }
                                ?>


                                <!--  -->


                        <?php
                            if($_SESSION['userrole'] == 'admin'){
                        ?>

                        <div class="form-group">
                            <label for="officeHeld">Office Held</label>
                            <select name="officeHeld" id="officeHeld">
                            <option value="-">-</option>
                                <?php
                                    $officePosList = ['Owner','President','Vice President','Captain','Secretary','Treasurer'];
                                    if (in_array($dataFetched['officeheld'], $officePosList)) {
                                        for ($i=0; $i < sizeof($officePosList); $i++) { 
                                            if ($dataFetched['officeheld'] == $officePosList[$i]) {
                                            ?>
                                                <option value="<?php echo $dataFetched['officeheld']; ?>" <?php echo 'selected="selected"';?>><?php echo $officePosList[$i];?></option>
                                            <?php
                                            } else {
                                            ?>
                                                <option value="<?php echo $officePosList[$i];?>" ><?php echo $officePosList[$i];?></option>
                                            <?php
                                            }
                                        }
                                    } else {
                                        echo '<option value="-" selected>-</option>';
                                        for ($i=0; $i < sizeof($officePosList); $i++) { 
                                            ?>
                                                <option value="<?php echo $officePosList[$i];?>"><?php echo $officePosList[$i];?></option>
                                            <?php
                                            }
                                        }
                                ?>
                                </select>
                            </div>

                            <?php
                                } 
                                
                                if ($dataFetched['officeheld'] == 'President' || $dataFetched['officeheld'] == 'Owner') {
                            ?>
                            <div class="form-group">
                                <p>This bowler is the President or the Owner of the Team. Please contact the UBA admin to make changes to the Office Held position for this bowler.</p>
                            </div>
                            <?php
                                } else {
                            ?>
                                <div class="form-group">
                                    <label for="officeHeld">Office Held</label>
                                    <select name="officeHeld" id="officeHeld">
                                    <option value="-">-</option>
                                        <?php
                                            $officePosList = ['Owner','President','Vice President','Captain','Secretary','Treasurer'];
                                            if (in_array($dataFetched['officeheld'], $officePosList)) {
                                                for ($i=0; $i < sizeof($officePosList); $i++) { 
                                                    if ($dataFetched['officeheld'] == $officePosList[$i]) {
                                                    ?>
                                                        <option value="<?php echo $dataFetched['officeheld']; ?>" <?php echo 'selected="selected"';?>><?php echo $officePosList[$i];?></option>
                                                    <?php
                                                    } else {
                                                    ?>
                                                        <option value="<?php echo $officePosList[$i];?>" ><?php echo $officePosList[$i];?></option>
                                                    <?php
                                                    }
                                                }
                                            } else {
                                                echo '<option value="-" selected>-</option>';
                                                for ($i=0; $i < sizeof($officePosList); $i++) { 
                                                    ?>
                                                        <option value="<?php echo $officePosList[$i];?>"><?php echo $officePosList[$i];?></option>
                                                    <?php
                                                    }
                                                }
                                        ?>
                                        </select>
                                    </div>
                            <?php
                                }
                            ?>

                             </div>
                         </div>



                        

                        
                        

                        

                        <!-- <div class="form-group">
                            <label for="bstatus">Status</label>
                            <select name="bstatus" id="bstatus">
                                <?php
                                    $statusList = ['A','Y','I'];
                                    $statusListExt = ['Active','Youth','Inactive'];
                                    if (in_array($dataFetched['bstatus'], $statusList)) {
                                        for ($i=0; $i < sizeof($statusList); $i++) { 
                                            if ($dataFetched['bstatus'] == $statusList[$i]) {
                                            ?>
                                                <option value="<?php echo $dataFetched['bstatus'];?>" selected><?php echo $statusListExt[$i];?></option>
                                            <?php
                                            } else {
                                            ?>
                                                <option value="<?php echo $dataFetched['bstatus'];?>" ><?php echo $statusListExt[$i];?></option>
                                            <?php
                                            }
                                        }
                                    } else {
                                        echo '<option value="-" disabled selected>-</option>';
                                        for ($i=0; $i < sizeof($statusList); $i++) { 
                                            if ($dataFetched['bstatus'] == $statusList[$i]) {
                                            ?>
                                                <option value="<?php echo $statusList[$i];?>" selected><?php echo $statusListExt[$i];?></option>
                                            <?php
                                            } else {
                                            ?>
                                                <option value="<?php echo $statusList[$i];?>" ><?php echo $statusListExt[$i];?></option>
                                            <?php
                                            }
                                        }
                                    }
                                    
                                
                                ?>
                            </select>
                        </div> -->


                            <?php
                                if($_SESSION['userrole'] == 'admin'){
                            ?>
                                <div class="form-group">
                                    <label for="uemail">Bowler Email: (New Email ID will need to be verified by the bowler)</label>
                                    <input type="email" name ="uemail" id="uemail" value="<?php echo $dataFetched['uemail']; ?>">
                                </div>

                                <div class="form-group">
                                    <label for="phone">Phone Number:</label>
                                    <input type="number" name ="phone" id="phone" required value="<?php echo $dataFetched['phone']; ?>" placeholder="Enter Bowler's Entering Average">
                                </div>
                            <?php
                                }
                            ?>

                            

                            <?php
                                if($_SESSION['userrole'] == 'admin'){
                            ?>
                                <div class="form-group">
                                    <label for="enterAvg">Entering Average</label>
                                    <input type="number" name ="enterAvg" id="enterAvg" required value="<?php echo $dataFetched['enteringAvg']; ?>" placeholder="Enter Bowler's Entering Average">
                                </div>
                            <?php
                                }
                            ?>
                            
                        </div>
                       

                           
                        
                </div>

                 <div class="row">
                            <div class="col-md-6">
                                 <div class="form-group">
                                    <input type="submit" value="Update Bowler Details">
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
                    if($_SESSION['userrole'] == 'president' || $_SESSION['userrole'] == 'owner' || $_SESSION['userrole'] == 'secretary'){
                ?>
                    <div class="col-12">
                        <hr>
                        <a href="process/releaseBowler.php?id=<?php echo $bowlerDbID;?>" class="deleteUser"><i class="fas fa-times"></i> Release Bowler</a>
                    </div>
                <?php
                    }
                ?>

                <?php
                    if($_SESSION['userrole'] == 'admin'){
                ?>
                    <div class="col-12">
                    <hr>
                        <a href="process/releaseBowler.php?id=<?php echo $bowlerDbID;?>" class="deleteUser" id="relbowler"><i class="fas fa-times"></i> Release Bowler</a>
                        <hr>
                        <a href="process/suspendBowler.php?id=<?php echo $bowlerDbID;?>" class="deleteUser" id="susbowler"><i class="fas fa-times"></i> Suspend Bowler</a>
                        <hr>
                        <a href="process/deleteBowler.php?id=<?php echo $bowlerDbID;?>" class="deleteUser finaldelete" id="delbowler"><i class="fas fa-times"></i> Delete Bowler</a>
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
include 'inc/footer.php';

?>
<script type="text/javascript">
    var role= <?php echo $roleFlag ?>;
    console.log(role);
    if(role){
        $('.readonly').attr('disabled', 'disabled');
    } else {
        $('.readonly').removeAttr('disabled');
    }

//    var maker='Maker';

    // if (role === maker){
    //     $('#CMCNA1').attr('readonly', 'readonly');
    // } else {
    //     $('#CMCNA1').removeAttr('readonly');
    // }
</script>