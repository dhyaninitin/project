<?php

include_once '../session.php';
include_once '../connect.php';

$teamName = trim($_POST['teamname']);



try {
    $database = new Connection();
    $db = $database->openConnection();

    $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `team` = :teamName GROUP BY `bowlerid` ORDER BY `name`");
    $sql->execute([':teamName' => $teamName]);
        // $sql->execute();
    $dataFetched = $sql->fetchAll();

    $finalData = array();

    $bowlerdata = array();

    foreach ($dataFetched as $bowler) {
        $bowlerdata['name'] = ucfirst($bowler['name']);
        $bowlerdata['bowlerid'] = $bowler['bowlerid'];
        
        array_push($finalData, $bowlerdata);

        $bowlerdata = array();
    }
    
} catch (PDOException $e) {
    echo "There was some problem with the connection: " . $e->getMessage();
}

//return json data
echo json_encode($finalData);
?>