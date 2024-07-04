<?php

include_once '../../connect.php';

try {
    $database = new Connection();
    $db = $database->openConnection();

    // Calculate Total Pinfalls and Total Games
    $sql = $db->prepare("SELECT * FROM `bowlerdata`");
    $sql->execute();
    $dataFetchedEvents = $sql->fetchAll();

    foreach ($dataFetchedEvents as $eventRow) {

        $rowID = $eventRow['id'];

        $totalPinfalls = 0;
        $totalGames = 0;

        $game1 = $eventRow['game1'];
        $game2 = $eventRow['game2'];
        $game3 = $eventRow['game3'];
        $game4 = $eventRow['game4'];
        $game5 = $eventRow['game5'];

        if ($game5 > 0) {
            $totalPinfalls += $game5;
            $totalGames++;
        }
        if ($game4 > 0) {
            $totalPinfalls += $game4;
            $totalGames++;
        }
        if ($game3 > 0) {
            $totalPinfalls += $game3;
            $totalGames++;
        }
        if ($game2 > 0) {
            $totalPinfalls += $game2;
            $totalGames++;
        }
        if ($game1 > 0) {
            $totalPinfalls += $game1;
            $totalGames++;
        }

        $sql = "UPDATE `bowlerdata` 
                SET `totalpinfall` = :totalpinfall,
                `totalgames` = :totalgames
                WHERE `id` = :rowID";

        $stmt = $db->prepare($sql);                                  
        $stmt->bindParam(':totalpinfall', $totalPinfalls);
        $stmt->bindParam(':totalgames', $totalGames);
        $stmt->bindParam(':rowID', $rowID);
        $stmt->execute(); 
    }

    // Calculate Total Pinfalls and Total Games
    $sql = $db->prepare("SELECT * FROM `bowlerdataseason`");
    $sql->execute();
    $dataFetchedSeasonTour = $sql->fetchAll();

    foreach ($dataFetchedSeasonTour as $eventRow) {

        $rowID = $eventRow['id'];

        $totalPinfalls = 0;
        $totalGames = 0;

        $game1 = $eventRow['game1'];
        $game2 = $eventRow['game2'];
        $game3 = $eventRow['game3'];

        if ($game3 > 0) {
            $totalPinfalls += $game3;
            $totalGames++;
        }
        if ($game2 > 0) {
            $totalPinfalls += $game2;
            $totalGames++;
        }
        if ($game1 > 0) {
            $totalPinfalls += $game1;
            $totalGames++;
        }

        $sql = "UPDATE `bowlerdataseason` 
                SET `totalpinfall` = :totalpinfall,
                `totalgames` = :totalgames
                WHERE `id` = :rowID";

        $stmt = $db->prepare($sql);                                  
        $stmt->bindParam(':totalpinfall', $totalPinfalls);
        $stmt->bindParam(':totalgames', $totalGames);
        $stmt->bindParam(':rowID', $rowID);
        $stmt->execute(); 
    }



    exit();

    // echo sizeof($bowlerIndData);
    // echo '<br>';

    // $i;

    // foreach ($bowlerIndData as $bowler) {
    
    //     $bowlerID = $bowler['bowlerid'];

    //     echo $i;
    //     echo '<br>';

    //     // Calculate UBA & Season Tour Average
    //     $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 100");
    //     $sql->execute();
    //     $dataFetchedEvents = $sql->fetchAll();

    //     $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 100");
    //     $sql->execute();
    //     $dataFetchedSeasonTour = $sql->fetchAll();

    //     $dataFetched = array_merge($dataFetchedEvents,$dataFetchedSeasonTour);

    //     // var_dump($dataFetched);

    //     usort($dataFetched, function($a, $b) {
    //         return strtotime($b['eventdate']) - strtotime($a['eventdate']);
    //     });

    //     $gamesArr = array();
    //     $gamesTotal = 0;

    //     $totalPinfalls = 0;

    //     $finalArr = array();

    //     $sampleData = array();

    //     foreach ($dataFetched as $eventRow) {

    //             if ($gamesTotal > 49) {
    //                 break;
    //             }

    //             $game1 = $eventRow['game1'];
    //             $game2 = $eventRow['game2'];
    //             $game3 = $eventRow['game3'];
    //             $game4 = $eventRow['game4'];
    //             $game5 = $eventRow['game5'];

    //             $data = array();

    //             if ($game5 > 0 && $gamesTotal < 50) {
    //                 array_push($gamesArr, $game5);
    //                 $totalPinfalls += $game5;
    //                 $gamesTotal++;
    //             }
    //             if ($game4 > 0 && $gamesTotal < 50) {
    //                 array_push($gamesArr, $game4);
    //                 $totalPinfalls += $game4;
    //                 $gamesTotal++;
    //             }
    //             if ($game3 > 0 && $gamesTotal < 50) {
    //                 array_push($gamesArr, $game3);
    //                 $totalPinfalls += $game3;
    //                 $gamesTotal++;
    //             }
    //             if ($game2 > 0 && $gamesTotal < 50) {
    //                 array_push($gamesArr, $game2);
    //                 $totalPinfalls += $game2;
    //                 $gamesTotal++;
    //             }
    //             if ($game1 > 0 && $gamesTotal < 50) {
    //                 array_push($gamesArr, $game1);
    //                 $totalPinfalls += $game1;
    //                 $gamesTotal++;
    //             }

    //             array_push($sampleData, $eventRow);
            
    //         }

    //         $totalGames = sizeof($gamesArr);
    //         $ubaAvg = ($totalPinfalls / $totalGames);

    //         $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC");
    //         $sql->execute();
    //         $dataFetchedLatestSeasonTour = $sql->fetchAll();

    //         usort($dataFetchedLatestSeasonTour, function($a, $b) {
    //             return strtotime($b['eventdate']) - strtotime($a['eventdate']);
    //         });

    //         $gamesArr = array();
    //         $gamesTotal = 0;
    //         $totalPinfalls = 0;
    //         $finalArr = array();
    //         $sampleData = array();

    //         foreach ($dataFetchedSeasonTour as $eventRow) {

    //             if ($gamesTotal > 49) {
    //                 break;
    //             }

    //             $game1 = $eventRow['game1'];
    //             $game2 = $eventRow['game2'];
    //             $game3 = $eventRow['game3'];

    //             $data = array();

    //             if ($game3 > 0 && $gamesTotal < 50) {
    //                 array_push($gamesArr, $game3);
    //                 $totalPinfalls += $game3;
    //                 $gamesTotal++;
    //             }
    //             if ($game2 > 0 && $gamesTotal < 50) {
    //                 array_push($gamesArr, $game2);
    //                 $totalPinfalls += $game2;
    //                 $gamesTotal++;
    //             }
    //             if ($game1 > 0 && $gamesTotal < 50) {
    //                 array_push($gamesArr, $game1);
    //                 $totalPinfalls += $game1;
    //                 $gamesTotal++;
    //             }
    //         }

    //         $totalGames = sizeof($gamesArr);
    //         $seasonTourAvg = ($totalPinfalls / $totalGames);

    //         if ($totalGames < 9) {
    //             $seasonTourAvg = 0;
    //         }

    //         echo $bowlerID.' | '.((int) $ubaAvg).' | '.$seasonTourAvg;

    //         $sql = "UPDATE `bowlers` 
    //                 SET `ubaAvg` = :ubaAvg,
    //                 `seasontourAvg` = :seasonTourAvg
    //                 WHERE `bowlerid` = :bowlerUBAID";

    //         $stmt = $db->prepare($sql);                                  
    //         $stmt->bindParam(':ubaAvg', $ubaAvg);
    //         $stmt->bindParam(':seasonTourAvg', $seasonTourAvg);
    //         $stmt->bindParam(':bowlerUBAID', $bowlerID);
    //         $stmt->execute(); 

    //     }




} catch (PDOException $e) {
    echo "There was some problem with the connection: " . $e->getMessage();
}


?>