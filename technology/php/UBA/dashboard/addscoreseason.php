<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] == 'president' || $_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'eventstaff' || $_SESSION['userrole'] == 'owner'  || $_SESSION['userrole'] == 'secretary'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `teams`");
        $sql->execute();
        $dataFetched = $sql->fetchAll();
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    $title = 'Add Season Scores';

    include 'inc/header.php';

    if($_SESSION['scoreAddedSeason'] == true) {
        $msg = '<p class="successMsg">The scores were added.</p>';
    }

    if ($_SESSION['seasonData'] == true) {
        $resetBtn = '<a href="resetInput.php?page=season" id="resetInputs">Reset Input Data</a>';
    }

    $_SESSION['seasonYear'];
    $_SESSION['seasonDate'];
    $_SESSION['seasonTourStop'];
    $_SESSION['seasonLocation'];
    $_SESSION['seasonTeam'];

?>

    <div class="addscore">
        <div class="col-12">
            <h4>Add Season Scores</h4>
            <?php echo $msg; ?>
            <form action="process/scoreAdded.php" method="POST">
                <!-- <div class="form-group">
                    <label for="type">Type:</label>
                    <select name="type" id="type" required>
                        <option value="-" disabled selected>Select</option>
                        <option value="season">Season</option>
                    </select>
                </div> -->

                <div class="form-group">
                    <label for="year">Year:</label>
                    <select name="year" id="year" required>
                        <option value="-" disabled selected>Select</option>
                        <?php
                            $val = 17;
                            for ($i=0; $i < 3; $i++) { 
                                $yearVal = '20'.$val;
                                $finalVal = $yearVal . '/'. ($val+1);
                                
                                if ($_SESSION['seasonData'] == true) {
                                    if ($_SESSION['seasonYear'] == $finalVal) {
                                        echo '<option value="'.$finalVal.'" selected>'.$finalVal.'</option>';
                                    }
                                } else {
                                    echo '<option value="'.$finalVal.'">'.$finalVal.'</option>';
                                }
                                
                                $val++;
                            }
                        ?>
                        
                    </select>
                </div>

                <div class="form-group">
                    <label for="datepicker">Date:</label>
                    <input type="text" id="datepicker" name="datepicker" required
                    <?php
                        if ($_SESSION['seasonData'] == true) {
                            echo 'value="'.$_SESSION['seasonDate'].'"';
                        }
                    ?>
                    >
                </div>

                <div class="form-group">
                    <label for="tourstop">Tour Stop:</label>
                    <input type="text" id="tourstop" name="tourstop" required
                    <?php
                        if ($_SESSION['seasonData'] == true) {
                            echo 'value="'.$_SESSION['seasonTourStop'].'"';
                        }
                    ?>
                    >
                </div>

                <div class="form-group">
                    <label for="location">Event location:</label>
                    <input type="text" id="location" name="location" required
                    <?php
                        if ($_SESSION['seasonData'] == true) {
                            echo 'value="'.$_SESSION['seasonLocation'].'"';
                        }
                    ?>
                    >
                </div>

                <div class="form-group">
                    <label for="teams">Team:</label>
                    <select name="teams" id="teams" required>
                        <option value="-" disabled selected>Select</option>
                        <?php
                        foreach ($dataFetched as $team) {
                            $teamname = $team['teamname'];
                            echo '<option value="'.$teamname.'">'.$teamname.'</option>';
                        }
                    ?>
                    </select>
                </div>

                <?php echo $resetBtn; ?>

                <hr>

                <div class="scratch">
                    <ul class="bowlerScoreEntry">
                        <li>Scratch</li>
                        <li>Name</li>
                        <li>Game 1</li>
                        <li>Game 2</li>
                        <li>Game 3</li>
                        <li>Series</li>
                    </ul>

                    <ul class="bowlerScoreEntry">
                        <li>
                            <label for="sb1">Bowler 1:</label>
                        </li>
                        <li>
                            <select name="sb1" id="sb1" required >
                                <option value="-" disabled selected>Select</option>
                            </select>
                        </li>
                        <li><input type="number" name="sb1g1" id="sb1g1" class="sb1g" ></li>
                        <li><input type="number" name="sb1g2" id="sb1g2" class="sb1g" ></li>
                        <li><input type="number" name="sb1g3" id="sb1g3" class="sb1g" ></li>
                        <li><span id="sb1Total"></span></li>
                    </ul>

                    <ul class="bowlerScoreEntry">
                        <li>
                            <label for="sb2">Bowler 2:</label>                        
                        </li>
                        <li>
                            <select name="sb2" id="sb2" required>
                                <option value="-" disabled selected>Select</option>
                            </select>
                        </li>
                        <li><input type="number" name="sb2g1" id="sb2g1" class="sb2g" ></li>
                        <li><input type="number" name="sb2g2" id="sb2g2" class="sb2g" ></li>
                        <li><input type="number" name="sb2g3" id="sb2g3" class="sb2g" ></li>
                        <li><span id="sb2Total"></span></li>
                    </ul>

                    <ul class="bowlerScoreEntry">
                        <li>
                            <label for="sb3">Bowler 3:</label>                        
                        </li>
                        <li>
                            <select name="sb3" id="sb3" required>
                                <option value="-" disabled selected>Select</option>
                            </select>
                        </li>
                        <li><input type="number" name="sb3g1" id="sb3g1" class="sb3g" ></li>
                        <li><input type="number" name="sb3g2" id="sb3g2" class="sb3g" ></li>
                        <li><input type="number" name="sb3g3" id="sb3g3" class="sb3g" ></li>
                        <li><span id="sb3Total"></span></li>
                    </ul>

                    <a href="#" class="addSub">Add Sub</a>

                </div>

                <hr>

                <div class="handicap1">
                    <ul class="bowlerScoreEntry">
                        <li>Handicap 1</li>
                        <li>Name</li>
                        <li>Game 1</li>
                        <li>Game 2</li>
                        <li>Game 3</li>
                        <li>Series</li>
                    </ul>

                    <ul class="bowlerScoreEntry">
                        <li>
                            <label for="h1b1">Bowler 1:</label>                        
                        </li>
                        <li>
                            <select name="h1b1" id="h1b1" required>
                                <option value="-" disabled selected>Select</option>
                            </select>
                        </li>
                        <li><input type="number" name="h1b1g1" id="h1b1g1" class="h1b1g" ></li>
                        <li><input type="number" name="h1b1g2" id="h1b1g2" class="h1b1g" ></li>
                        <li><input type="number" name="h1b1g3" id="h1b1g3" class="h1b1g" ></li>
                        <li><span id="h1b1Total"></span></li>
                    </ul>

                    <ul class="bowlerScoreEntry">
                        <li>
                            <label for="h1b2">Bowler 2:</label>                        
                        </li>
                        <li>
                            <select name="h1b2" id="h1b2" required>
                                <option value="-" disabled selected>Select</option>
                            </select>
                        </li>
                        <li><input type="number" name="h1b2g1" id="h1b2g1" class="h1b2g" ></li>
                        <li><input type="number" name="h1b2g2" id="h1b2g2" class="h1b2g" ></li>
                        <li><input type="number" name="h1b2g3" id="h1b2g3" class="h1b2g" ></li>
                        <li><span id="h1b2Total"></span></li>
                    </ul>

                    <ul class="bowlerScoreEntry">
                        <li>
                            <label for="h1b3">Bowler 3:</label>                        
                        </li>
                        <li>
                            <select name="h1b3" id="h1b3" required>
                                <option value="-" disabled selected>Select</option>
                            </select>
                        </li>
                        <li><input type="number" name="h1b3g1" id="h1b3g1" class="h1b3g" ></li>
                        <li><input type="number" name="h1b3g2" id="h1b3g2" class="h1b3g" ></li>
                        <li><input type="number" name="h1b3g3" id="h1b3g3" class="h1b3g" ></li>
                        <li><span id="h1b3Total"></span></li>
                    </ul>

                    <a href="#" class="addSub">Add Sub</a>

                </div>

                <hr>

                <div class="handicap2">
                    <ul class="bowlerScoreEntry">
                        <li>Handicap 2</li>
                        <li>Name</li>
                        <li>Game 1</li>
                        <li>Game 2</li>
                        <li>Game 3</li>
                        <li>Series</li>
                    </ul>

                    <ul class="bowlerScoreEntry">
                        <li>
                            <label for="h2b1">Bowler 1:</label>                        
                        </li>
                        <li>
                            <select name="h2b1" id="h2b1" required>
                                <option value="-" disabled selected>Select</option>
                            </select>
                        </li>
                        <li><input type="number" name="h2b1g1" id="h2b1g1" class="h2b1g" ></li>
                        <li><input type="number" name="h2b1g2" id="h2b1g2" class="h2b1g" ></li>
                        <li><input type="number" name="h2b1g3" id="h2b1g3" class="h2b1g" ></li>
                        <li><span id="h2b1Total"></span></li>
                    </ul>

                    <ul class="bowlerScoreEntry">
                        <li>
                            <label for="h2b2">Bowler 2:</label>                        
                        </li>
                        <li>
                            <select name="h2b2" id="h2b2" required>
                                <option value="-" disabled selected>Select</option>
                            </select>
                        </li>
                        <li><input type="number" name="h2b2g1" id="h2b2g1" class="h2b2g" ></li>
                        <li><input type="number" name="h2b2g2" id="h2b2g2" class="h2b2g" ></li>
                        <li><input type="number" name="h2b2g3" id="h2b2g3" class="h2b2g" ></li>
                        <li><span id="h2b2Total"></span></li>
                    </ul>

                    <ul class="bowlerScoreEntry">
                        <li>
                            <label for="h2b3">Bowler 3:</label>                        
                        </li>
                        <li>
                            <select name="h2b3" id="h2b3" required>
                                <option value="-" disabled selected>Select</option>
                            </select>
                        </li>
                        <li><input type="number" name="h2b3g1" id="h2b3g1" class="h2b3g" ></li>
                        <li><input type="number" name="h2b3g2" id="h2b3g2" class="h2b3g" ></li>
                        <li><input type="number" name="h2b3g3" id="h2b3g3" class="h2b3g" ></li>
                        <li><span id="h2b3Total"></span></li>
                    </ul>

                    <a href="#" class="addSub">Add Sub</a>

                </div>

                <hr>

                <div class="form-group">
                    <input type="submit" value="Add Scores" name="submit">
                </div>
            </form>
        </div>
    </div>

<?php

$addscore = true;
include 'inc/footer.php';

?>
