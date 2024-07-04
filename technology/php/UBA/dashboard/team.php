<?php

    include_once '../connect.php';

    $teamName = $_POST['teamID'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $data = array();
        $singleEvent = array();

        $sql = $db->prepare("SELECT * FROM `currentroster` WHERE `team` = '$teamName' GROUP BY `name` ");
        $sql->execute();
        $dataFetched = $sql->fetchAll();

        foreach ($dataFetched as $event) {

            $singleEvent['bowlerID'] = $event['bowlerid'];
            $singleEvent['name'] = $event['name'];
            $singleEvent['team'] = $event['team'];
            $singleEvent['nickname'] = $event['nickname1'];

            array_push($data, $singleEvent);

            $singleEvent = array();
        }

        echo json_encode($data);
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

?>