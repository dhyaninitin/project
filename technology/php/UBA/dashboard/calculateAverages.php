<?php

    include_once '../session.php';
    include_once '../connect.php';

    if (!empty($_POST)) {
        try {
            $database = new Connection();
            $db = $database->openConnection();
        
            // Calculate UBA & Season Tour Average
            $sql = $db->prepare("SELECT `bowlerid`,`name` FROM `bowlers`");
            $sql->execute();
            $bowlerIndData = $sql->fetchAll();
    
            $i = 1;
    
            $finalArray = array();
        
            foreach ($bowlerIndData as $bowler) {
            
                $bowlerID = $bowler['bowlerid'];
                $bowlername = $bowler['name'];
    
                $singleBowler = array();
        
                // Calculate UBA & Season Tour Average
                $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 60");
                $sql->execute();
                $dataFetchedEvents = $sql->fetchAll();
        
                $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 60");
                $sql->execute();
                $dataFetchedSeasonTour = $sql->fetchAll();
        
                $dataFetched = array_merge($dataFetchedEvents,$dataFetchedSeasonTour);
        
                if ($dataFetched) {
                    usort($dataFetched, function ($a, $b){
                        
                        if ($a['eventdate'] == $b['eventdate']) {
                            return strtotime($b['logtime']) - strtotime($a['logtime']);
                        }
        
                        return strtotime($b['eventdate']) - strtotime($a['eventdate']);
                    });
            
                    $gamesArr = array();
                    $gamesTotal = 0;
            
                    $totalPinfalls = 0;
            
                    $finalArr = array();
            
                    $sampleData = array();
            
                    foreach ($dataFetched as $eventRow) {
            
                            if ($gamesTotal > 49) {
                                break;
                            }
            
                            $game1 = $eventRow['game1'];
                            $game2 = $eventRow['game2'];
                            $game3 = $eventRow['game3'];
                            $game4 = $eventRow['game4'];
                            $game5 = $eventRow['game5'];
            
                            $data = array();
            
                            if ($game5 > 0 && $gamesTotal < 50) {
                                array_push($gamesArr, $game5);
                                $totalPinfalls += $game5;
                                $gamesTotal++;
                            }
                            if ($game4 > 0 && $gamesTotal < 50) {
                                array_push($gamesArr, $game4);
                                $totalPinfalls += $game4;
                                $gamesTotal++;
                            }
                            if ($game3 > 0 && $gamesTotal < 50) {
                                array_push($gamesArr, $game3);
                                $totalPinfalls += $game3;
                                $gamesTotal++;
                            }
                            if ($game2 > 0 && $gamesTotal < 50) {
                                array_push($gamesArr, $game2);
                                $totalPinfalls += $game2;
                                $gamesTotal++;
                            }
                            if ($game1 > 0 && $gamesTotal < 50) {
                                array_push($gamesArr, $game1);
                                $totalPinfalls += $game1;
                                $gamesTotal++;
                            }
            
                            array_push($sampleData, $eventRow);
                        
                        }
            
                        $totalGames = sizeof($gamesArr);
                        $ubaAvg = ($totalPinfalls / $totalGames);
            
                        $ubaAvg = number_format($ubaAvg,2);
        
                        if ($totalGames < 9) {
                            $ubaAvg = 0;
                        }
                        
                } else {
                    $ubaAvg = 0;
                }
        
                $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerID' AND `year` = '2019/20' ORDER BY `eventdate` DESC LIMIT 60");
                $sql->execute();
                $dataFetchedLatestSeasonTour = $sql->fetchAll();
    
                if ($dataFetchedLatestSeasonTour) {
                    usort($dataFetchedLatestSeasonTour, function($a, $b) {
                        return strtotime($b['eventdate']) - strtotime($a['eventdate']);
                    });
        
                    $gamesArr = array();
                    $gamesTotal = 0;
                    $totalPinfalls = 0;
                    $finalArr = array();
                    $sampleData = array();
                    $totalGames = 0;
        
                    foreach ($dataFetchedLatestSeasonTour as $eventRow) {
        
                        if ($gamesTotal > 49) {
                            break;
                        }
        
                        $game1 = $eventRow['game1'];
                        $game2 = $eventRow['game2'];
                        $game3 = $eventRow['game3'];
        
                        $data = array();
        
                        if ($game3 > 0 && $gamesTotal < 50) {
                            array_push($gamesArr, $game3);
                            $totalPinfalls += $game3;
                            $gamesTotal++;
                        }
                        if ($game2 > 0 && $gamesTotal < 50) {
                            array_push($gamesArr, $game2);
                            $totalPinfalls += $game2;
                            $gamesTotal++;
                        }
                        if ($game1 > 0 && $gamesTotal < 50) {
                            array_push($gamesArr, $game1);
                            $totalPinfalls += $game1;
                            $gamesTotal++;
                        }
                    }
        
                    $totalGames = sizeof($gamesArr);
                    $seasonTourAvg = ($totalPinfalls / $totalGames);
        
                    if ($totalGames < 9) {
                        $seasonTourAvg = 0;
                    }
        
                    $seasonTourAvg = number_format($seasonTourAvg,2);
                } else {
                    $seasonTourAvg = 0;
                }
    
                $singleBowler['bowler'] = $bowlername;
                $singleBowler['bowlerid'] = $bowlerID;
                $singleBowler['ubaAvg'] = $ubaAvg;
                $singleBowler['seasonTourAvg'] = $seasonTourAvg;
    
                array_push($finalArray, $singleBowler);
    
                $sql = "UPDATE `bowlers` 
                        SET `ubaAvg` = :ubaAvg,
                            `seasontourAvg` = :seasonTourAvg
                        WHERE `bowlerid` = :bowlerUBAID";
    
                $stmt = $db->prepare($sql);                                  
                $stmt->bindParam(':ubaAvg', $ubaAvg);
                $stmt->bindParam(':seasonTourAvg', $seasonTourAvg);
                $stmt->bindParam(':bowlerUBAID', $bowlerID);
                $stmt->execute();
    
                $i++;
    
                $singleBowler = array();
    
                $done = true;
    
            }
        
        } catch (PDOException $e) {
            echo "There was some problem with the connection: " . $e->getMessage();
        }
    }

    $title = 'Calculate Averages';
    include 'inc/header.php';

?>

<div class="addscore">
        <div class="col-12">
            
            <h4>Calculate Averages</h4>
            <?php echo $msg; ?>
            <hr>
            
            <form action="" method="POST">
                <div class="form-group">
                    <input type="submit" value="Run Script" name="submit">
                </div>
            </form>

            <?php
                if ($done == true) {
            ?>
            <hr>
            <table id="table_1_events" class="display scoreTable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Bowler</th>
                        <th>UBA Avg</th>
                        <th>ST Avg</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                        $i = 1;
                        foreach ($finalArray as $data) {
                    ?>
                        <tr>
                            <td><?php echo $data['bowlerid'];?></td>
                            <td><?php echo $data['bowler'];?></td>
                            <td><?php echo $data['ubaAvg'];?></td>
                            <td><?php echo $data['seasonTourAvg'];?></td>
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

<?php

include 'inc/footer.php';

?>