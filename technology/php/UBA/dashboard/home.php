<?php

// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

    include_once '../session.php';
    include_once '../connect.php';
    // include_once 'checkuser.php';

    $title = 'Home';
    include 'inc/header.php';

    $useremail = $_SESSION['useremail'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        // if ($_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'president' || $_SESSION['userrole'] == 'owner') {

        // $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `uemail` = :useremail");
        // $sql->execute([':useremail' => $useremail]);
        // $bowlerDeets = $sql->fetch();
        // $bowlerUBAID = $bowlerDeets['bowlerid'];
        // $bowlerEnteringAvg = $bowlerDeets['enteringAvg'];
        // $bowlerEnteringAvg = (int)$bowlerEnteringAvg;
        // $ubaAvg = $bowlerDeets['ubaAvg'];
        // $seasonTourAvg = $bowlerDeets['seasontourAvg'];

        // $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$bowlerUBAID'");
        // $sql->execute();
        // $dataFetchedEvents = $sql->fetchAll();

        // $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerUBAID'");
        // $sql->execute();
        // $dataFetchedSeasonTour = $sql->fetchAll();

        // }

        if ($_SESSION['userrole'] == 'admin') {
            $approved = 0;

            $nickChanged = 1;

            $sql = $db->prepare("SELECT * FROM `presidency` WHERE `approved` = :approved");
            $sql->execute([':approved' => $approved]);
            $presidentClaims = $sql->fetchAll();

            $sql = $db->prepare("SELECT * FROM `ownership` WHERE `approved` = :approved");
            $sql->execute([':approved' => $approved]);
            $ownerClaims = $sql->fetchAll();

            $sql = $db->prepare("SELECT * FROM `bowlerTransfers` WHERE `approved` = :approved");
            $sql->execute([':approved' => $approved]);
            $transferClaims = $sql->fetchAll();

            $sql = $db->prepare("SELECT * FROM `bowlerupdates` WHERE `nicknameChanged` = :nickChanged");
            $sql->execute([':nickChanged' => $nickChanged]);
            $nicknameChange = $sql->fetchAll();

            $sql = $db->prepare("SELECT * FROM `bowlersreleased` WHERE `approved` = :approved AND `removedby` != 'Admin' ORDER BY id DESC");
            $sql->execute([':approved' => '1']);
            $bowlersReleased = $sql->fetchAll();

            $nonactive = 0;

            $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `active` = :nonactive");
            $sql->execute([':nonactive' => $nonactive]);
            $nonactivebowlers = $sql->fetchAll();
        }

        

        if ($_SESSION['userrole'] != 'admin' || $_SESSION['userrole'] != 'staff') {
            $teamName = $_SESSION['team'];
            
            $sql = $db->prepare("SELECT * FROM `teams` WHERE `teamname` = :teamName ORDER BY `teamname` ASC");
            $sql->execute([':teamName' => $teamName]);
            $teamDeets = $sql->fetch();

            $sql = $db->prepare("SELECT * FROM `presidency` WHERE `team` = :teamName");
            $sql->execute([':teamName' => $teamName]);
            $presidency = $sql->fetch();
            $sql = $db->prepare("SELECT * FROM `ownership` WHERE `team` = :teamName");
            $sql->execute([':teamName' => $teamName]);
            $ownership = $sql->fetch();

            $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `uemail` = :useremail");
            $sql->execute([':useremail' => $useremail]);
            $bowlerDeets = $sql->fetch();
            
            $bowlerUBAID = $bowlerDeets['bowlerid'];
            $bowlerEnteringAvg = $bowlerDeets['enteringAvg'];
            $bowlerEnteringAvg = (int)$bowlerEnteringAvg;
            $ubaAvg = $bowlerDeets['ubaAvg'];
            $seasonTourAvg = $bowlerDeets['seasontourAvg'];
    
            $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$bowlerUBAID'");
            $sql->execute();
            $dataFetchedEvents = $sql->fetchAll();
    
            if($seasonTourYearFlag == null){
                $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerUBAID'");
            }else{
                $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerUBAID' AND eventdate ='9-9-20'");
            }
            
            $sql->execute();
            $dataFetchedSeasonTour = $sql->fetchAll();

            $sql = $db->prepare("SELECT distinct(year) as SeasonTourYear FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerUBAID'");
            $sql->execute();
            $dataFetchedSeasonTourYear = $sql->fetchAll();


            $sql = $db->prepare("SELECT distinct(year) as EventsTourYear FROM `bowlerdata` WHERE `bowlerid` = '$bowlerUBAID'");
            $sql->execute();
            $dataFetchedEventsYear = $sql->fetchAll();
			
		
			
			$gametotalValue = 0;
        	$numbers = 0;
        	foreach ($dataFetchedSeasonTour as $seasonVal) {
        		$gameValue1 += $seasonVal['game1'];
        		$gameValue2 += $seasonVal['game2'];
        		$gameValue3 += $seasonVal['game3'];
        		$gametotalValue = $gameValue1+ $gameValue2 + $gameValue3;
        		$numbers++;
        	}
        	
        	$seasonTourAvg = $gametotalValue / $numbers;
			// $seasonTourAvg

            //var_dump($dataFetchedEventsYear);
        }
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    if (isset($_SESSION['success'])) {
        $msg = '<div class="col-12"><p class="successMsg">'.$_SESSION['success'].'</p></div>';
    } else if (isset($_SESSION['error'])) {
        $msg = '<div class="col-12"><p class="errorMsg">'.$_SESSION['error'].'</p></div>';
    } else {
        $msg = '';
    }

?>
<style type="text/css">
    .modal-backdrop {
   position: inherit;
    top: 0;
    right: 0;
    bottom: 0;
    /* left: 0; */
    /* z-index: 1040; */
    background-color: #000;
}

.modal {
    position: sticky;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1050;
    display: none;
    overflow: hidden;
    outline: 0;
}
.modal.show .modal-dialog {
    -webkit-transform: translate(0,0);
    transform: translate(0,0);
    max-width: 75%;
}

button.btn {
    font-size: 15px;
}
</style>

<!-- bootsrap modal -->

<div class="modal" id="bowlerTransferModal" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Bowler Transfer Request</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to transfer a bowler?</p>
      </div>
      <input type="text" id="bowlerId" name="" hidden="hidden">
      <input type="text" id="tableId" name="" hidden="hidden">
      <div class="modal-footer">
        <button type="button" onclick="saveAndAddToTheRoster()" class="btn btn-primary">Yes, & update the team's submitted roster</button>
        <button type="button" onclick="onlyApproveTranfer()" class="btn btn-success" >Yes, But approve the bowler transfer only</button>
        <button type="button" data-dismiss="modal"  class="btn btn-secondary" >Cancel</button>
      </div>
    </div>
  </div>
</div>

<!-- Bootstrap modal end -->

<!-- For add bowler -->

<div class="modal" id="addBowlerModal" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Add Bowler Request</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to add a bowler?</p>
      </div>
      <input type="text" id="bowlerIdForAdd"  name="" hidden="hidden">
      <div class="modal-footer">
        <button type="button" onclick="addAndAddToTheRoster()" class="btn btn-primary">Yes, & update the team's submitted roster</button>
        <button type="button" onclick="addOnly()" class="btn btn-success" >Yes, But add bowler to the team only</button>
        <button type="button" data-dismiss="modal"  class="btn btn-secondary" >Cancel</button>
      </div>
    </div>
  </div>
</div>

<!-- For add bowler -->

<div class="container">
    <div class="row">
        <?php echo $msg; ?>

        <div class="col-12">
            <?php
            //print_r($nonactivebowlers);
                if ($_SESSION['userrole'] == 'admin') {
                    if ($nonactivebowlers) {
            ?>

            <h4 class="claimRequests">Bowlers added by Team President/Owner</h4>
            <table id="nonactive_table_home" class="display">
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Bowler ID</th>
                        <th>Name</th>
                        <th>Team</th>
                        <th>Nickname</th>
                        <th>Sanction</th>
                        <th>Approve</th>
                        <th>Decline</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                        $i = 1;
                        foreach ($nonactivebowlers as $singleScoreData) {
                    ?>
                    <tr>
                        <td>
                            <?php echo $i; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['bowlerid']; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['name']; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['team'];?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['nickname1'];?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['sanction'];?>
                        </td>
                        <!-- onclick="showConfirmation('transfer','<?=$bowlerId?>','<?=$id?>')" 
                        href="process/activateBowler.php?id=y&bowler=<?php echo $singleScoreData['bowlerid'];?>"
                    -->
                     <?php 
                            $bowlerId = $singleScoreData['bowlerid'];
                            //$id= $singleScoreData['id'];
                        ?>
                       
                         <td class="approve"><a style="cursor: pointer;"  onclick="showConfirmationAddBowler('add','<?=$bowlerId?>')"><i
                                    class="fas fa-check"></i></a></td>
                        <td class="decline"><a href="process/activateBowler.php?id=n&bowler=<?php echo $singleScoreData['bowlerid'];?>"><i
                                    class="fas fa-times"></i></a></td>
                    </tr>
                    <?php
                        $i++;
                        }
                    ?>
                </tbody>
            </table>

            <?php
                    } else {
                        echo 'No Bowlers added by Presidents/Owners <br><hr>';
                    }
                }
            ?>
        </div>

        

        <div class="col-12">
            <?php
                if ($_SESSION['userrole'] == 'admin') {
                    if ($bowlersReleased) {
            ?>

            <h4 class="claimRequests">Bowlers released/suspended by Team President/Owner</h4>
            <table id="released_bowlers_table_home" class="display">
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Bowler ID</th>
                        <th>Name</th>
                        <th>Team</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th style="display:none;">Approve</th>
                        <th>Close</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                        $i = 1;
                        foreach ($bowlersReleased as $singleScoreData) {
                    ?>
                    <tr>
                        <td>
                            <?php echo $i; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['bowlerid']; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['bowler']; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['team'];?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['currentstatus'];?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['datesubmitted'];?>
                        </td>
                        <td style="display:none;" class="approve"><a href="process/approveRelease.php?id=y&bowler=<?php echo $singleScoreData['bowlerid'];?>"><i
                                    class="fas fa-check"></i></a></td>
                                    
                        <!--<td class="decline">-->
                        <!--	<a href="process/approveRelease.php?id=n&bowler=<?php echo $singleScoreData['bowlerid'];?>"><i-->
                        <!--            class="fas fa-times"></i></a></td>-->
                        <td class="decline">
                        	<a onclick="approveRelease('<?=$singleScoreData['bowlerid'];?>')"><i class="fas fa-times"></i></a>
                        </td>
                                    
                    </tr>
                    <?php
                        $i++;
                        }
                    ?>
                </tbody>
            </table>

            <?php
                    } else {
                        echo 'No Bowlers released/suspended by Presidents/Owners <br><hr>';
                    }
                }
            ?>
            
        </div>

            
        <div class="col-12">
            <hr>
            <?php
                if ($_SESSION['userrole'] == 'admin') {
                    if ($presidentClaims) {
            ?>
            <h4 class="claimRequests">President Requests</h4>
            <table id="president_table_home" class="display">
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Bowler ID</th>
                        <th>Name</th>
                        <th>Team</th>
                        <th>Approve</th>
                        <th>Decline</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                                    $i = 1;
                                    foreach ($presidentClaims as $singleScoreData) {
                                ?>
                    <tr>
                        <td>
                            <?php echo $i; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['bowlerid']; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['bowler']; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['team'];?>
                        </td>
                        <td class="approve"><a href="process/acceptPresident.php?id=y&bowler=<?php echo $singleScoreData['bowlerid'];?>"><i
                                    class="fas fa-check"></i></a></td>
                        <td class="decline"><a href="process/acceptPresident.php?id=n&bowler=<?php echo $singleScoreData['bowlerid'];?>"><i
                                    class="fas fa-times"></i></a></td>
                    </tr>
                    <?php
                                    $i++;
                                    }
                                ?>
                </tbody>
            </table>
            <?php
                    } else {
                        echo 'No Active President Claims <br>';
                    }

                    if ($ownerClaims) {
            ?>
            <hr>
            <h4 class="claimRequests">Ownership Requests</h4>
            <table id="owner_table_home" class="display">
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Bowler ID</th>
                        <th>Name</th>
                        <th>Team</th>
                        <th>Approve</th>
                        <th>Decline</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                        $i = 1;
                        foreach ($ownerClaims as $singleScoreData) {
                    ?>
                    <tr>
                        <td>
                            <?php echo $i; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['bowlerid']; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['bowler']; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['team'];?>
                        </td>
                        <td class="approve"><a href="process/acceptOwner.php?id=y&bowler=<?php echo $singleScoreData['bowlerid'];?>"><i
                                    class="fas fa-check"></i></a></td>
                        <td class="decline"><a href="process/acceptOwner.php?id=n&bowler=<?php echo $singleScoreData['bowlerid'];?>"><i
                                    class="fas fa-times"></i></a></td>
                    </tr>
                    <?php
                                    $i++;
                                    }
                                ?>
                </tbody>
            </table>
            <?php
                    } else {
                        echo 'No Active Ownership Claims <br>';
                    }

                    if ($transferClaims) {
                        //var_dump($transferClaims);
                        ?>
            <hr>
            <h4 class="claimRequests">Bowler Transfer Requests</h4>
            <table id="transfer_table_home" class="display">
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Requested By</th>
                        <th>Bowler</th>
                        <th>Bowler ID</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Date & Time</th>
                        <th>Approve</th>
                        <th>Decline</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                                                $i = 1;
                                                foreach ($transferClaims as $singleScoreData) {
                                            ?>
                    <tr>
                        <td>
                            <?php echo $i; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['requestedby']; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['bowler']; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['bowlerid'];?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['fromteam'];?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['toteam'];?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['claimtime'];?>
                        </td>
                        <!-- showConfirmation(modal type,bowlerid,tableid) 
                        process/acceptTransfer.php?id=y&bowler=<?php //echo $singleScoreData['bowlerid'];?>&tab=<?php //echo $singleScoreData['id'];?>
                        -->
                        <?php 
                            $bowlerId = $singleScoreData['bowlerid'];
                            $id= $singleScoreData['id'];
                        ?>
                        <td class="approve"><a style="cursor: pointer;" onclick="showConfirmation('transfer','<?=$bowlerId?>','<?=$id?>')"><i
                                    class="fas fa-check"></i></a></td>
                        <td class="decline"><a href="process/acceptTransfer.php?id=n&bowler=<?php echo $singleScoreData['bowlerid'];?>&tab=<?php echo $singleScoreData['id'];?>"><i
                                    class="fas fa-times"></i></a></td>
                    </tr>
                    <?php
                                                $i++;
                                                }
                                            ?>
                </tbody>
            </table>
            <?php
                                } else {
                                    echo 'No Active Bowler Transfers Requests <br>';
                                }
                }
            ?>
            <h4>
                <?php echo $bowlerDeets['name']; ?>
            </h4>
            <hr>
            <?php
                if ($_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'president' || $_SESSION['userrole'] == 'owner') {
                    if (($teamDeets['president'] == '-' || $teamDeets['president'] == '') && !$presidency) {
            ?>
            <div class="claim presidentClaim">
                <a href="claimPresidency.php">Claim Presidency for
                    <?php echo $_SESSION['team'];?></a>
            </div>
            <hr>
            <?php
                    }
                if (($teamDeets['owner'] == '-' || $teamDeets['owner'] == '') && !$ownership) {
            ?>
            <div class="claim ownerClaim">
                <a href="claimOwnership.php">Claim Ownership for
                    <?php echo $_SESSION['team'];?></a>
            </div>
            <hr>
            <?php
                    }
                }
            ?>
            <?php
                if ($_SESSION['userrole'] != 'admin' || $_SESSION['userrole'] != 'staff') {
            ?>
            <div class="averages">
                <span>UBA:<b>
                        <?php echo $ubaAvg;?></b></span>
                <span>Season Tour:<b>
                	<span id="showSeasonAvrg"><?php echo number_format($seasonTourAvg,2);?></span></b></span>
                <span>Entering Average:<b>
                        <?php echo $bowlerEnteringAvg;?></b></span>
            </div>
            <hr>
            <?php
                if ($_SESSION['userrole'] == 'president' || $_SESSION['userrole'] == 'owner') {       
                    if ($transferClaims) {
                ?>
                <hr>
                <h4 class="claimRequests">Bowler Nickname Change</h4>
                <table id="nickname_table_home" class="display">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Bowler</th>
                            <th>Old Nickname</th>
                            <th>New Nickname</th>
                            <th>Approve</th>
                            <th>Decline</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                                                    $i = 1;
                                                    foreach ($nicknameChange as $singleScoreData) {
                                                ?>
                        <tr>
                            <td>
                                <?php echo $i; ?>
                            </td>
                            <td>
                                <?php echo $singleScoreData['name']; ?>
                            </td>
                            <td>
                                <?php echo $singleScoreData['oldnickname'];?>
                            </td>
                            <td>
                                <?php echo $singleScoreData['nickname1'];?>
                            </td>
                            <td class="approve"><a href="process/acceptNickname.php?id=y&bowler=<?php echo $singleScoreData['bowlerid'];?>&tab=<?php echo $singleScoreData['id'];?>"><i
                                        class="fas fa-check"></i></a></td>
                            <td class="decline"><a href="process/acceptNickname.php?id=n&bowler=<?php echo $singleScoreData['bowlerid'];?>&tab=<?php echo $singleScoreData['id'];?>"><i
                                        class="fas fa-times"></i></a></td>
                        </tr>
                        <?php
                                                    $i++;
                                                    }
                                                ?>
                    </tbody>
                </table>
                <?php
                    } else {
                        echo 'No Bowler Nickname Change Requests <br>';
                    }
                }
            ?>
            <hr>
            <h5>Season Tour:</h5>
            <label for="seasonYear">Please select the year:</label>
            	<select name="seasonYear" id="seasonYear">
					<option value="View All">All Seasons</option>
					<?php    
						$current_year = date("Y")+1; $current_year_s = date("y")+1;
							if(date("Y") >= date("Y")){ $count = 4; }else{ $count = 5; }
					
						for ($s = 1; $s <= $count; $s++) {
							if($s == 1){ $styear = $current_year-$s; $endyear = $current_year_s;}
							else{ $styear = $current_year-$s; $endyear = $current_year_s-$s+1;} ?>
								<option value="<?=$styear.'/'.$endyear;?>"><?=$styear.'/'.$endyear;?></option>
					<?php } ?>
				</select>
           
            <button class="btn btn-info btn-sm" onclick="submitSeasonYear()"> Submit</button>
            <table id="table_1_seasons_home" class="display">
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Date</th>
                        <th>Year</th>
                        <th>Event Name</th>
                        <th>Event Type</th>
                        <th>Team</th>
                        <th>Game 1</th>
                        <th>Game 2</th>
                        <th>Game 3</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                                    $i = 1;
                                    foreach ($dataFetchedSeasonTour as $singleScoreData) {
                                ?>
                    <tr>
                        <td>
                            <?php echo $i; ?>
                        </td>
                        <td>
                            <?php
                                            //Our YYYY-MM-DD date.
                                            $ymd = $singleScoreData['eventdate'];
                                            //Convert it into a timestamp.
                                            $timestamp = strtotime($ymd);
                                            //Convert it to DD-MM-YYYY
                                            $dmy = date("m-d-Y", $timestamp);
                                            //Echo it
                                            echo $dmy;
                                        ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['year']; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['event']; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['location'];?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['team']; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['game1']; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['game2']; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['game3']; ?>
                        </td>
                    </tr>
                    <?php
                                    $i++;
                                    }
                                ?>
                </tbody>
            </table>

            <hr>

            <h5>Events:</h5>
            <label for="eventsYear">Please select the year:</label>

            <select name="eventsYear" id="eventsYear">
                <option value="View All">All Events</option>
                <?php    
						$current_year = date("Y")+1; $current_year_s = date("y")+1;
							if(date("Y") >= date("Y")){ $count = 4; }else{ $count = 5; }
					
						for ($s = 1; $s <= $count; $s++) {
							if($s == 1){ $styear = $current_year-$s; $endyear = $current_year_s;}
							else{ $styear = $current_year-$s; $endyear = $current_year_s-$s+1;} ?>
								<option value="<?=$styear.'/'.$endyear;?>"><?=$styear.'/'.$endyear;?></option>
					<?php } ?>                 
            </select>
            <button class="btn btn-info btn-sm" onclick="submitEventsYear()"> Submit</button>

            <table id="table_1_events_home" class="display">
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Date</th>
                        <th>Year</th>
                        <th>Event Name</th>
                        <th>Event Type</th>
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
                                    foreach ($dataFetchedEvents as $singleScoreData) {
                                ?>
                    <tr>
                        <td>
                            <?php echo $i; ?>
                        </td>
                        <td>
                            <?php
                                            //Our YYYY-MM-DD date.
                                            $ymd = $singleScoreData['eventdate'];
                                            //Convert it into a timestamp.
                                            $timestamp = strtotime($ymd);
                                            //Convert it to DD-MM-YYYY
                                            $dmy = date("m-d-Y", $timestamp);
                                            //Echo it
                                            echo $dmy;
                                        ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['year']; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['event']; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['eventtype'];?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['team']; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['game1']; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['game2']; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['game3']; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['game4']; ?>
                        </td>
                        <td>
                            <?php echo $singleScoreData['game5']; ?>
                        </td>
                    </tr>
                    <?php
                                    $i++;
                                    }
                                ?>
                </tbody>
            </table>
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
//var_dump($_SESSION['useremail']);exit();
?>
<!--<a href="process/approveRelease.php?id=n&bowler=<?php echo $singleScoreData['bowlerid'];?>"><i class="fas fa-times"></i></a>-->
<script>
	function approveRelease(bowllerid){
		console.log('bowllerid',bowllerid);
		if (window.confirm('Are you sure want to released this bowlers  ?')){
		    // They clicked Yes
		    // alert('yes');
		    location.href = "process/approveRelease.php?id=n&bowler="+bowllerid;
		}
		
		
	}
</script>

<script>
	$( document ).ready(function() {
		var bowlID = '<?=$bowlerUBAID;?>';
		// console.log('bowlID',bowlID);
		
	    var formData = {
            'bowlerID': bowlID
        };
        
        $.ajax({
            type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
            url         : '<?=$base_url?>/dashboard/fatchSeasonAvrg.php', // the url where we want to POST
            data        : formData, // our data object
            dataType    : 'json', // what type of data do we expect back from the server
            encode      : true
        })
        .done(function(data) {
        	var crntYear = new Date().getFullYear();
        	var nextYear = new Date().getFullYear()+1;
        	
			var sectValue1 = new Date('09/'+'01'+ '/' + crntYear);
			var sectValue2 = new Date('09/'+'01'+ '/' + nextYear);
			
				var gameCount = [];  var totalval = 0; var avrg = '';
				var counts = [];
        	for (let index = 0; index < data.length; index++) {
            	
            	var checkDate = new Date(data[index]['eventDate']);
            	if ((checkDate <= sectValue2) && (checkDate >=  sectValue1)){
						if(data[index]['game 1'] > 1 ){
							counts.push(data[index]['game 1']);
						}
						if(data[index]['game 2'] > 1 ){
							counts.push(data[index]['game 2']);
						}
						
						if(data[index]['game 3'] > 1 ){
							counts.push(data[index]['game 3']);
						}
            		
            		totalval = parseInt(totalval) + parseInt(data[index]['pinfall']);
            		// counts.push('1');
            		
            			avrg = totalval/counts.length;
            		
            	}	
            	
        	}
        	$('#showSeasonAvrg').html(avrg.toFixed(2));
        	// console.log('avrg',avrg);
        	
        });	
	});
</script>

<script type="text/javascript">
    function submitSeasonYear(){
         $("#loaderbg").fadeIn("slow");
        console.log($('#seasonYear :selected').text());
        var data ={"action":'season',"year":$('#seasonYear :selected').text(),"useremail":"<?php echo $_SESSION['useremail'] ?>"}
        var url = "process/dashboardStatistics.php"
        $.ajax({
            type: "POST",
              url: url,
              data: data,
            success: function(response){
            console.log(response);
            var jsonObj = JSON.parse(response);   

            //remove old value

            var tableSeasons =   $('#table_1_seasons_home').dataTable();

            tableSeasons.fnClearTable();
           // tableSeasons.dataTable().fnAddData(jsonObj);


             var array_length =  jsonObj.length;            
                if(array_length>0){
                    for(i=0;i<array_length;i++){ 
                        var values = [];
                        values.push(i+1);
                        values.push(jsonObj[i]['eventdate']);
                        values.push(jsonObj[i]['year']);
                        values.push(jsonObj[i]['event']);
                        values.push(jsonObj[i]['location']);
                        values.push(jsonObj[i]['team']);
                        values.push(jsonObj[i]['game1']);
                        values.push(jsonObj[i]['game2']);
                        values.push(jsonObj[i]['game3']);                       

                        tableSeasons.fnAddData([values]);   
                    }
 
                }
                 $("#loaderbg").fadeOut("slow");

        }});
    }



     function submitEventsYear(){
         $("#loaderbg").fadeIn("slow");
        console.log($('#eventsYear :selected').text());
        var data ={"action":'events',"year":$('#eventsYear :selected').text(),"useremail":"<?php echo $_SESSION['useremail'] ?>"}
        var url = "process/dashboardStatistics.php"
        $.ajax({
            type: "POST",
              url: url,
              data: data,
            success: function(response){
            console.log(response);
            var jsonObj = JSON.parse(response);   

            //remove old value

            var tableSeasons =   $('#table_1_events_home').dataTable();

            tableSeasons.fnClearTable();
           // tableSeasons.dataTable().fnAddData(jsonObj);


             var array_length =  jsonObj.length;            
                if(array_length>0){
                    for(i=0;i<array_length;i++){ 
                        var values = [];
                        values.push(i+1);
                        values.push(jsonObj[i]['eventdate']);
                        values.push(jsonObj[i]['year']);
                        values.push(jsonObj[i]['event']);
                        values.push(jsonObj[i]['eventtype']);
                        values.push(jsonObj[i]['team']);
                        values.push(jsonObj[i]['game1']);
                        values.push(jsonObj[i]['game2']);
                        values.push(jsonObj[i]['game3']);
                        values.push(jsonObj[i]['game4']);
                        values.push(jsonObj[i]['game5']);                       

                        tableSeasons.fnAddData([values]);   
                    }
 
                }
                 $("#loaderbg").fadeOut("slow");

        }});
    }

    function showConfirmation(type,bowlerId,tableId){
        $('#bowlerTransferModal').modal('toggle');
        $('#tableId').val(tableId);
        $('#bowlerId').val(bowlerId);
    }
    function saveAndAddToTheRoster(){
        var bowlerid = $('#bowlerId').val();
        var tableid = $('#tableId').val();
        window.location ="process/acceptTransfer.php?id=y&bowler="+bowlerid+"&tab="+tableid+"&type=saveAndAddToTheRoster";
    }

    function onlyApproveTranfer(){
         var bowlerid = $('#bowlerId').val();
         var tableid = $('#tableId').val();
         window.location ="process/acceptTransfer.php?id=y&bowler="+bowlerid+"&tab="+tableid+"&type=onlyApproveTranfer";
    }


     function showConfirmationAddBowler(type,bowlerId){
        $('#addBowlerModal').modal('toggle');
        $('#bowlerIdForAdd').val(bowlerId);
    }
    function addAndAddToTheRoster(){
        var bowlerid = $('#bowlerIdForAdd').val();
        window.location ="process/activateBowler.php?id=y&bowler="+bowlerid+"&type=addAndAddToTheRoster";
    }

    function addOnly(){
         var bowlerid = $('#bowlerIdForAdd').val();
          window.location ="process/activateBowler.php?id=y&bowler="+bowlerid+"&type=addOnly";
    }
</script>