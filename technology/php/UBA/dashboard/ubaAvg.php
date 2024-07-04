<?php

    include_once '../connect.php';

    $bowlerID = $_POST['bowlID'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 50");
        $sql->execute();
        $dataFetchedEvents = $sql->fetchAll();

        $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC LIMIT 50");
        $sql->execute();
        $dataFetchedSeasonTour = $sql->fetchAll();

        $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `bowlerid` = '$bowlerID'");
        $sql->execute();
        $bowlerEAData = $sql->fetch();

        $bowlerEA = $bowlerEAData['enteringAvg'];
        $bowlerEA = (float)$bowlerEA;

        $bowlerSA = $bowlerEAData['seasontourAvg'];
        $bowlerSA = (float)$bowlerSA;

        $bowlerUBA = $bowlerEAData['ubaAvg'];
        $bowlerUBA = (float)$bowlerUBA;


		$avrgseason = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC");
		$avrgseason->execute();
        $avrgseasonAll = $avrgseason->fetchAll();
        	// $gametotalValue = 0;
        	// $numbers = 0;
        	// $gamesArray = [];
        	$data = array(); $singleEvent = array(); $envetssss = array();
        	foreach ($avrgseasonAll as $seasonVal) {
        		$tourStop = $seasonVal['event'];
                $eventLocation = $seasonVal['location'];
                $eventDate = $seasonVal['eventdate'];
                $team = $seasonVal['team'];
                $game1 = $seasonVal['game1'];
                $game2 = $seasonVal['game2'];
                $game3 = $seasonVal['game3'];
                $totalPinfall = $game1 + $game2 + $game3;

                $singleEvent['tourStop'] = $tourStop;
                // $singleEvent['eventDate'] = $eventDate;
                $singleEvent['location'] = $eventLocation;
                $singleEvent['team'] = $team;
                $singleEvent['pinfall'] = $totalPinfall;

                //Our YYYY-MM-DD date.
                $ymd = $eventDate;                
                //Convert it into a timestamp.
                $timestamp = strtotime($ymd);
                //Convert it to DD-MM-YYYY
                $dmy = date("m-d-Y", $timestamp);
                
                $singleEvent['eventDate'] = $dmy;

                if ($game1 > 0) {
                    $singleEvent['game 1'] = $game1;
                } else {
                    $singleEvent['game 1'] = '-';
                }
                if ($game2 > 0) {
                    $singleEvent['game 2'] = $game2;
                } else {
                    $singleEvent['game 2'] = '-';
                }
                if ($game3 > 0) {
                    $singleEvent['game 3'] = $game3;
                } else {
                    $singleEvent['game 3'] = '-';
                }

                array_push($data, $singleEvent);
                $singleEvent = array();
        	
        	}
        	
        	
					$eventsql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$bowlerID' ORDER BY `event` ASC");
					$eventsql->execute();
					$eventdataFetched = $eventsql->fetchAll();
				
					usort($eventdataFetched, function ($a, $b){
		                
		                if ($a['eventdate'] == $b['eventdate']) {
		                    return strtotime($b['logtime']) - strtotime($a['logtime']);
		                }
		
		                return strtotime($b['eventdate']) - strtotime($a['eventdate']);
		            });	
		            
		            foreach ($eventdataFetched as $event) {
		                $eventName = $event['event'];
		                $eventDate = $event['eventdate'];
		                $game1 = $event['game1'];
		                $game2 = $event['game2'];
		                $game3 = $event['game3'];
		                $game4 = $event['game4'];
		                $game5 = $event['game5'];
		                $totalPinfall = $game1 + $game2 + $game3 + $game4 + $game5;
		
		                $singleEvent['event'] = $eventName;
		                // $singleEvent['eventDate'] = $eventDate;
		                $singleEvent['pinfall'] = $totalPinfall;
		
		                //Our YYYY-MM-DD date.
		                $ymd = $eventDate;                
		                //Convert it into a timestamp.
		                $timestamp = strtotime($ymd);
		                //Convert it to DD-MM-YYYY
		                $dmy = date("m-d-Y", $timestamp);
		                
		                $singleEvent['eventDate'] = $dmy;
		
		                if ($game1 > 0) {
		                    $singleEvent['game 1'] = $game1;
		                }
		                if ($game2 > 0) {
		                    $singleEvent['game 2'] = $game2;
		                }
		                if ($game3 > 0) {
		                    $singleEvent['game 3'] = $game3;
		                }
		                if ($game4 > 0) {
		                    $singleEvent['game 4'] = $game4;
		                } else {
		                    $singleEvent['game 4'] = '-';
		                }
		                if ($game5 > 0) {
		                    $singleEvent['game 5'] = $game5;
		                } else {
		                    $singleEvent['game 5'] = '-';
		                }
		
		                array_push($envetssss, $singleEvent);
		
		                $singleEvent = array();
		            }
        	
        	
        	
        	
        	// $totalAvrg = $gametotalValue / $numbers;
        	
        	
        
        
        
        // $dataFetched = array_merge($dataFetchedEvents,$dataFetchedSeasonTour);

        // usort($dataFetched, function ($a, $b){
                
        //     if ($a['eventdate'] == $b['eventdate']) {
        //         return strtotime($b['logtime']) - strtotime($a['logtime']);
        //     }

        //     return strtotime($b['eventdate']) - strtotime($a['eventdate']);
        // });

        // $gamesArr = array();
        // $gamesTotal = 0;

        // $totalPinfalls = 0;

        // $finalArr = array();

        // $sampleData = array();

        // foreach ($dataFetched as $eventRow) {

        //         if ($gamesTotal > 49) {
        //             break;
        //         }

        //         $game1 = $eventRow['game1'];
        //         $game2 = $eventRow['game2'];
        //         $game3 = $eventRow['game3'];
        //         $game4 = $eventRow['game4'];
        //         $game5 = $eventRow['game5'];

        //         $data = array();

        //         if ($game5 > 0 && $gamesTotal < 50) {
        //             array_push($gamesArr, $game5);
        //             $totalPinfalls += $game5;
        //             $gamesTotal++;
        //         }
        //         if ($game4 > 0 && $gamesTotal < 50) {
        //             array_push($gamesArr, $game4);
        //             $totalPinfalls += $game4;
        //             $gamesTotal++;
        //         }
        //         if ($game3 > 0 && $gamesTotal < 50) {
        //             array_push($gamesArr, $game3);
        //             $totalPinfalls += $game3;
        //             $gamesTotal++;
        //         }
        //         if ($game2 > 0 && $gamesTotal < 50) {
        //             array_push($gamesArr, $game2);
        //             $totalPinfalls += $game2;
        //             $gamesTotal++;
        //         }
        //         if ($game1 > 0 && $gamesTotal < 50) {
        //             array_push($gamesArr, $game1);
        //             $totalPinfalls += $game1;
        //             $gamesTotal++;
        //         }

        //         array_push($sampleData, $eventRow);
            
        // }

        // if ($gamesTotal < 9) {
        //     $bowlerUBA = 0;
        // }

        // $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerID' AND `year` = '2019/20' ORDER BY `eventdate` DESC LIMIT 50");
        // $sql->execute();
        // $dataFetchedSeasonTour = $sql->fetchAll();

        // $seasonTourGames = 0;

        // foreach ($dataFetchedSeasonTour as $eventRow) {

        //     if ($gamesTotal > 49) {
        //         break;
        //     }

        //     $game1 = $eventRow['game1'];
        //     $game2 = $eventRow['game2'];
        //     $game3 = $eventRow['game3'];

        //     $data = array();
        //     if ($game3 > 0 && $seasonTourGames < 50) {
        //         array_push($gamesArr, $game3);
        //         $totalPinfalls += $game3;
        //         $seasonTourGames++;
        //     }
        //     if ($game2 > 0 && $seasonTourGames < 50) {
        //         array_push($gamesArr, $game2);
        //         $totalPinfalls += $game2;
        //         $seasonTourGames++;
        //     }
        //     if ($game1 > 0 && $seasonTourGames < 50) {
        //         array_push($gamesArr, $game1);
        //         $totalPinfalls += $game1;
        //         $seasonTourGames++;
        //     }

        //     array_push($sampleData, $eventRow);
        
        // }

        // if ($seasonTourGames < 9) {
        //     $bowlerSA = 0;
        // }

        $finalArr['ubaAvg'] = number_format($bowlerUBA,2);
        $finalArr['enterAvg'] = number_format($bowlerEA,2);
        $finalArr['stAvg'] = number_format($bowlerSA,2);
        
        $finalArr['sessionAvrg'] = $data;
        $finalArr['eventAvrg'] = $envetssss;
        
        // $finalArr['avrgSession'] = '00000';
		// $finalArr['length'] = $gamesArray;
        echo json_encode($finalArr);
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

?>