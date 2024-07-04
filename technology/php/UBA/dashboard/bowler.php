<?php

    include_once 'connect.php';

    $bowlerID = $_POST['bowlID'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$bowlerID' ORDER BY `year`");
        $sql->execute();

        $dataFetched = $sql->fetchAll();

        

        echo json_encode($dataFetched);
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

?>