<?php

include_once '../session.php';
include_once '../connect.php';

$teamname = $_POST['teamname'];

try {
    $database = new Connection();
    $db = $database->openConnection();

    $sql = $db->prepare("SELECT * FROM `teams` WHERE `division` = :teamname ORDER BY `teamname` ASC");
    $sql->execute([':teamname' => $teamname]);
    $sql->execute();
    $dataFetched = $sql->fetchAll();

    echo json_encode($finalData);
    
} catch (PDOException $e) {
    echo "There was some problem with the connection: " . $e->getMessage();
}

//return json data

?>