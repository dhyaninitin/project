<?php

include_once '../session.php';
include_once '../connect.php';

// $teamname = $_POST['teamname'];

try {
    $database = new Connection();
    $db = $database->openConnection();

    $sql = $db->prepare("SELECT * FROM `teams` ORDER BY `teamname` ASC");
    // $sql->execute([':teamName' => $teamName]);
    $sql->execute();
    $dataFetched = $sql->fetchAll();

    $finalData = array();

    foreach ($dataFetched as $team) {
        
        array_push($finalData, ucfirst($team['teamname']));
    }
    
} catch (PDOException $e) {
    echo "There was some problem with the connection: " . $e->getMessage();
}

//return json data
echo json_encode($finalData);
?>