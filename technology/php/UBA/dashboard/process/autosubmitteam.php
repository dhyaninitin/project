<?php
	
    include_once '../../connect.php';

    $info = getdate();
    $date = $info['mday'];
    $month = $info['mon'];
    $year = $info['year'];
    $hour = $info['hours'];
    $min = $info['minutes'];
    $sec = $info['seconds'];

    $currentdate = $month.'-'.$date.'-'.$year;

        try {
            $database = new Connection();
            $db = $database->openConnection();

            $sql = $db->prepare("SELECT * FROM `teams`");
            $sql->execute();
            $checkTeamRoster = $sql->fetchAll();

            foreach ($checkTeamRoster as $team) {

              if ($rostersubmitted == 0) {
                $teamName = $team['teamname'];

                $sql = $db->prepare("SELECT `bowlerid`, `team`, `name`, `nickname1`, `bstatus`, `officeheld`, `uemail`, `sanction` FROM `bowlers` WHERE `team` = :teamName");
                $sql->execute([':teamName' => $teamName]);
                $dataFetched = $sql->fetchAll();

                foreach ($dataFetched as $bowler) {

                    $bowlerID = $bowler['bowlerid'];
                    $teamName = $bowler['team'];
                    $bowlerName = $bowler['name'];
                    $nickname1 = $bowler['nickname1'];
                    $officeHeld = $bowler['officeheld'];
                    $uemail = $bowler['uemail'];
                    $sanction = $bowler['sanction'];

                    $statement = $db->prepare("INSERT INTO submittedrosters (`bowlerid`, `team`, `name`, `nickname1`, `officeheld`, `uemail`, `sanction`)
                        VALUES(:bowlerID, :teamName, :bowlerName, :nickname1, :officeHeld, :uemail, :sanction)");

                        $statement->execute(array(
                            "bowlerID" => $bowlerID,
                            "teamName" => $teamName,
                            "bowlerName" => $bowlerName,
                            "nickname1" => $nickname1,
                            "officeHeld" => $officeHeld,
                            "uemail" => $uemail,
                            "sanction" => $sanction
                        ));

                }
              }



                    // $rostersubmitted = 1;
                    //
                    // $sql = "UPDATE `teams`
                    //         SET `rostersubmitted` = :rostersubmitted,
                    //         `rostersubmissiondate` = :currentdate
                    //         WHERE `teamname` = :teamName";
                    //
                    // $stmt = $db->prepare($sql);
                    // $stmt->bindParam(':rostersubmitted', $rostersubmitted);
                    // $stmt->bindParam(':currentdate', $currentdate);
                    // $stmt->bindParam(':teamName', $teamName);
                    // $stmt->execute();

            }

            $sql = "DELETE FROM `currentroster`";
            $db->exec($sql);

            $sql = $db->prepare("SELECT `bowlerid`, `team`, `name`, `nickname1`, `bstatus`, `officeheld`, `uemail`, `sanction` FROM `submittedrosters`");
            $sql->execute();
            $dataFetched = $sql->fetchAll();

            foreach ($dataFetched as $bowler) {
                $bowlerID = $bowler['bowlerid'];
                $teamName = $bowler['team'];
                $bowlerName = $bowler['name'];
                $nickname1 = $bowler['nickname1'];
                $officeHeld = $bowler['officeheld'];
                $uemail = $bowler['uemail'];
                $sanction = $bowler['sanction'];

                $statement = $db->prepare("INSERT INTO currentroster (`bowlerid`, `team`, `name`, `nickname1`, `officeheld`, `uemail`, `sanction`)
                  VALUES(:bowlerID, :teamName, :bowlerName, :nickname1, :officeHeld, :uemail, :sanction)");

                  $statement->execute(array(
                      "bowlerID" => $bowlerID,
                      "teamName" => $teamName,
                      "bowlerName" => $bowlerName,
                      "nickname1" => $nickname1,
                      "officeHeld" => $officeHeld,
                      "uemail" => $uemail,
                      "sanction" => $sanction
                  ));

              }



            // if ($checkTeamRoster['rostersubmitted'] == 1) {
            //     $_SESSION['error'] = 'Roster already submitted';
            //     header("Location: /dashboard/submitroster.php");
            // }

        } catch (PDOException $e) {
            echo "There was some problem with the connection: " . $e->getMessage();
        }


?>
