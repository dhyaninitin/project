<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';

    if($_SESSION['userrole'] == 'president' || $_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'eventstaff' || $_SESSION['userrole'] == 'owner'  || $_SESSION['userrole'] == 'secretary'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    // $eventtype = $_POST['type'];
    $year = $_POST['year'];
    $eventdate = date('Y-m-d H:i:s',strtotime($_POST['datepicker']));
    // $detaildate = date('Y-m-d H:i:s',strtotime($_POST['datepicker'];));

    $tourstop = $_POST['mainEvent'] + ' | ' + $_POST['subEvent'];
    $eventType = $_POST['eventType'];
    // $team = $_POST['teams'];

    $_SESSION['eventData'] = true;
    $_SESSION['eventYear'] = $year;
    $_SESSION['eventDate'] = $_POST['eventdate'];
    $_SESSION['eventName'] = $tourstop;
    $_SESSION['eventLocation'] = $location;
    $_SESSION['eventTeam'] = $team;

    $average = 0;
    $game4 = 0;
    $game5 = 0;
    $totalpinfall = 0;
    $totalgames = 0;
    $enteravg = 0;
    $entryby = $_SESSION['useremail'];


    try {
        $database = new Connection();
        $db = $database->openConnection();

        if ($tourstop == 'Unholy Alliance'  || $tourstop == 'Conference Classic') {
            $noOfBowlers = sizeof($_POST['bowler']);
    
            // $b1 = $_POST["b1"];
    
            for ($i=0; $i < $noOfBowlers; $i++) { 
                $bowlerData = $_POST['bowler'][$i];
                $bowlerData = preg_split("#/#", $bowlerData);
    
                $bowlerName = $bowlerData[0];
                $bowlerID = $bowlerData[1];
                $bowlerTeam = $_POST['teams'][$i];
                $bowlerGame1 = $_POST['bowlergame1'][$i];
                $bowlerGame2 = $_POST['bowlergame2'][$i];
                $bowlerGame3 = $_POST['bowlergame3'][$i];
                $bowlerGame4 = $_POST['bowlergame4'][$i];
                $bowlerGame5 = $_POST['bowlergame5'][$i];

                $statement = $db->prepare("INSERT INTO bowlerdata (`bowlerid`, `eventdate`, `year`, `event`, `eventtype`, `team`, `name`, `average`, `game1`, `game2`, `game3`, `game4`, `game5`, `totalpinfall`, `totalgames`, `enteravg`, `entryby`)
                VALUES(:bowlerid, :eventdate, :year, :event, :eventType, :team, :name, :average, :game1, :game2, :game3, :game4, :game5, :totalpinfall, :totalgames, :enteravg, :entryby)");
                
                $statement->execute(array(
                    "bowlerid" => "$bowlerID",
                    "eventdate" => "$eventdate",
                    "year" => "$year",
                    "event" => $tourstop,
                    "eventType" => $eventType,
                    "team" => $bowlerTeam,
                    "name" => $bowlerName,
                    "average" => $average,
                    "game1" => $bowlerGame1,
                    "game2" => $bowlerGame2,
                    "game3" => $bowlerGame3,
                    "game4" => $bowlerGame4,
                    "game5" => $bowlerGame5,
                    "totalpinfall" => $totalpinfall,
                    "totalgames" => $totalgames,
                    "enteravg" => $enteravg,
                    "entryby" => $entryby
                ));

                // Calculate UBA & Season Tour Average
        $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedEvents = $sql->fetchAll();

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedSeasonTour = $sql->fetchAll();

        $dataFetched = array_merge($dataFetchedEvents,$dataFetchedSeasonTour);

        // var_dump($dataFetched);

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

                if ($totalGames < 9) {
                    $ubaAvg = 0;
                }
    
                $ubaAvg = number_format($ubaAvg,2);


        

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
        } elseif ($tourstop == 'Last Man/Woman Standing') {
            $noOfBowlers = sizeof($_POST['bowler']);
    
            // $b1 = $_POST["b1"];
    
            for ($i=0; $i < $noOfBowlers; $i++) { 
                $bowlerData = $_POST['bowler'][$i];
                $bowlerData = preg_split("#/#", $bowlerData);
    
                $bowlerName = $bowlerData[0];
                $bowlerID = $bowlerData[1];
                $bowlerTeam = $_POST['teams'][$i];
                $bowlerGame1 = $_POST['bowlergame1'][$i];
                $bowlerGame2 = $_POST['bowlergame2'][$i];
                $bowlerGame3 = $_POST['bowlergame3'][$i];
                $bowlerGame4 = $_POST['bowlergame4'][$i];
                $bowlerGame5 = 0;

                $statement = $db->prepare("INSERT INTO bowlerdata (`bowlerid`, `eventdate`, `year`, `event`, `eventtype`, `team`, `name`, `average`, `game1`, `game2`, `game3`, `game4`, `game5`, `totalpinfall`, `totalgames`, `enteravg`, `entryby`)
                VALUES(:bowlerid, :eventdate, :year, :event, :eventType, :team, :name, :average, :game1, :game2, :game3, :game4, :game5, :totalpinfall, :totalgames, :enteravg, :entryby)");
                
                $statement->execute(array(
                    "bowlerid" => "$bowlerID",
                    "eventdate" => "$eventdate",
                    "year" => "$year",
                    "event" => $tourstop,
                    "eventType" => $eventType,
                    "team" => $bowlerTeam,
                    "name" => $bowlerName,
                    "average" => $average,
                    "game1" => $bowlerGame1,
                    "game2" => $bowlerGame2,
                    "game3" => $bowlerGame3,
                    "game4" => $bowlerGame4,
                    "game5" => $bowlerGame5,
                    "totalpinfall" => $totalpinfall,
                    "totalgames" => $totalgames,
                    "enteravg" => $enteravg,
                    "entryby" => $entryby
                ));

                // Calculate UBA & Season Tour Average
        $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedEvents = $sql->fetchAll();

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedSeasonTour = $sql->fetchAll();

        $dataFetched = array_merge($dataFetchedEvents,$dataFetchedSeasonTour);

        // var_dump($dataFetched);

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

                if ($totalGames < 9) {
                    $ubaAvg = 0;
                }
    
                $ubaAvg = number_format($ubaAvg,2);


        

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
        } elseif ($tourstop == 'The Draft' || $tourstop == 'Gauntlet') {
            $noOfBowlers = sizeof($_POST['bowler']);
    
            // $b1 = $_POST["b1"];
    
            for ($i=0; $i < $noOfBowlers; $i++) { 
                $bowlerData = $_POST['bowler'][$i];
                $bowlerData = preg_split("#/#", $bowlerData);
    
                $bowlerName = $bowlerData[0];
                $bowlerID = $bowlerData[1];
                $bowlerTeam = $_POST['teams'][$i];
                $bowlerGame1 = $_POST['bowlergame1'][$i];
                $bowlerGame2 = $_POST['bowlergame2'][$i];
                $bowlerGame3 = $_POST['bowlergame3'][$i];
                $bowlerGame4 = 0;
                $bowlerGame5 = 0;

                $statement = $db->prepare("INSERT INTO bowlerdata (`bowlerid`, `eventdate`, `year`, `event`, `eventtype`, `team`, `name`, `average`, `game1`, `game2`, `game3`, `game4`, `game5`, `totalpinfall`, `totalgames`, `enteravg`, `entryby`)
                VALUES(:bowlerid, :eventdate, :year, :event, :eventType, :team, :name, :average, :game1, :game2, :game3, :game4, :game5, :totalpinfall, :totalgames, :enteravg, :entryby)");
                
                $statement->execute(array(
                    "bowlerid" => "$bowlerID",
                    "eventdate" => "$eventdate",
                    "year" => "$year",
                    "event" => $tourstop,
                    "eventType" => $eventType,
                    "team" => $bowlerTeam,
                    "name" => $bowlerName,
                    "average" => $average,
                    "game1" => $bowlerGame1,
                    "game2" => $bowlerGame2,
                    "game3" => $bowlerGame3,
                    "game4" => $bowlerGame4,
                    "game5" => $bowlerGame5,
                    "totalpinfall" => $totalpinfall,
                    "totalgames" => $totalgames,
                    "enteravg" => $enteravg,
                    "entryby" => $entryby
                ));

                // Calculate UBA & Season Tour Average
        $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedEvents = $sql->fetchAll();

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedSeasonTour = $sql->fetchAll();

        $dataFetched = array_merge($dataFetchedEvents,$dataFetchedSeasonTour);

        // var_dump($dataFetched);

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

                if ($totalGames < 9) {
                    $ubaAvg = 0;
                }
    
                $ubaAvg = number_format($ubaAvg,2);


        

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
        } elseif ($tourstop == 'Rankings Qualifier') {
            $noOfBowlers = sizeof($_POST['bowler']);
    
            // $b1 = $_POST["b1"];
    
            for ($i=0; $i < $noOfBowlers; $i++) { 
                $bowlerData = $_POST['bowler'][$i];
                $bowlerData = preg_split("#/#", $bowlerData);
    
                $bowlerName = $bowlerData[0];
                $bowlerID = $bowlerData[1];
                $bowlerTeam = $_POST['teams'][0];
                $bowlerGame1 = $_POST['bowlergame1'][$i];
                $bowlerGame2 = $_POST['bowlergame2'][$i];
                $bowlerGame3 = $_POST['bowlergame3'][$i];
                $bowlerGame4 = $_POST['bowlergame4'][$i];
                $bowlerGame5 = $_POST['bowlergame5'][$i];


                $statement = $db->prepare("INSERT INTO bowlerdata (`bowlerid`, `eventdate`, `year`, `event`, `eventtype`, `team`, `name`, `average`, `game1`, `game2`, `game3`, `game4`, `game5`, `totalpinfall`, `totalgames`, `enteravg`, `entryby`)
                VALUES(:bowlerid, :eventdate, :year, :event, :eventType, :team, :name, :average, :game1, :game2, :game3, :game4, :game5, :totalpinfall, :totalgames, :enteravg, :entryby)");
                
                $statement->execute(array(
                    "bowlerid" => "$bowlerID",
                    "eventdate" => "$eventdate",
                    "year" => "$year",
                    "event" => $tourstop,
                    "eventType" => $eventType,
                    "team" => $bowlerTeam,
                    "name" => $bowlerName,
                    "average" => $average,
                    "game1" => $bowlerGame1,
                    "game2" => $bowlerGame2,
                    "game3" => $bowlerGame3,
                    "game4" => $bowlerGame4,
                    "game5" => $bowlerGame5,
                    "totalpinfall" => $totalpinfall,
                    "totalgames" => $totalgames,
                    "enteravg" => $enteravg,
                    "entryby" => $entryby
                ));

                // Calculate UBA & Season Tour Average
        $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedEvents = $sql->fetchAll();

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedSeasonTour = $sql->fetchAll();

        $dataFetched = array_merge($dataFetchedEvents,$dataFetchedSeasonTour);

        // var_dump($dataFetched);

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

                if ($totalGames < 9) {
                    $ubaAvg = 0;
                }
    
                $ubaAvg = number_format($ubaAvg,2);


        

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
        } elseif ($tourstop == 'Team Relay') {
            $noOfBowlers = sizeof($_POST['bowler']);
    
            // $b1 = $_POST["b1"];
    
            for ($i=0; $i < $noOfBowlers; $i++) { 
                $bowlerData = $_POST['bowler'][$i];
                $bowlerData = preg_split("#/#", $bowlerData);
    
                $bowlerName = $bowlerData[0];
                $bowlerID = $bowlerData[1];
                $bowlerTeam = $_POST['teams'][0];
                $bowlerGame1 = $_POST['bowlergame1'][$i];
                $bowlerGame2 = $_POST['bowlergame2'][$i];
                $bowlerGame3 = $_POST['bowlergame3'][$i];
                $bowlerGame4 = 0;
                $bowlerGame5 = 0;


                $statement = $db->prepare("INSERT INTO bowlerdata (`bowlerid`, `eventdate`, `year`, `event`, `eventtype`, `team`, `name`, `average`, `game1`, `game2`, `game3`, `game4`, `game5`, `totalpinfall`, `totalgames`, `enteravg`, `entryby`)
                VALUES(:bowlerid, :eventdate, :year, :event, :eventType, :team, :name, :average, :game1, :game2, :game3, :game4, :game5, :totalpinfall, :totalgames, :enteravg, :entryby)");
                
                $statement->execute(array(
                    "bowlerid" => "$bowlerID",
                    "eventdate" => "$eventdate",
                    "year" => "$year",
                    "event" => $tourstop,
                    "eventType" => $eventType,
                    "team" => $bowlerTeam,
                    "name" => $bowlerName,
                    "average" => $average,
                    "game1" => $bowlerGame1,
                    "game2" => $bowlerGame2,
                    "game3" => $bowlerGame3,
                    "game4" => $bowlerGame4,
                    "game5" => $bowlerGame5,
                    "totalpinfall" => $totalpinfall,
                    "totalgames" => $totalgames,
                    "enteravg" => $enteravg,
                    "entryby" => $entryby
                ));

                // Calculate UBA & Season Tour Average
        $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedEvents = $sql->fetchAll();

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedSeasonTour = $sql->fetchAll();

        $dataFetched = array_merge($dataFetchedEvents,$dataFetchedSeasonTour);

        // var_dump($dataFetched);

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

                if ($totalGames < 9) {
                    $ubaAvg = 0;
                }
    
                $ubaAvg = number_format($ubaAvg,2);


        

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
        } elseif ($tourstop == 'Last Team Standing') {
            $noOfBowlers = sizeof($_POST['bowler']);
    
            // $b1 = $_POST["b1"];
    
            for ($i=0; $i < $noOfBowlers; $i++) { 
                $bowlerData = $_POST['bowler'][$i];
                $bowlerData = preg_split("#/#", $bowlerData);
    
                $bowlerName = $bowlerData[0];
                $bowlerID = $bowlerData[1];
                $bowlerTeam = $_POST['teams'][0];
                $bowlerGame1 = $_POST['bowlergame1'][$i];
                $bowlerGame2 = $_POST['bowlergame2'][$i];
                $bowlerGame3 = $_POST['bowlergame3'][$i];
                $bowlerGame4 = 0;
                $bowlerGame5 = 0;


                $statement = $db->prepare("INSERT INTO bowlerdata (`bowlerid`, `eventdate`, `year`, `event`, `eventtype`, `team`, `name`, `average`, `game1`, `game2`, `game3`, `game4`, `game5`, `totalpinfall`, `totalgames`, `enteravg`, `entryby`)
                VALUES(:bowlerid, :eventdate, :year, :event, :eventType, :team, :name, :average, :game1, :game2, :game3, :game4, :game5, :totalpinfall, :totalgames, :enteravg, :entryby)");
                
                $statement->execute(array(
                    "bowlerid" => "$bowlerID",
                    "eventdate" => "$eventdate",
                    "year" => "$year",
                    "event" => $tourstop,
                    "eventType" => $eventType,
                    "team" => $bowlerTeam,
                    "name" => $bowlerName,
                    "average" => $average,
                    "game1" => $bowlerGame1,
                    "game2" => $bowlerGame2,
                    "game3" => $bowlerGame3,
                    "game4" => $bowlerGame4,
                    "game5" => $bowlerGame5,
                    "totalpinfall" => $totalpinfall,
                    "totalgames" => $totalgames,
                    "enteravg" => $enteravg,
                    "entryby" => $entryby
                ));

                // Calculate UBA & Season Tour Average
        $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedEvents = $sql->fetchAll();

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedSeasonTour = $sql->fetchAll();

        $dataFetched = array_merge($dataFetchedEvents,$dataFetchedSeasonTour);

        // var_dump($dataFetched);

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

                if ($totalGames < 9) {
                    $ubaAvg = 0;
                }
    
                $ubaAvg = number_format($ubaAvg,2);


        

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
        }

        // for ($i=0; $i < 10; $i++) { 
           

            
        // }

        $_SESSION['scoreAddedEvent'] = true;
        header("Location: ".$base_url."/dashboard/addscoreevent.php");

        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    // $b1 = $_POST["b1"];
    // $b2 = $_POST["b2"];

    // $b1 = preg_split("#/#", $b1);
    // $b2 = preg_split("#/#", $b2);

    // $b1Name = $b1[0];
    // $b1ID = $b1[1];
    // $b2Name = $b2[0];
    // $b2ID = $b2[1];

    // if ($tourstop == 'Last Team Standing' || $tourstop == 'Gauntlet' || $tourstop == 'Unholy Alliance') {
    //     $b3 = $_POST["b3"];
    //     $b3 = preg_split("#/#", $b3);
    //     $b3Name = $b3[0];
    //     $b3ID = $b3[1];
    // } elseif ($tourstop == 'The Draft') {
    //     $b3 = $_POST["b3"];
    //     $b3 = preg_split("#/#", $b3);
    //     $b3Name = $b3[0];
    //     $b3ID = $b3[1];

    //     $b4 = $_POST["b4"];
    //     $b4 = preg_split("#/#", $b4);
    //     $b4Name = $b4[0];
    //     $b4ID = $b4[1];
    // } elseif ($tourstop == 'Team Relay' || $tourstop == 'Rankings Qualifier') {
    //     $b3 = $_POST["b3"];
    //     $b3 = preg_split("#/#", $b3);
    //     $b3Name = $b3[0];
    //     $b3ID = $b3[1];

    //     $b4 = $_POST["b4"];
    //     $b4 = preg_split("#/#", $b4);
    //     $b4Name = $b4[0];
    //     $b4ID = $b4[1];
        
    //     $b5 = $_POST["b5"];
    //     $b5 = preg_split("#/#", $b5);
    //     $b5Name = $b5[0];
    //     $b5ID = $b5[1];

    //     $b6 = $_POST["b6"];
    //     $b6 = preg_split("#/#", $b6);
    //     $b6Name = $b6[0];
    //     $b6ID = $b6[1];
    // }

    // $sb1 = $_POST["sb1"];
    // $sb2 = $_POST["sb2"];
    // $sb3 = $_POST["sb3"];
    // $h1b1 = $_POST["h1b1"];
    // $h1b2 = $_POST["h1b2"];
    // $h1b3 = $_POST["h1b3"];
    // $h2b1 = $_POST["h2b1"];
    // $h2b2 = $_POST["h2b2"];
    // $h2b3 = $_POST["h2b3"];
    // $sub = $_POST["sub"];

    // $sb1 = preg_split("#/#", $sb1);
    // $sb2 = preg_split("#/#", $sb2);
    // $sb3 = preg_split("#/#", $sb3);
    // $h1b1 = preg_split("#/#", $h1b1);
    // $h1b2 = preg_split("#/#", $h1b2);
    // $h1b3 = preg_split("#/#", $h1b3);
    // $h2b1 = preg_split("#/#", $h2b1);
    // $h2b2 = preg_split("#/#", $h2b2);
    // $h2b3 = preg_split("#/#", $h2b3);
    // $sub = preg_split("#/#", $sub);

    // $sb1Name = $sb1[0];
    // $sb1ID = $sb1[1];
    // $sb2Name = $sb2[0];
    // $sb2ID = $sb2[1];
    // $sb3Name = $sb3[0];
    // $sb3ID = $sb3[1];

    // $h1b1Name = $h1b1[0];
    // $h1b1ID = $h1b1[1];
    // $h1b2Name = $h1b2[0];
    // $h1b2ID = $h1b2[1];
    // $h1b3Name = $h1b3[0];
    // $h1b3ID = $h1b3[1];

    // $h2b1Name = $h2b1[0];
    // $h2b1ID = $h2b1[1];
    // $h2b2Name = $h2b2[0];
    // $h2b2ID = $h2b2[1];
    // $h2b3Name = $h2b3[0];
    // $h2b3ID = $h2b3[1];

    // $h3b1Name = $h3b1[0];
    // $h3b1ID = $h3b1[1];
    // $h3b2Name = $h3b2[0];
    // $h3b2ID = $h3b2[1];
    // $h3b3Name = $h3b3[0];
    // $h3b3ID = $h3b3[1];

    // $subName = $sub[0];
    // $subID = $sub[1];

    // $b1g1 = $_POST["b1g1"];
    // $b2g1 = $_POST["b2g1"];
    // $b3g1 = $_POST["b3g1"];
    // $b4g1 = $_POST["b4g1"];
    // $b5g1 = $_POST["b5g1"];
    // $b6g1 = $_POST["b6g1"];
    
    // $b1g2= $_POST["b1g2"];
    // $b2g2= $_POST["b2g2"];
    // $b3g2= $_POST["b3g2"];
    // $b4g2= $_POST["b4g2"];
    // $b5g2= $_POST["b5g2"];
    // $b6g2= $_POST["b6g2"];

    // $b1g3= $_POST["b1g3"];
    // $b2g3= $_POST["b2g3"];
    // $b3g3= $_POST["b3g3"];
    // $b4g3= $_POST["b4g3"];
    // $b5g3= $_POST["b5g3"];
    // $b6g3= $_POST["b6g3"];
    

    // echo $eventtype;
    // echo $year;
    // echo $eventdate;
    // echo $tourstop;
    // echo $location;
    // echo $team;

    // echo $h1b1Name;
    // echo $h1b1ID;
    // echo $h1b2Name;
    // echo $h1b2ID;
    // echo $h1b3Name;
    // echo $h1b3ID;

    // echo $h2b1Name;
    // echo $h2b1ID;
    // echo $h2b2Name;
    // echo $h2b2ID;
    // echo $h2b3Name;
    // echo $h2b3ID;

    // echo $h3b1Name;
    // echo $h3b1ID;
    // echo $h3b2Name;
    // echo $h3b2ID;
    // echo $h3b3Name;
    // echo $h3b3ID;

    // echo $sb1g1;
    // echo $sb2g1;
    // echo $sb3g1;
    // echo $h1b1g1;
    // echo $h1b2g1;
    // echo $h1b3g1;
    // echo $h2b1g1;
    // echo $h2b2g1;
    // echo $h2b3g1;

    // echo $sb1g2;
    // echo $sb2g2;
    // echo $sb3g2;
    // echo $h1b1g2;
    // echo $h1b2g2;
    // echo $h1b3g2;
    // echo $h2b1g2;
    // echo $h2b2g2;
    // echo $h2b3g2;

    // echo $sb1g3;
    // echo $sb2g3;
    // echo $sb3g3;
    // echo $h1b1g3;
    // echo $h1b2g3;
    // echo $h1b3g3;
    // echo $h2b1g3;
    // echo $h2b2g3;
    // echo $h2b3g3;

    

?>