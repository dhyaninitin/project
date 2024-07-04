<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';

    if($_SESSION['userrole'] == 'president' || $_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'secretary' || $_SESSION['userrole'] == 'eventstaff' || $_SESSION['userrole'] == 'owner'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    $userID = $_POST['userID'];
    $eventDate = date('Y-m-d H:i:s',strtotime($_POST['datepicker']));
    $eventyear = $_POST['year'];
    $eventName = $_POST['eventName'];
    $eventLocation = $_POST['location'];
    $bowler = $_POST['bowler'];
    $team = $_POST['team'];
    $game1 = $_POST['game1'];
    $game2 = $_POST['game2'];
    $game3 = $_POST['game3'];



    try {
        $database = new Connection();
        $db = $database->openConnection();

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
        

            $_SESSION['success'] = 'Score Entry Updated';
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