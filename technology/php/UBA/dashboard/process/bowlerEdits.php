<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';

    if($_SESSION['userrole'] == 'admin'){
        
        $bowlerDbID = $_POST['userID'];

        $updatedbowlerID = $_POST['bowlerID'];
        $bowlerName = $_POST['bowlerName'];
        $nickname1 = $_POST['nickname1'];
        $teamName = $_POST['teamName'];
        $bstatus = $_POST['bstatus'];
        $officeHeld = $_POST['officeHeld'];
        $enterAvg = $_POST['enterAvg'];
        $sanction = $_POST['sanction'];
        $bemail = $_POST['uemail'];
        $bphone = $_POST['phone'];

        if ($officeHeld == 'President') {
            $president = 1;
        } else {
            $president = 0;
        }

        if ($officeHeld == 'Owner') {
            $bowner = 1;
        } else {
            $bowner = 0;
        }

        try {
            $database = new Connection();
            $db = $database->openConnection();

                $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `id` = '$bowlerDbID'");
                $sql->execute();
                $dataFetched = $sql->fetch(PDO::FETCH_ASSOC);
                
                $oldbowlerUBAID = $dataFetched['bowlerid'];

                if($oldbowlerUBAID !== $updatedbowlerID) {

                    $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `bowlerid` = :updatedbowlerID");
                    $sql->execute([':updatedbowlerID' => $updatedbowlerID]);
                    $bowlerIdCheck = $sql->fetch(PDO::FETCH_ASSOC);

                    if($bowlerIdCheck) {
                        // var_dump($bowlerIdCheck); 
                        $_SESSION['error'] = 'The new ID already exists in the system. Please opt for a another ID';
                        header("Location: ".$base_url."/dashboard/editBowler.php?id=".$bowlerDbID);
                        exit();
                    }
                }

                    $oldTeam = $dataFetched['team'];
                    $oldofficeHeld = $dataFetched['officeheld'];

                    $sql = $db->prepare("SELECT * FROM `teams` WHERE `teamname` = '$teamName' ORDER BY `teamname` ASC");
                    $sql->execute();
                    $teamDataFetched = $sql->fetch(PDO::FETCH_ASSOC);

                    // check if president/owner already exists
                    if ($officeHeld == 'President') {
                        
                        $oldAssignee =  $teamDataFetched['president'];
                        
                        if ($oldAssignee != '-') {
                            $resetOffice = '-';

                            $sql = "UPDATE `bowlers` 
                                    SET `officeheld` = :resetOffice
                                    WHERE `name` = :oldAssignee";

                            $stmt = $db->prepare($sql);
                            $stmt->bindParam(':resetOffice', $resetOffice);
                            $stmt->bindParam(':oldAssignee', $oldAssignee);
                            $stmt->execute();
                        }

                    } elseif ($officeHeld == 'Vice President') {
                        
                        $oldAssignee =  $teamDataFetched['vp'];
                        
                        if ($oldAssignee != '-') {
                            $resetOffice = '-';

                            $sql = "UPDATE `bowlers` 
                                    SET `officeheld` = :resetOffice
                                    WHERE `name` = :oldAssignee";

                            $stmt = $db->prepare($sql);
                            $stmt->bindParam(':resetOffice', $resetOffice);
                            $stmt->bindParam(':oldAssignee', $oldAssignee);
                            $stmt->execute();
                        }

                    } elseif ($officeHeld == 'Captain') {
                        
                        $oldAssignee =  $teamDataFetched['captain'];
                        
                        if ($oldAssignee != '-') {
                            $resetOffice = '-';

                            $sql = "UPDATE `bowlers` 
                                    SET `officeheld` = :resetOffice
                                    WHERE `name` = :oldAssignee";

                            $stmt = $db->prepare($sql);
                            $stmt->bindParam(':resetOffice', $resetOffice);
                            $stmt->bindParam(':oldAssignee', $oldAssignee);
                            $stmt->execute();
                        }

                    } elseif ($officeHeld == 'Secretary') {
                        
                        $oldAssignee =  $teamDataFetched['secretary'];
                        
                        if ($oldAssignee != '-') {
                            $resetOffice = '-';

                            $sql = "UPDATE `bowlers` 
                                    SET `officeheld` = :resetOffice
                                    WHERE `name` = :oldAssignee";

                            $stmt = $db->prepare($sql);
                            $stmt->bindParam(':resetOffice', $resetOffice);
                            $stmt->bindParam(':oldAssignee', $oldAssignee);
                            $stmt->execute();
                        }

                    } elseif ($officeHeld == 'Treasurer') {
                        
                        $oldAssignee =  $teamDataFetched['treasurer'];
                        
                        if ($oldAssignee != '-') {
                            $resetOffice = '-';

                            $sql = "UPDATE bowlers 
                                    SET `officeheld` = :resetOffice
                                    WHERE `name` = :oldAssignee";

                            $stmt = $db->prepare($sql);
                            $stmt->bindParam(':resetOffice', $resetOffice);
                            $stmt->bindParam(':oldAssignee', $oldAssignee);
                            $stmt->execute();
                        }

                    } elseif ($officeHeld == 'Owner') {
                        
                        $oldAssignee =  $teamDataFetched['owner'];
                        
                        if ($oldAssignee != '-') {
                            $resetOffice = '-';

                            $sql = "UPDATE bowlers 
                                    SET `officeheld` = :resetOffice
                                    WHERE `name` = :oldAssignee";

                            $stmt = $db->prepare($sql);
                            $stmt->bindParam(':resetOffice', $resetOffice);
                            $stmt->bindParam(':oldAssignee', $oldAssignee);
                            $stmt->execute();
                        }

                    }

                    if ($teamName != $oldTeam) {
                        $bowlerUBAID = preg_split("#-#", $oldbowlerUBAID);
                        $bowlerUBAIDPre = $bowlerUBAID[0];
                        $bowlerUBAIDMain = $bowlerUBAID[1];

                        $teamDistrict = $teamDataFetched['division'];

                        $sql = $db->prepare("SELECT * FROM `districtcodes` WHERE `division` = '$teamDistrict'");
                        $sql->execute();
                        $teamDistrictData = $sql->fetch(PDO::FETCH_ASSOC);
                        $teamDistrictCode = $teamDistrictData['bcode'];

                        $bowlerUBAID = $teamDistrictCode.'-'.$bowlerUBAIDMain;

                        $sql = "UPDATE bowlers 
                                SET `bowlerid` = :bowlerUBAID,
                                `name` = :bowlerName,
                                `nickname1` = :nickname1,
                                `team` = :teamName,
                                `bstatus` = :bstatus,
                                `officeheld` = :officeHeld,
                                `enteringAvg` = :enterAvg,
                                `sanction` = :sanction,
                                `uemail` = :bemail,
                                `phone` = :bphone,
                                `president` = :president,
                                `owner` = :bowner
                                WHERE id = :bowlerDbID";

                        $stmt = $db->prepare($sql);                                  

                        $stmt->bindParam(':bowlerUBAID', $updatedbowlerID);
                        $stmt->bindParam(':bowlerName', $bowlerName);
                        $stmt->bindParam(':nickname1', $nickname1);
                        $stmt->bindParam(':teamName', $teamName);
                        $stmt->bindParam(':bstatus', $bstatus);
                        $stmt->bindParam(':officeHeld', $officeHeld);
                        $stmt->bindParam(':enterAvg', $enterAvg);
                        $stmt->bindParam(':sanction', $sanction);
                        $stmt->bindParam(':bemail', $bemail);
                        $stmt->bindParam(':bphone', $bphone);
                        $stmt->bindParam(':president', $president);
                        $stmt->bindParam(':bowner', $bowner);
                        $stmt->bindParam(':bowlerDbID', $bowlerDbID);
                        $stmt->execute();

                        $sql = "UPDATE `currentroster` 
                                SET `bowlerid` = :updatedbowlerID,
                                `name` = :bowlerName,
                                `nickname1` = :nickname1,
                                `team` = :teamName,
                                `officeheld` = :officeHeld,
                                `sanction` = :sanction,
                                `uemail` = :bemail
                                WHERE `bowlerid` = :oldbowlerUBAID";

                        $stmt = $db->prepare($sql);                                  

                        $stmt->bindParam(':updatedbowlerID', $updatedbowlerID);
                        $stmt->bindParam(':bowlerName', $bowlerName);
                        $stmt->bindParam(':nickname1', $nickname1);
                        $stmt->bindParam(':teamName', $teamName);
                        $stmt->bindParam(':officeHeld', $officeHeld);
                        $stmt->bindParam(':sanction', $sanction);
                        $stmt->bindParam(':bemail', $bemail);
                        $stmt->bindParam(':oldbowlerUBAID', $oldbowlerUBAID);
                        $stmt->execute();

                        if ($oldofficeHeld != '-') {
                            if ($oldofficeHeld != '') {

                                $resetOffice = '-';
                                
                                if ($oldofficeHeld == 'President') {
                                    $sql = "UPDATE teams 
                                            SET `president` = :resetOffice
                                            WHERE `teamname` = :oldTeam";
                                } elseif ($oldofficeHeld == 'Vice President') {
                                    $sql = "UPDATE teams 
                                            SET `vp` = :resetOffice
                                            WHERE `teamname` = :oldTeam";
                                } elseif ($oldofficeHeld == 'Captain') {
                                    $sql = "UPDATE teams 
                                            SET `captain` = :resetOffice
                                            WHERE `teamname` = :oldTeam";
                                } elseif ($oldofficeHeld == 'Secretary') {
                                    $sql = "UPDATE teams 
                                            SET `secretary` = :resetOffice
                                            WHERE `teamname` = :oldTeam";
                                } elseif ($oldofficeHeld == 'Treasurer') {
                                    $sql = "UPDATE teams 
                                            SET `treasurer` = :resetOffice
                                            WHERE `teamname` = :oldTeam";
                                } elseif ($oldofficeHeld == 'Owner') {
                                    $sql = "UPDATE teams 
                                            SET `owner` = :resetOffice
                                            WHERE `teamname` = :oldTeam";
                                }

                                $stmt = $db->prepare($sql);                                  
                                $stmt->bindParam(':resetOffice', $resetOffice);
                                $stmt->bindParam(':oldTeam', $oldTeam);
                                $stmt->execute();
                            }
                        }

                        $sql = "UPDATE bowlerdata 
                            SET `bowlerid` = :bowlerName
                            WHERE bowlerid = :bowlerUBAID";

                        $stmt = $db->prepare($sql);                                  
                        $stmt->bindParam(':bowlerName', $updatedbowlerID);
                        $stmt->bindParam(':bowlerUBAID', $oldbowlerUBAID);
                        $stmt->execute();    

                        $sql = "UPDATE bowlerdataseason 
                                SET `bowlerid` = :bowlerName
                                WHERE bowlerid = :bowlerUBAID";

                        $stmt = $db->prepare($sql);                                  
                        $stmt->bindParam(':bowlerName', $updatedbowlerID);
                        $stmt->bindParam(':bowlerUBAID', $oldbowlerUBAID);
                        $stmt->execute(); 

                    } else {                        

                        $sql = "UPDATE bowlers 
                                SET `bowlerid` = :bowlerUBAID,
                                `name` = :bowlerName,
                                `nickname1` = :nickname1,
                                `team` = :teamName,
                                `bstatus` = :bstatus,
                                `officeheld` = :officeHeld,
                                `enteringAvg` = :enterAvg,
                                `sanction` = :sanction,
                                `uemail` = :bemail,
                                `phone` = :bphone,
                                `president` = :president,
                                `owner` = :bowner
                                WHERE id = :bowlerDbID";

                        $stmt = $db->prepare($sql);                  
                        $stmt->bindParam(':bowlerUBAID', $updatedbowlerID);                
                        $stmt->bindParam(':bowlerName', $bowlerName);
                        $stmt->bindParam(':nickname1', $nickname1);
                        $stmt->bindParam(':teamName', $teamName);
                        $stmt->bindParam(':bstatus', $bstatus);
                        $stmt->bindParam(':officeHeld', $officeHeld);
                        $stmt->bindParam(':enterAvg', $enterAvg);
                        $stmt->bindParam(':sanction', $sanction);
                        $stmt->bindParam(':bemail', $bemail);
                        $stmt->bindParam(':bphone', $bphone);
                        $stmt->bindParam(':president', $president);
                        $stmt->bindParam(':bowner', $bowner);
                        $stmt->bindParam(':bowlerDbID', $bowlerDbID);
                        $stmt->execute();

                        $sql = "UPDATE `currentroster` 
                                SET `bowlerid` = :updatedbowlerID,
                                `name` = :bowlerName,
                                `nickname1` = :nickname1,
                                `team` = :teamName,
                                `officeheld` = :officeHeld,
                                `sanction` = :sanction,
                                `uemail` = :bemail
                                WHERE `bowlerid` = :oldbowlerUBAID";

                        $stmt = $db->prepare($sql);                                  

                        $stmt->bindParam(':updatedbowlerID', $updatedbowlerID);
                        $stmt->bindParam(':bowlerName', $bowlerName);
                        $stmt->bindParam(':nickname1', $nickname1);
                        $stmt->bindParam(':teamName', $teamName);
                        $stmt->bindParam(':officeHeld', $officeHeld);
                        $stmt->bindParam(':sanction', $sanction);
                        $stmt->bindParam(':bemail', $bemail);
                        $stmt->bindParam(':oldbowlerUBAID', $oldbowlerUBAID);
                        $stmt->execute();

                    }         

                    // $teamName = $dataFetched['team'];

                    
                    
                    $sql = "UPDATE bowlerdata 
                        SET `bowlerid` = :bowlerName
                        WHERE bowlerid = :bowlerUBAID";

                    $stmt = $db->prepare($sql);                                  
                    $stmt->bindParam(':bowlerName', $updatedbowlerID);
                    $stmt->bindParam(':bowlerUBAID', $oldbowlerUBAID);
                    $stmt->execute();    

                    $sql = "UPDATE bowlerdataseason 
                            SET `bowlerid` = :bowlerName
                            WHERE bowlerid = :bowlerUBAID";

                    $stmt = $db->prepare($sql);                                  
                    $stmt->bindParam(':bowlerName', $updatedbowlerID);
                    $stmt->bindParam(':bowlerUBAID', $oldbowlerUBAID);
                    $stmt->execute(); 
                    
                    // Change the Bowlers Office Held Position in Teams Table

                    if ($oldofficeHeld != $officeHeld) {
                        if ($officeHeld == 'President') {
                            $sql = "UPDATE `teams` 
                                SET `president` = :bowlerName
                                WHERE `teamname` = :teamName";
                        } elseif ($officeHeld == 'Vice President') {
                            $sql = "UPDATE `teams` 
                                SET `vp` = :bowlerName
                                WHERE `teamname` = :teamName";
                        } elseif ($officeHeld == 'Captain') {
                            $sql = "UPDATE `teams` 
                                SET `captain` = :bowlerName
                                WHERE `teamname` = :teamName";
                        } elseif ($officeHeld == 'Secretary') {
                            $sql = "UPDATE `teams` 
                                SET `secretary` = :bowlerName
                                WHERE `teamname` = :teamName";
                        } elseif ($officeHeld == 'Treasurer') {
                            $sql = "UPDATE `teams` 
                                SET `treasurer` = :bowlerName
                                WHERE `teamname` = :teamName";
                        } elseif ($officeHeld == 'Owner') {
                            $sql = "UPDATE `teams` 
                                SET `owner` = :bowlerName
                                WHERE `teamname` = :teamName";
                        }
            
                        $stmt = $db->prepare($sql);                                  
                        $stmt->bindParam(':bowlerName', $bowlerName);
                        $stmt->bindParam(':teamName', $teamName);
                        $stmt->execute();
                    }

                    if ($oldofficeHeld != '-') {
                        if ($oldofficeHeld != '') {

                            $resetOffice = '-';
                            
                            if ($oldofficeHeld == 'President') {
                                $sql = "UPDATE teams 
                                        SET `president` = :resetOffice
                                        WHERE `teamname` = :teamName";
                            } elseif ($oldofficeHeld == 'Vice President') {
                                $sql = "UPDATE teams 
                                        SET `vp` = :resetOffice
                                        WHERE `teamname` = :teamName";
                            } elseif ($oldofficeHeld == 'Captain') {
                                $sql = "UPDATE teams 
                                        SET `captain` = :resetOffice
                                        WHERE `teamname` = :teamName";
                            } elseif ($oldofficeHeld == 'Secretary') {
                                $sql = "UPDATE teams 
                                        SET `secretary` = :resetOffice
                                        WHERE `teamname` = :teamName";
                            } elseif ($oldofficeHeld == 'Treasurer') {
                                $sql = "UPDATE teams 
                                        SET `treasurer` = :resetOffice
                                        WHERE `teamname` = :teamName";
                            } elseif ($oldofficeHeld == 'Owner') {
                                $sql = "UPDATE teams 
                                        SET `owner` = :resetOffice
                                        WHERE `teamname` = :teamName";
                            }

                            $stmt = $db->prepare($sql);                                  
                            $stmt->bindParam(':resetOffice', $resetOffice);
                            $stmt->bindParam(':teamName', $teamName);
                            $stmt->execute();
                        }
                    }

                    $_SESSION['success'] = 'Bowler Details changed';

                    header("Location: ".$base_url."/dashboard/editBowler.php?id=".$bowlerDbID);
                


            
            
        } catch (PDOException $e) {
            echo "There was some problem with the connection: " . $e->getMessage();
        }

    } elseif ($_SESSION['userrole'] == 'owner' || $_SESSION['userrole'] == 'president' || $_SESSION['userrole'] == 'secretary') {

        $bowlerDbID = $_POST['userID'];

        $bowlerName = $_POST['bowlerName'];
        $nickname1 = $_POST['nickname1'];
        $teamName = $_POST['teamName'];
        $bstatus = $_POST['bstatus'];
        $officeHeld = $_POST['officeHeld'];
        $sanction = $_POST['sanction'];

        if ($officeHeld == 'President') {
            $president = 1;
        } else {
            $president = 0;
        }

        if ($officeHeld == 'Owner') {
            $bowner = 1;
        } else {
            $bowner = 0;
        }

        try {
            $database = new Connection();
            $db = $database->openConnection();

            $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `id` = '$bowlerDbID'");
            $sql->execute();
            $dataFetched = $sql->fetch(PDO::FETCH_ASSOC);

            $bowlerUBAID = $dataFetched['bowlerid'];

            if ($_SESSION['team'] != $dataFetched['team']) {
                header("Location: ".$base_url."/dashboard/teamroster.php");
            }

            // $teamName = $dataFetched['team'];

            $sql = "UPDATE `bowlers` 
                    SET `name` = :bowlerName,
                    `nickname1` = :nickname1,
                    `bstatus` = :bstatus,
                    `sanction` = :sanction,
                    `officeheld` = :officeHeld
                    WHERE `id` = :bowlerDbID";

            $stmt = $db->prepare($sql);                                  

            $stmt->bindParam(':bowlerName', $bowlerName);
            $stmt->bindParam(':nickname1', $nickname1);
            $stmt->bindParam(':bstatus', $bstatus);
            $stmt->bindParam(':sanction', $sanction);
            $stmt->bindParam(':officeHeld', $officeHeld);
            $stmt->bindParam(':bowlerDbID', $bowlerDbID);
            $stmt->execute();    
                                           

            // $stmt->bindParam(':bowlerName', $bowlerName);
            // $stmt->bindParam(':nickname1', $nickname1);
            // $stmt->bindParam(':bstatus', $bstatus);
            // $stmt->bindParam(':officeHeld', $officeHeld);
            // $stmt->bindParam(':bowlerDbID', $bowlerDbID);
            // $stmt->execute();   
            
            $sql = "UPDATE bowlerdata 
                SET `name` = :bowlerName
                WHERE bowlerid = :bowlerUBAID";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':bowlerName', $bowlerName);
            $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
            $stmt->execute();    

            $sql = "UPDATE bowlerdataseason 
                    SET `name` = :bowlerName
                    WHERE bowlerid = :bowlerUBAID";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':bowlerName', $bowlerName);
            $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
            $stmt->execute();   
            
            // Change the Bowlers Office Held Position in Teams Table

            // if ($officeHeld = 'President') {
            //     $sql = "UPDATE teams 
            //         SET `president` = :bowlerName
            //         WHERE teamname = :teamName";
            // } elseif ($officeHeld = 'Vice President') {
            //     $sql = "UPDATE teams 
            //         SET `vp` = :bowlerName
            //         WHERE teamname = :teamName";
            // } elseif ($officeHeld = 'Captain') {
            //     $sql = "UPDATE teams 
            //         SET `captain` = :bowlerName
            //         WHERE teamname = :teamName";
            // } elseif ($officeHeld = 'Secretary') {
            //     $sql = "UPDATE teams 
            //         SET `secretary` = :bowlerName
            //         WHERE teamname = :teamName";
            // } elseif ($officeHeld = 'Treasurer') {
            //     $sql = "UPDATE teams 
            //         SET `treasurer` = :bowlerName
            //         WHERE teamname = :teamName";
            // }
            

            // // $sql = "UPDATE teams 
            // //         SET `officeheld` = :officeHeld
            // //         WHERE teamname = :teamName";

            // $stmt = $db->prepare($sql);                                  
            // $stmt->bindParam(':bowlerName', $bowlerName);
            // $stmt->bindParam(':teamName', $teamName);

            // $stmt->execute();    

            $_SESSION['success'] = 'Bowler Details changed';

            header("Location: ".$base_url."/dashboard/editBowler.php?id=".$bowlerDbID);
            
        } catch (PDOException $e) {
            echo "There was some problem with the connection: " . $e->getMessage();
        }
    }

    

    // echo password_hash("Hoolale.27", PASSWORD_BCRYPT, $options);

    // $hash = password_hash("Hoolale.27", PASSWORD_DEFAULT);

    // if (password_verify('Hoolale.27', $hash)) {
    //     echo 'Password is valid!';
    // } else {
    //     echo 'Invalid password.';
    // }

    

    // try {
    //     $database = new Connection();
    //     $db = $database->openConnection();

    //     $sql = $db->prepare("SELECT * FROM `teams` WHERE `$column` LIKE '%$searchTerm%' GROUP BY `teamname` ORDER BY `teamname`");
    //     $sql->execute();
    //     $dataFetched = $sql->fetchAll();
        
    // } catch (PDOException $e) {
    //     echo "There was some problem with the connection: " . $e->getMessage();
    // }

?>