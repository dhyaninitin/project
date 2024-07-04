<?php

    include_once '../connect.php';
    
    $bowlerID = $_POST['bowlerID'];
    
    

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $data = array();
        $singleEvent = array();
        

        	$sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerID' ORDER BY `eventdate` DESC");
        		
        	
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
    
        echo json_encode($data);
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

?>