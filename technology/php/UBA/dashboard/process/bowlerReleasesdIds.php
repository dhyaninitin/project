<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `bowlersreleased`");
        $sql->execute();
        $releasedBowlers = $sql->fetchAll();

        foreach ($releasedBowlers as $bowler) {
            $teamName = $bowler['team'];
            $bowlerUBAID = $bowler['bowlerid'];

            $wrongbowlerUBAID = $bowler['bowlerid'];

            $bowlerUBAID = preg_split("#-#", $bowlerUBAID);
            $bowlerUBAIDPre = $bowlerUBAID[0];
            $bowlerUBAIDMain = $bowlerUBAID[1];

            if ($teamName != 'Independent' && $bowlerUBAIDMain != '' && $bowlerUBAIDPre != '') {

                $sql = $db->prepare("SELECT `division` FROM `teams` WHERE `teamname` = :teamName");
                $sql->execute([':teamName' => $teamName]);
                $teamdistrict = $sql->fetch();
                $division = $teamdistrict['division'];

                $sql = $db->prepare("SELECT * FROM `districtcodes` WHERE `division` = :division");
                $sql->execute([':division' => $division]);
                $districtcode = $sql->fetch();
                $teamcode = $districtcode['bcode'];

                $bowlerUBAID = $teamcode.'-'.$bowlerUBAIDMain;

                echo $bowlerUBAID;
                echo '<br>';

                $sql = "UPDATE bowlersreleased 
                    SET `bowlerid` = :bowlerUBAID
                    WHERE bowlerid = :wrongbowlerUBAID";

                $stmt = $db->prepare($sql);                                  
                $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
                $stmt->bindParam(':wrongbowlerUBAID', $wrongbowlerUBAID);
                $stmt->execute();  
                
                $sql = "UPDATE bowlerdata 
                    SET `bowlerid` = :bowlerUBAID
                    WHERE bowlerid = :wrongbowlerUBAID";

                $stmt = $db->prepare($sql);                                  
                $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
                $stmt->bindParam(':wrongbowlerUBAID', $wrongbowlerUBAID);
                $stmt->execute();

                $sql = "UPDATE bowlerdataseason 
                    SET `bowlerid` = :bowlerUBAID
                    WHERE bowlerid = :wrongbowlerUBAID";

                $stmt = $db->prepare($sql);                                  
                $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
                $stmt->bindParam(':wrongbowlerUBAID', $wrongbowlerUBAID);
                $stmt->execute();

            }


        }

        // var_dump($releasedBowlers);
        

        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

?>
