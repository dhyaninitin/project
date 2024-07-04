
<?php

include_once '../../connect.php';

try {
    $database = new Connection();
    $db = $database->openConnection();

    $id = $_GET['id'];

    // Calculate UBA & Season Tour Average
    $sql = $db->prepare("SELECT `id`,`bowlerid` FROM `currentroster`");
    $sql->execute();
    $bowlerIndData = $sql->fetchAll();

    $bowlerArray = array();

    $toDeleteIDs = array();

    foreach ($bowlerIndData as $singleData) {
        if (in_array($singleData['bowlerid'], $bowlerArray)) {
            array_push($toDeleteIDs, $singleData['id']);
        } else {
            array_push($bowlerArray, $singleData['bowlerid']);
        }
    }

    for ($i=0; $i < sizeof($toDeleteIDs); $i++) { 

        $rowID = $toDeleteIDs[$i];

        $sql = "DELETE FROM `currentroster` WHERE `id`='$rowID'";
        $db->exec($sql);
    }


} catch (PDOException $e) {
    echo "There was some problem with the connection: " . $e->getMessage();
}


?>