<?php

    include_once '../connect.php';

    $eventType = $_POST['eventType'];
    $bowlerID = $_POST['bowlerID'];
    
    

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $data = array();
        $singleEvent = array();


        if ($eventType == 'events') {
        	
            $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$bowlerID' ORDER BY `event` ASC");
            $sql->execute();
            $dataFetched = $sql->fetchAll();

            usort($dataFetched, function ($a, $b){
                
                if ($a['eventdate'] == $b['eventdate']) {
                    return strtotime($b['logtime']) - strtotime($a['logtime']);
                }

                return strtotime($b['eventdate']) - strtotime($a['eventdate']);
            });

            foreach ($dataFetched as $event) {
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

                array_push($data, $singleEvent);

                $singleEvent = array();
            }
            
        } else {
        	$type = $_POST['sessionType'];
        		if($type == 'session'){
        			$sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerID' ORDER BY `id` DESC  ");
        		}
        		else if($type == 'sessionFilter'){
        			if($eventType == 'allSession'){
        				$sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerID' ORDER BY `id` DESC");
        			}else{
        				$sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerID' AND `year` = '$eventType' ORDER BY `id` DESC");
        			}
        				
        		}
        	
            $sql->execute();
            $dataFetched = $sql->fetchAll();

            usort($dataFetched, function($a, $b) {
                return strtotime($a['eventdate']) - strtotime($b['eventdate']);
            });

            foreach ($dataFetched as $event) {
                $tourStop = $event['event'];
                $eventLocation = $event['location'];
                $eventDate = $event['eventdate'];
                $team = $event['team'];
                $game1 = $event['game1'];
                $game2 = $event['game2'];
                $game3 = $event['game3'];
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
          
        }

        
        echo json_encode($data);
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

?>