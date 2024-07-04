<?php
include_once '../baseurl.php';
include_once '../session.php';
include_once '../connect.php';

$teamName = $_POST['teamname'];

try {
    $database = new Connection();
    $db = $database->openConnection();

    if ($teamName == 'event') {
        $sql = $db->prepare("SELECT `event` FROM `bowlerdata` GROUP BY `event`");
        // $sql->execute([':teamName' => $teamName]);
        $sql->execute();
        $dataFetched = $sql->fetchAll();
    } else {
        $sql = $db->prepare("SELECT `event` FROM `bowlerdataseason` GROUP BY `event`");
        // $sql->execute([':teamName' => $teamName]);
        $sql->execute();
        $dataFetched = $sql->fetchAll();
    }

    echo json_encode($dataFetched);
    
} catch (PDOException $e) {
    echo "There was some problem with the connection: " . $e->getMessage();
}

?>