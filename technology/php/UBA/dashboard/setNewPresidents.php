<?php

    include_once '../session.php';
    include_once '../connect.php';


    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `president` = 1");
        $sql->execute();
        $dataFetched = $sql->fetchAll();

        $i = 1;

        foreach ($dataFetched as $singleBowler) {

          $team = $singleBowler['team'];
          $bowler = $singleBowler['name'];

          $sql = "UPDATE `teams`
                  SET `president` = :bowler
                  WHERE `teamname` = :team";

          $stmt = $db->prepare($sql);
          $stmt->bindParam(':team', $team);
          $stmt->bindParam(':bowler', $bowler);
          $stmt->execute();


          echo $i .' '. $team .' - '. $bowler .'<br>';
          $i++;
        }



    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

?>
