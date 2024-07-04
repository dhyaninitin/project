<?php

include_once '../../connect.php';

try {
    $database = new Connection();
    $db = $database->openConnection();

    $id = $_GET['id'];

    // Calculate UBA & Season Tour Average
    $sql = $db->prepare("SELECT `bowlerid` FROM `bowlers` WHERE `bowlerid` = '$id'");
    $sql->execute();
    $bowlerIndData = $sql->fetchAll();

    $i;

    foreach ($bowlerIndData as $bowler) {
    
        $bowlerID = $bowler['bowlerid'];

        // Calculate UBA & Season Tour Average
        $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 100");
        $sql->execute();
        $dataFetchedEvents = $sql->fetchAll();

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 100");
        $sql->execute();
        $dataFetchedSeasonTour = $sql->fetchAll();

        $dataFetched = array_merge($dataFetchedEvents,$dataFetchedSeasonTour);

        // var_dump($dataFetched);

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

                var_dump($gamesArr);

                echo '<br>';

                foreach($sampleData as $singleRow){
                    echo '----------------------------------------------------------------------------------------------------------------------------';
                    
                    echo '<br>';
                    echo $singleRow['event'].' - '.$singleRow['game1'].' - '.$singleRow['game2'].' - '.$singleRow['game2'].' - '.$singleRow['game3'].' - '.$singleRow['game4'].' - '.$singleRow['game5'];
                    echo '<br>';
                    
                }

                echo '----------------------------------------------------------------------------------------------------------------------------';
                    
                echo '<br>';
    
                $totalGames = sizeof($gamesArr);
                $ubaAvg = ($totalPinfalls / $totalGames);
    
                $ubaAvg = number_format($ubaAvg,2);

                if ($totalGames < 9) {
                    $ubaAvg = 0;
                }

        } else {
            $ubaAvg = 0;
        }

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerID' AND `year` = '2019/20' ORDER BY `eventdate` DESC LIMIT 50");
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


        echo $i.' | '.$bowlername.' | '.$bowlerID.' | '.$ubaAvg.' | '.$seasonTourAvg .'<br>';

        $sql = "UPDATE `bowlers` 
                SET `ubaAvg` = :ubaAvg,
                `seasontourAvg` = :seasonTourAvg
                WHERE `bowlerid` = :bowlerUBAID";

        $stmt = $db->prepare($sql);                                  
        $stmt->bindParam(':ubaAvg', $ubaAvg);
        $stmt->bindParam(':seasonTourAvg', $seasonTourAvg);
        $stmt->bindParam(':bowlerUBAID', $bowlerID);
        $stmt->execute(); 

    }




} catch (PDOException $e) {
    echo "There was some problem with the connection: " . $e->getMessage();
}


?>