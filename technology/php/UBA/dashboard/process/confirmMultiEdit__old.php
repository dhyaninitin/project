<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';

    if($_SESSION['userrole'] != 'admin'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    // $entries = $_POST['entries'];

    $tabIDs = $_POST['tabID'];
    $dates = $_POST['datepicker'];
    $years = $_POST['year'];
    $eventNames = $_POST['eventName'];
    $eventTypes = $_POST['eventType'];
    $locations = $_POST['location'];
    $bowlerNames = $_POST['bowler'];
    $teams = $_POST['team'];
    $game1s = $_POST['game1'];
    $game2s = $_POST['game2'];
    $game3s = $_POST['game3'];
    $game4s = $_POST['game4'];
    $game5s = $_POST['game5'];
    
    // var_dump($tabIDs);
    // echo '<br>';
    // var_dump($dates);
    // echo '<br>';
    // var_dump($years);
    // echo '<br>';
    // var_dump($eventNames);
    // echo '<br>';
    // var_dump($eventTypes);
    // echo '<br>';
    // var_dump($locations);
    // echo '<br>';
    // var_dump($bowlerNames);
    // echo '<br>';
    // var_dump($teams);
    // echo '<br>';
    // var_dump($game1s);
    // echo '<br>';
    // var_dump($game2s);
    // echo '<br>';
    // var_dump($game3s);
    // echo '<br>';
    // var_dump($game4s);
    // echo '<br>';
    // var_dump($game5s);
    // echo '<br>';
    // exit();

    try {
        $database = new Connection();
        $db = $database->openConnection();

        // $sql = "DELETE FROM bowlerdata WHERE `id`='$userID'";
        // $db->exec($sql);

        $allEntries = array();
        $noOfEntries = sizeof($tabIDs);

        $dataType = $_SESSION['scoreDataType'];

        if ($_SESSION['scoreDataType'] == 'event') {
            for ($i=0; $i < $noOfEntries; $i++) {
                $userID = $tabIDs[$i];
                $eventDate = date('Y-m-d H:i:s',strtotime($dates[$i]));
                $eventyear = $years[$i];
                $eventName = $eventNames[$i];
                $eventType = $eventType[$i];
                $team = $teams[$i];
                $bowler = $bowlerNames[$i];
                $game1 = $game1s[$i];
                $game2 = $game2s[$i];
                $game3 = $game3s[$i];
                $game4 = $game4s[$i];
                $game5 = $game5s[$i];

                $sql = "UPDATE bowlerdata 
                        SET `eventdate` = :eventDate,
                        `year` = :eventyear,
                        `event` = :eventName,
                        `eventtype` = :eventType,
                        `team` = :team,
                        `name` = :bowler,
                        `game1` = :game1,
                        `game2` = :game2,
                        `game3` = :game3,
                        `game4` = :game4,
                        `game5` = :game5
                        WHERE `id` = :userID";

                $stmt = $db->prepare($sql);

                $stmt->bindParam(':userID', $userID);
                $stmt->bindParam(':eventDate', $eventDate);
                $stmt->bindParam(':eventyear', $eventyear);
                $stmt->bindParam(':eventName', $eventName);
                $stmt->bindParam(':eventType', $eventType);
                $stmt->bindParam(':team', $team);
                $stmt->bindParam(':bowler', $bowler);
                $stmt->bindParam(':game1', $game1);
                $stmt->bindParam(':game2', $game2);
                $stmt->bindParam(':game3', $game3);
                $stmt->bindParam(':game4', $game4);
                $stmt->bindParam(':game5', $game5);

                $stmt->execute();   
                
                    // Calculate UBA & Season Tour Average
            $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `id` = '$userID'");
            $sql->execute();
            $bowlerIndData = $sql->fetch();

            $bowlerID = $bowlerIndData['bowlerid'];

           // Calculate UBA & Season Tour Average
        $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 50");
        $sql->execute();
        $dataFetchedEvents = $sql->fetchAll();

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 50");
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
            $_SESSION['success'] = 'Multiple Score Entries Updated';
            header("Location: ".$base_url."/dashboard/scoreData.php");
        } else {
            for ($i=0; $i < $noOfEntries; $i++) {
                $userID = $tabIDs[$i];
                $eventDate = date('Y-m-d H:i:s',strtotime($dates[$i]));
                $eventyear = $years[$i];
                $eventName = $eventNames[$i];
                $eventLocation = $locations[$i];
                $team = $teams[$i];
                $bowler = $bowlerNames[$i];
                $game1 = $game1s[$i];
                $game2 = $game2s[$i];
                $game3 = $game3s[$i];

                $sql = "UPDATE bowlerdataseason 
                        SET `eventdate` = :eventDate,
                        `year` = :eventyear,
                        `event` = :eventName,
                        `location` = :eventLocation,
                        `team` = :team,
                        `name` = :bowler,
                        `game1` = :game1,
                        `game2` = :game2,
                        `game3` = :game3
                        WHERE `id` = :userID";

                $stmt = $db->prepare($sql);

                $stmt->bindParam(':userID', $userID);
                $stmt->bindParam(':eventDate', $eventDate);
                $stmt->bindParam(':eventyear', $eventyear);
                $stmt->bindParam(':eventName', $eventName);
                $stmt->bindParam(':eventLocation', $eventLocation);
                $stmt->bindParam(':team', $team);
                $stmt->bindParam(':bowler', $bowler);
                $stmt->bindParam(':game1', $game1);
                $stmt->bindParam(':game2', $game2);
                $stmt->bindParam(':game3', $game3);

                $stmt->execute();     

                // Calculate UBA & Season Tour Average
            $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `id` = '$userID'");
            $sql->execute();
            $bowlerIndData = $sql->fetch();

            $bowlerID = $bowlerIndData['bowlerid'];

            // Calculate UBA & Season Tour Average
        $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 50");
        $sql->execute();
        $dataFetchedEvents = $sql->fetchAll();

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 50");
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
        
        
            $_SESSION['success'] = 'Multiple Score Entries Updated';
            header("Location: ".$base_url."/dashboard/scoreData.php");
        }
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    // echo password_hash("Hoolale.27", PASSWORD_BCRYPT, $options);

    // $hash = password_hash("Hoolale.27", PASSWORD_DEFAULT);

    // if (password_verify('Hoolale.27', $hash)) {
    //     echo 'Password is valid!';
    // } else {
    //     echo 'Invalid password.';
    // }

    

    // try {
    //     $database = new Connection();
    //     $db = $database->openConnection();

    //     $sql = $db->prepare("SELECT * FROM `teams` WHERE `$column` LIKE '%$searchTerm%' GROUP BY `teamname` ORDER BY `teamname`");
    //     $sql->execute();
    //     $dataFetched = $sql->fetchAll();
        
    // } catch (PDOException $e) {
    //     echo "There was some problem with the connection: " . $e->getMessage();
    // }

?>