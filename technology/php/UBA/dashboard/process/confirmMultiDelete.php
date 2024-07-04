<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';

    if($_SESSION['userrole'] != 'admin'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    $entries = $_POST['entries'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        // $sql = "DELETE FROM bowlerdata WHERE `id`='$userID'";
        // $db->exec($sql);

        $allEntries = array();
        $noOfEntries = sizeof($entries);

        $dataType = $_SESSION['scoreDataType'];

        if ($_SESSION['scoreDataType'] == 'event') {
            for ($i=0; $i < $noOfEntries; $i++) {
                $rowID = $entries[$i];

                $sql = $db->prepare("SELECT `bowlerid` FROM `bowlerdata` WHERE `id` = '$rowID' ");
                $sql->execute();
                $bowlerIndData = $sql->fetch();
                $bowlerID = $bowlerIndData['bowlerid'];

                if (!in_array($bowlerID, $allEntries) ) {
                    array_push($allEntries, $bowlerID);
                }

                $sql = ("DELETE FROM `bowlerdata` WHERE `id` = '$rowID'");
                $db->exec($sql);
            }
        } else {
            for ($i=0; $i < $noOfEntries; $i++) {
                $rowID = $entries[$i];

                $sql = $db->prepare("SELECT `bowlerid` FROM `bowlerdataseason` WHERE `id` = '$rowID' ");
                $sql->execute();
                $bowlerIndData = $sql->fetch();
                $bowlerID = $bowlerIndData['bowlerid'];

                
                if (!in_array($bowlerID, $allEntries) ) {
                    array_push($allEntries, $bowlerID);
                }

                $sql = ("DELETE FROM `bowlerdataseason` WHERE `id` = '$rowID'");
                $db->exec($sql);
            }
        }

        


        if ($_SESSION['scoreDataType'] == 'event') {
            
            for ($i=0; $i < sizeof($allEntries); $i++) {
                $bowlerID = $allEntries[$i];


               // Calculate UBA & Season Tour Average
        $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedEvents = $sql->fetchAll();

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 60");
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

        } else {
            
            for ($i=0; $i < sizeof($allEntries); $i++) {
                $bowlerID = $allEntries[$i];

               // Calculate UBA & Season Tour Average
        $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 60");
        $sql->execute();
        $dataFetchedEvents = $sql->fetchAll();

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 60");
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

        $_SESSION['success'] = 'Score Entries Deleted';
        header("Location: ".$base_url."/dashboard/scoreData.php");
        
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