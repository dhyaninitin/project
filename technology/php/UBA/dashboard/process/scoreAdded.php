<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';

    // if($_SESSION['userrole'] != 'admin'){
    //     header("Location: /dashboard/home.php");
    // }

    if($_SESSION['userrole'] == 'president' || $_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'eventstaff' || $_SESSION['userrole'] == 'owner' || $_SESSION['userrole'] == 'secretary'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    $sb1 = $_POST["sb1"];
    $sb2 = $_POST["sb2"];
    $sb3 = $_POST["sb3"];
    $h1b1 = $_POST["h1b1"];
    $h1b2 = $_POST["h1b2"];
    $h1b3 = $_POST["h1b3"];
    $h2b1 = $_POST["h2b1"];
    $h2b2 = $_POST["h2b2"];
    $h2b3 = $_POST["h2b3"];
    $sub = $_POST["sub"];

    $sb1 = preg_split("#/#", $sb1);
    $sb2 = preg_split("#/#", $sb2);
    $sb3 = preg_split("#/#", $sb3);
    $h1b1 = preg_split("#/#", $h1b1);
    $h1b2 = preg_split("#/#", $h1b2);
    $h1b3 = preg_split("#/#", $h1b3);
    $h2b1 = preg_split("#/#", $h2b1);
    $h2b2 = preg_split("#/#", $h2b2);
    $h2b3 = preg_split("#/#", $h2b3);
    $sub = preg_split("#/#", $sub);

    $sb1Name = $sb1[0];
    $sb1ID = $sb1[1];
    $sb2Name = $sb2[0];
    $sb2ID = $sb2[1];
    $sb3Name = $sb3[0];
    $sb3ID = $sb3[1];

    $h1b1Name = $h1b1[0];
    $h1b1ID = $h1b1[1];
    $h1b2Name = $h1b2[0];
    $h1b2ID = $h1b2[1];
    $h1b3Name = $h1b3[0];
    $h1b3ID = $h1b3[1];

    $h2b1Name = $h2b1[0];
    $h2b1ID = $h2b1[1];
    $h2b2Name = $h2b2[0];
    $h2b2ID = $h2b2[1];
    $h2b3Name = $h2b3[0];
    $h2b3ID = $h2b3[1];

    $h3b1Name = $h3b1[0];
    $h3b1ID = $h3b1[1];
    $h3b2Name = $h3b2[0];
    $h3b2ID = $h3b2[1];
    $h3b3Name = $h3b3[0];
    $h3b3ID = $h3b3[1];

    $subName = $sub[0];
    $subID = $sub[1];

    $sb1g1 = $_POST["sb1g1"];
    $sb2g1 = $_POST["sb2g1"];
    $sb3g1 = $_POST["sb3g1"];
    $h1b1g1= $_POST["h1b1g1"];
    $h1b2g1= $_POST["h1b2g1"];
    $h1b3g1= $_POST["h1b3g1"];
    $h2b1g1= $_POST["h2b1g1"];
    $h2b2g1= $_POST["h2b2g1"];
    $h2b3g1= $_POST["h2b3g1"];
    $subg1= $_POST["subg1"];

    $sb1g2= $_POST["sb1g2"];
    $sb2g2= $_POST["sb2g2"];
    $sb3g2= $_POST["sb3g2"];
    $h1b1g2 = $_POST["h1b1g2"];
    $h1b2g2 = $_POST["h1b2g2"];
    $h1b3g2 = $_POST["h1b3g2"];
    $h2b1g2 = $_POST["h2b1g2"];
    $h2b2g2 = $_POST["h2b2g2"];
    $h2b3g2 = $_POST["h2b3g2"];
    $subg2= $_POST["subg2"];

    $sb1g3= $_POST["sb1g3"];
    $sb2g3= $_POST["sb2g3"];
    $sb3g3= $_POST["sb3g3"];
    $h1b1g3 = $_POST["h1b1g3"];
    $h1b2g3 = $_POST["h1b2g3"];
    $h1b3g3 = $_POST["h1b3g3"];
    $h2b1g3 = $_POST["h2b1g3"];
    $h2b2g3 = $_POST["h2b2g3"];
    $h2b3g3 = $_POST["h2b3g3"];
    $subg3= $_POST["subg3"];

    // $eventtype = $_POST['type'];
    $year = $_POST['year'];
    $eventdate = date('Y-m-d H:i:s',strtotime($_POST['datepicker']));
    // $detaildate = date('Y-m-d H:i:s',strtotime($_POST['datepicker'];));
    $tourstop = $_POST['tourstop'];
    $location = $_POST['location'];
    $team = $_POST['teams'];

    $_SESSION['seasonData'] = true;
    $_SESSION['seasonYear'] = $year;
    $_SESSION['seasonDate'] = $_POST['datepicker'];
    $_SESSION['seasonTourStop'] = $tourstop;
    $_SESSION['seasonLocation'] = $location;
    $_SESSION['seasonTeam'] = $team;

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

        if (isset($_POST["sb1"])) {
            $bowlingType = 'Scratch';
            $bowlerNumber = 'Bowler 1';

            // for ($i=0; $i < 10; $i++) { 
                $statement = $db->prepare("INSERT INTO bowlerdataseason (`bowlerid`, `eventdate`, `year`, `event`, `location`, `team`, `name`, `average`, `game1`, `game2`, `game3`, `game4`, `game5`, `totalpinfall`, `totalgames`, `enteravg`, `bowlingType`, `bowlerNumber`, `entryby`)
                VALUES(:bowlerid, :eventdate, :year, :event, :location, :team, :name, :average, :game1, :game2, :game3, :game4, :game5, :totalpinfall, :totalgames, :enteravg, :bowlingType, :bowlerNumber, :entryby)");
                
                $statement->execute(array(
                    "bowlerid" => "$sb1ID",
                    "eventdate" => "$eventdate",
                    "year" => "$year",
                    "event" => $tourstop,
                    "location" => $location,
                    "team" => $team,
                    "name" => $sb1Name,
                    "average" => $average,
                    "game1" => $sb1g1,
                    "game2" => $sb1g2,
                    "game3" => $sb1g3,
                    "game4" => $game4,
                    "game5" => $game5,
                    "totalpinfall" => $totalpinfall,
                    "totalgames" => $totalgames,
                    "enteravg" => $enteravg,
                    "bowlingType" => $bowlingType,
                    "bowlerNumber" => $bowlerNumber,
                    "entryby" => $entryby
                ));

                // Calculate UBA & Season Tour Average
        $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$sb1ID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedEvents = $sql->fetchAll();

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$sb1ID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedSeasonTour = $sql->fetchAll();

        $dataFetched = array_merge($dataFetchedEvents,$dataFetchedSeasonTour);

        // var_dump($dataFetched);

            usort($dataFetched, function($a, $b) {
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


        

                $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$sb1ID' AND `year` = '2019/20' ORDER BY `eventdate` DESC LIMIT 60");
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
            $stmt->bindParam(':bowlerUBAID', $sb1ID);
            $stmt->execute();
        }

        if (isset($_POST["sb2"])) {
            $bowlingType = 'Scratch';
            $bowlerNumber = 'Bowler 2';

            $statement = $db->prepare("INSERT INTO bowlerdataseason (`bowlerid`, `eventdate`, `year`, `event`, `location`, `team`, `name`, `average`, `game1`, `game2`, `game3`, `game4`, `game5`, `totalpinfall`, `totalgames`, `enteravg`, `bowlingType`, `bowlerNumber`, `entryby`)
            VALUES(:bowlerid, :eventdate, :year, :event, :location, :team, :name, :average, :game1, :game2, :game3, :game4, :game5, :totalpinfall, :totalgames, :enteravg, :bowlingType, :bowlerNumber, :entryby)");
            
            $statement->execute(array(
                "bowlerid" => "$sb2ID",
                "eventdate" => "$eventdate",
                "year" => "$year",
                "event" => $tourstop,
                "location" => $location,
                "team" => $team,
                "name" => $sb2Name,
                "average" => $average,
                "game1" => $sb2g1,
                "game2" => $sb2g2,
                "game3" => $sb2g3,
                "game4" => $game4,
                "game5" => $game5,
                "totalpinfall" => $totalpinfall,
                "totalgames" => $totalgames,
                "enteravg" => $enteravg,
                "bowlingType" => $bowlingType,
                "bowlerNumber" => $bowlerNumber,
                "entryby" => $entryby
            ));

            // Calculate UBA & Season Tour Average
        $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$sb2ID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedEvents = $sql->fetchAll();

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$sb2ID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedSeasonTour = $sql->fetchAll();

        $dataFetched = array_merge($dataFetchedEvents,$dataFetchedSeasonTour);

        // var_dump($dataFetched);

            usort($dataFetched, function($a, $b) {
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


        

                $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$sb2ID' AND `year` = '2019/20' ORDER BY `eventdate` DESC LIMIT 60");
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
            $stmt->bindParam(':bowlerUBAID', $sb2ID);
            $stmt->execute();
        }

        if (isset($_POST["sb3"])) {
            $bowlingType = 'Scratch';
            $bowlerNumber = 'Bowler 3';

            $statement = $db->prepare("INSERT INTO bowlerdataseason (`bowlerid`, `eventdate`, `year`, `event`, `location`, `team`, `name`, `average`, `game1`, `game2`, `game3`, `game4`, `game5`, `totalpinfall`, `totalgames`, `enteravg`, `bowlingType`, `bowlerNumber`,`entryby`)
            VALUES(:bowlerid, :eventdate, :year, :event, :location, :team, :name, :average, :game1, :game2, :game3, :game4, :game5, :totalpinfall, :totalgames, :enteravg, :bowlingType, :bowlerNumber, :entryby)");
            
            $statement->execute(array(
                "bowlerid" => "$sb3ID",
                "eventdate" => "$eventdate",
                "year" => "$year",
                "event" => $tourstop,
                "location" => $location,
                "team" => $team,
                "name" => $sb3Name,
                "average" => $average,
                "game1" => $sb3g1,
                "game2" => $sb3g2,
                "game3" => $sb3g3,
                "game4" => $game4,
                "game5" => $game5,
                "totalpinfall" => $totalpinfall,
                "totalgames" => $totalgames,
                "enteravg" => $enteravg,
                "bowlingType" => $bowlingType,
                "bowlerNumber" => $bowlerNumber,
                "entryby" => $entryby
            ));

            // Calculate UBA & Season Tour Average
        $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$sb3ID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedEvents = $sql->fetchAll();

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$sb3ID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedSeasonTour = $sql->fetchAll();

        $dataFetched = array_merge($dataFetchedEvents,$dataFetchedSeasonTour);

        // var_dump($dataFetched);

            usort($dataFetched, function($a, $b) {
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


        

                $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$sb3ID' AND `year` = '2019/20' ORDER BY `eventdate` DESC LIMIT 60");
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
            $stmt->bindParam(':bowlerUBAID', $sb3ID);
            $stmt->execute();
        }

        if (isset($_POST["h1b1"])) {
            $bowlingType = 'Handicap 1';
            $bowlerNumber = 'Bowler 1';

            $statement = $db->prepare("INSERT INTO bowlerdataseason (`bowlerid`, `eventdate`, `year`, `event`, `location`, `team`, `name`, `average`, `game1`, `game2`, `game3`, `game4`, `game5`, `totalpinfall`, `totalgames`, `enteravg`, `bowlingType`, `bowlerNumber`,`entryby`)
            VALUES(:bowlerid, :eventdate, :year, :event, :location, :team, :name, :average, :game1, :game2, :game3, :game4, :game5, :totalpinfall, :totalgames, :enteravg, :bowlingType, :bowlerNumber, :entryby)");
            
            $statement->execute(array(
                "bowlerid" => "$h1b1ID",
                "eventdate" => "$eventdate",
                "year" => "$year",
                "event" => $tourstop,
                "location" => $location,
                "team" => $team,
                "name" => $h1b1Name,
                "average" => $average,
                "game1" => $h1b1g1,
                "game2" => $h1b1g2,
                "game3" => $h1b1g3,
                "game4" => $game4,
                "game5" => $game5,
                "totalpinfall" => $totalpinfall,
                "totalgames" => $totalgames,
                "enteravg" => $enteravg,
                "bowlingType" => $bowlingType,
                "bowlerNumber" => $bowlerNumber,
                "entryby" => $entryby
            ));

            // Calculate UBA & Season Tour Average
        $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$h1b1ID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedEvents = $sql->fetchAll();

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$h1b1ID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedSeasonTour = $sql->fetchAll();

        $dataFetched = array_merge($dataFetchedEvents,$dataFetchedSeasonTour);

        // var_dump($dataFetched);

            usort($dataFetched, function($a, $b) {
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


        

                $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$h1b1ID' AND `year` = '2019/20' ORDER BY `eventdate` DESC LIMIT 60");
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
            $stmt->bindParam(':bowlerUBAID', $h1b1ID);
            $stmt->execute();
        }

        if (isset($_POST["h1b2"])) {
            $bowlingType = 'Handicap 1';
            $bowlerNumber = 'Bowler 2';

            $statement = $db->prepare("INSERT INTO bowlerdataseason (`bowlerid`, `eventdate`, `year`, `event`, `location`, `team`, `name`, `average`, `game1`, `game2`, `game3`, `game4`, `game5`, `totalpinfall`, `totalgames`, `enteravg`, `bowlingType`, `bowlerNumber`,`entryby`)
            VALUES(:bowlerid, :eventdate, :year, :event, :location, :team, :name, :average, :game1, :game2, :game3, :game4, :game5, :totalpinfall, :totalgames, :enteravg, :bowlingType, :bowlerNumber, :entryby)");
            
            $statement->execute(array(
                "bowlerid" => "$h1b2ID",
                "eventdate" => "$eventdate",
                "year" => "$year",
                "event" => $tourstop,
                "location" => $location,
                "team" => $team,
                "name" => $h1b2Name,
                "average" => $average,
                "game1" => $h1b2g1,
                "game2" => $h1b2g2,
                "game3" => $h1b2g3,
                "game4" => $game4,
                "game5" => $game5,
                "totalpinfall" => $totalpinfall,
                "totalgames" => $totalgames,
                "enteravg" => $enteravg,
                "bowlingType" => $bowlingType,
                "bowlerNumber" => $bowlerNumber,
                "entryby" => $entryby
            ));

            // Calculate UBA & Season Tour Average
        $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$h1b2ID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedEvents = $sql->fetchAll();

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$h1b2ID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedSeasonTour = $sql->fetchAll();

        $dataFetched = array_merge($dataFetchedEvents,$dataFetchedSeasonTour);

        // var_dump($dataFetched);

            usort($dataFetched, function($a, $b) {
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


        

                $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$h1b2ID' AND `year` = '2019/20' ORDER BY `eventdate` DESC LIMIT 60");
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
            $stmt->bindParam(':bowlerUBAID', $h1b2ID);
            $stmt->execute();
        }

        if (isset($_POST["h1b3"])) {
            $bowlingType = 'Handicap 1';
            $bowlerNumber = 'Bowler 3';

            $statement = $db->prepare("INSERT INTO bowlerdataseason (`bowlerid`, `eventdate`, `year`, `event`, `location`, `team`, `name`, `average`, `game1`, `game2`, `game3`, `game4`, `game5`, `totalpinfall`, `totalgames`, `enteravg`, `bowlingType`, `bowlerNumber`,`entryby`)
            VALUES(:bowlerid, :eventdate, :year, :event, :location, :team, :name, :average, :game1, :game2, :game3, :game4, :game5, :totalpinfall, :totalgames, :enteravg, :bowlingType, :bowlerNumber, :entryby)");
            
            $statement->execute(array(
                "bowlerid" => "$h1b3ID",
                "eventdate" => "$eventdate",
                "year" => "$year",
                "event" => $tourstop,
                "location" => $location,
                "team" => $team,
                "name" => $h1b3Name,
                "average" => $average,
                "game1" => $h1b3g1,
                "game2" => $h1b3g2,
                "game3" => $h1b3g3,
                "game4" => $game4,
                "game5" => $game5,
                "totalpinfall" => $totalpinfall,
                "totalgames" => $totalgames,
                "enteravg" => $enteravg,
                "bowlingType" => $bowlingType,
                "bowlerNumber" => $bowlerNumber,
                "entryby" => $entryby
            ));

            // Calculate UBA & Season Tour Average
        $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$h1b3ID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedEvents = $sql->fetchAll();

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$h1b3ID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedSeasonTour = $sql->fetchAll();

        $dataFetched = array_merge($dataFetchedEvents,$dataFetchedSeasonTour);

        // var_dump($dataFetched);

            usort($dataFetched, function($a, $b) {
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


        

                $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$h1b3ID' AND `year` = '2019/20' ORDER BY `eventdate` DESC LIMIT 60");
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
            $stmt->bindParam(':bowlerUBAID', $h1b3ID);
            $stmt->execute();
        }

        if (isset($_POST["h2b1"])) {
            $bowlingType = 'Handicap 2';
            $bowlerNumber = 'Bowler 1';

            $statement = $db->prepare("INSERT INTO bowlerdataseason (`bowlerid`, `eventdate`, `year`, `event`, `location`, `team`, `name`, `average`, `game1`, `game2`, `game3`, `game4`, `game5`, `totalpinfall`, `totalgames`, `enteravg`, `bowlingType`, `bowlerNumber`,`entryby`)
            VALUES(:bowlerid, :eventdate, :year, :event, :location, :team, :name, :average, :game1, :game2, :game3, :game4, :game5, :totalpinfall, :totalgames, :enteravg, :bowlingType, :bowlerNumber, :entryby)");
            
            $statement->execute(array(
                "bowlerid" => "$h2b1ID",
                "eventdate" => "$eventdate",
                "year" => "$year",
                "event" => $tourstop,
                "location" => $location,
                "team" => $team,
                "name" => $h2b1Name,
                "average" => $average,
                "game1" => $h2b1g1,
                "game2" => $h2b1g2,
                "game3" => $h2b1g3,
                "game4" => $game4,
                "game5" => $game5,
                "totalpinfall" => $totalpinfall,
                "totalgames" => $totalgames,
                "enteravg" => $enteravg,
                "bowlingType" => $bowlingType,
                "bowlerNumber" => $bowlerNumber,
                "entryby" => $entryby
            ));

            // Calculate UBA & Season Tour Average
        $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$h2b1ID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedEvents = $sql->fetchAll();

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$h2b1ID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedSeasonTour = $sql->fetchAll();

        $dataFetched = array_merge($dataFetchedEvents,$dataFetchedSeasonTour);

        // var_dump($dataFetched);

            usort($dataFetched, function($a, $b) {
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


        

                $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$h2b1ID' AND `year` = '2019/20' ORDER BY `eventdate` DESC LIMIT 60");
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
            $stmt->bindParam(':bowlerUBAID', $h2b1ID);
            $stmt->execute();
        }

        if (isset($_POST["h2b2"])) {
            $bowlingType = 'Handicap 2';
            $bowlerNumber = 'Bowler 2';

            $statement = $db->prepare("INSERT INTO bowlerdataseason (`bowlerid`, `eventdate`, `year`, `event`, `location`, `team`, `name`, `average`, `game1`, `game2`, `game3`, `game4`, `game5`, `totalpinfall`, `totalgames`, `enteravg`, `bowlingType`, `bowlerNumber`,`entryby`)
            VALUES(:bowlerid, :eventdate, :year, :event, :location, :team, :name, :average, :game1, :game2, :game3, :game4, :game5, :totalpinfall, :totalgames, :enteravg, :bowlingType, :bowlerNumber, :entryby)");
            
            $statement->execute(array(
                "bowlerid" => "$h2b2ID",
                "eventdate" => "$eventdate",
                "year" => "$year",
                "event" => $tourstop,
                "location" => $location,
                "team" => $team,
                "name" => $h2b2Name,
                "average" => $average,
                "game1" => $h2b2g1,
                "game2" => $h2b2g2,
                "game3" => $h2b2g3,
                "game4" => $game4,
                "game5" => $game5,
                "totalpinfall" => $totalpinfall,
                "totalgames" => $totalgames,
                "enteravg" => $enteravg,
                "bowlingType" => $bowlingType,
                "bowlerNumber" => $bowlerNumber,
                "entryby" => $entryby
            ));

            // Calculate UBA & Season Tour Average
        $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$h2b2ID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedEvents = $sql->fetchAll();

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$h2b2ID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedSeasonTour = $sql->fetchAll();

        $dataFetched = array_merge($dataFetchedEvents,$dataFetchedSeasonTour);

        // var_dump($dataFetched);

            usort($dataFetched, function($a, $b) {
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


        

                $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$h2b2ID' AND `year` = '2019/20' ORDER BY `eventdate` DESC LIMIT 60");
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
            $stmt->bindParam(':bowlerUBAID', $h2b2ID);
            $stmt->execute();
        }

        if (isset($_POST["h2b3"])) {
            $bowlingType = 'Handicap 2';
            $bowlerNumber = 'Bowler 3';

            $statement = $db->prepare("INSERT INTO bowlerdataseason (`bowlerid`, `eventdate`, `year`, `event`, `location`, `team`, `name`, `average`, `game1`, `game2`, `game3`, `game4`, `game5`, `totalpinfall`, `totalgames`, `enteravg`, `bowlingType`, `bowlerNumber`,`entryby`)
            VALUES(:bowlerid, :eventdate, :year, :event, :location, :team, :name, :average, :game1, :game2, :game3, :game4, :game5, :totalpinfall, :totalgames, :enteravg, :bowlingType, :bowlerNumber, :entryby)");
            
            $statement->execute(array(
                "bowlerid" => "$h2b3ID",
                "eventdate" => "$eventdate",
                "year" => "$year",
                "event" => $tourstop,
                "location" => $location,
                "team" => $team,
                "name" => $h2b3Name,
                "average" => $average,
                "game1" => $h2b3g1,
                "game2" => $h2b3g2,
                "game3" => $h2b3g3,
                "game4" => $game4,
                "game5" => $game5,
                "totalpinfall" => $totalpinfall,
                "totalgames" => $totalgames,
                "enteravg" => $enteravg,
                "bowlingType" => $bowlingType,
                "bowlerNumber" => $bowlerNumber,
                "entryby" => $entryby
            ));

            // Calculate UBA & Season Tour Average
        $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$h2b3ID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedEvents = $sql->fetchAll();

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$h2b3ID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedSeasonTour = $sql->fetchAll();

        $dataFetched = array_merge($dataFetchedEvents,$dataFetchedSeasonTour);

        // var_dump($dataFetched);

            usort($dataFetched, function($a, $b) {
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


        

                $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$h2b3ID' AND `year` = '2019/20' ORDER BY `eventdate` DESC LIMIT 60");
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
            $stmt->bindParam(':bowlerUBAID', $h2b3ID);
            $stmt->execute();
        }

        
            if (isset($_POST["sub"])) {
                $bowlingType = '-';
                $bowlerNumber = 'Sub';

                $statement = $db->prepare("INSERT INTO bowlerdataseason (`bowlerid`, `eventdate`, `year`, `event`, `location`, `team`, `name`, `average`, `game1`, `game2`, `game3`, `game4`, `game5`, `totalpinfall`, `totalgames`, `enteravg`, `bowlingType`, `bowlerNumber`,`entryby`)
                VALUES(:bowlerid, :eventdate, :year, :event, :location, :team, :name, :average, :game1, :game2, :game3, :game4, :game5, :totalpinfall, :totalgames, :enteravg, :bowlingType, :bowlerNumber, :entryby)");
                
                $statement->execute(array(
                    "bowlerid" => "$subID",
                    "eventdate" => "$eventdate",
                    "year" => "$year",
                    "event" => $tourstop,
                    "location" => $location,
                    "team" => $team,
                    "name" => $subName,
                    "average" => $average,
                    "game1" => $subg1,
                    "game2" => $subg2,
                    "game3" => $subg3,
                    "game4" => $game4,
                    "game5" => $game5,
                    "totalpinfall" => $totalpinfall,
                    "totalgames" => $totalgames,
                    "enteravg" => $enteravg,
                    "bowlingType" => $bowlingType,
                    "bowlerNumber" => $bowlerNumber,
                    "entryby" => $entryby
                ));

                // Calculate UBA & Season Tour Average
        $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$subID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedEvents = $sql->fetchAll();

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$subID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedSeasonTour = $sql->fetchAll();

        $dataFetched = array_merge($dataFetchedEvents,$dataFetchedSeasonTour);

        // var_dump($dataFetched);

            usort($dataFetched, function($a, $b) {
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


        

                $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$subID' AND `year` = '2019/20' ORDER BY `eventdate` DESC LIMIT 60");
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
            $stmt->bindParam(':bowlerUBAID', $subID);
            $stmt->execute();
            }
        // }

        

        $_SESSION['scoreAddedSeason'] = true;
        header("Location: ".$base_url."/dashboard/addscoreseason.php");

        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

?>