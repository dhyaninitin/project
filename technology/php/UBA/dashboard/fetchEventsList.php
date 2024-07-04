<?php

include_once '../session.php';
include_once '../connect.php';

$eventselected = $_POST['eventsel'];

if ($eventselected == 'Other') {
    $eventList = ['Unholy Alliance', 'Rankings Qualifier', 'Last Man/Woman Standing', 'Team Relay', 'Last Team Standing', 'The Draft', 'Conference Classic', 'Gauntlet'];
} elseif ($eventselected == 'Mega Bowl') {
    $eventList = ['Open Men Singles', 'Open Women Singles', 'Unholy Alliance', '5 Man Capped', '5 Man Uncapped', '200-220 Singles', 'Men Under 200', 'Women Under 200', 'Franchise 645 Triples', 'Franchise Open Doubles', 'Franchise 450 Doubles', 'Franchise Open Triples', 'Open Mixed Doubles', 'Capped Mixed Doubles'];
} elseif ($eventselected == 'Battle Bowl') {
    $eventList = ['Unholy Alliance', 'Rankings Qualifier', 'Last Man/Woman Standing', 'Team Relay', 'Last Team Standing', 'The Draft', 'Conference Classic', 'Gauntlet'];
}

echo json_encode($eventList);

// try {
//     $database = new Connection();
//     $db = $database->openConnection();

//     if ($teamName == 'event') {
//         $sql = $db->prepare("SELECT `event` FROM `bowlerdata` GROUP BY `event`");
//         // $sql->execute([':teamName' => $teamName]);
//         $sql->execute();
//         $dataFetched = $sql->fetchAll();
//     } else {
//         $sql = $db->prepare("SELECT `event` FROM `bowlerdataseason` GROUP BY `event`");
//         // $sql->execute([':teamName' => $teamName]);
//         $sql->execute();
//         $dataFetched = $sql->fetchAll();
//     }

    
    
// } catch (PDOException $e) {
//     echo "There was some problem with the connection: " . $e->getMessage();
// }

?>