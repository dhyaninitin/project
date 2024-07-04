<?php

    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] != 'admin'){
        header("Location: /dashboard/home.php");
    }

    $id = $_GET['id'];

    var_dump($id);

    try {

        $sql = $db->prepare("SELECT * FROM `bowlersreleased` WHERE `id` = :id");
        $sql->execute([':id' => $id]);
        $bowlerdata = $sql->fetch();

        $bowler = $bowlerdata['bowler'];
        $bowlerUBAID = $bowlerdata['bowlerid'];

        $suspended = 0;

        $sql = "UPDATE `bowlers` 
                SET `suspended` = :suspended,
                `seasontourAvg` = :seasonTourAvg
                WHERE `bowlerid` = :bowlerUBAID";

        $stmt = $db->prepare($sql);                                  
        $stmt->bindParam(':suspended', $suspended);
        $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
        $stmt->execute(); 

        $sql = "DELETE FROM `bowlersreleased` WHERE `id`='$id'";
        $db->exec($sql);

                
        $_SESSION['success'] = $bowler . ' reinstated';
        header("Location: /dashboard/rsbowler.php");
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }


?>