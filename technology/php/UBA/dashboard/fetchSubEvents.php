<?php

include_once '../session.php';
include_once '../connect.php';

$eventselected = $_POST['eventsel'];

try {
    $database = new Connection();
    $db = $database->openConnection();

    $sql = $db->prepare("SELECT * FROM `events` WHERE id=:eventselected");
    $sql->execute([':eventselected' => $eventselected]);
    // $sql->execute();
    $dataFetched = $sql->fetch();

    if ($dataFetched['evententry'] == 'team') {
        $a = array("squads"=>$dataFetched['noOfSquads'],"fee"=>$dataFetched['costPerBowler'],"setup"=>$dataFetched['evententry'],"maxMembers"=>$dataFetched['perteam'],"team"=>$dataFetched['teamstructure']);
    } else {
        $a = array("squads"=>$dataFetched['noOfSquads'],"fee"=>$dataFetched['costPerBowler']);
    }

    

    echo json_encode($a);
    
} catch (PDOException $e) {
    echo "There was some problem with the connection: " . $e->getMessage();
}

?>