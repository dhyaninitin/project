<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';

    if($_SESSION['userrole'] == 'president' || $_SESSION['userrole'] == 'secretary' || $_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'eventstaff' || $_SESSION['userrole'] == 'owner'){
        header("Location: ".$base_url."/dashboard/home.php");
    }



    $teamName = $_POST['teamName'];
    $conference = $_POST['conference'];
    $teamDivision = $_POST['teamDivision'];
    $homeHouse = $_POST['homeHouse'];
    // $teamPresident = $_POST['teamPresident'];
    // $teamVicePresident = $_POST['teamVicePresident'];
    // $teamCaptain = $_POST['teamCaptain'];
    $teamContact = 'Null';

    try {
        $database = new Connection();
        $db = $database->openConnection();

            $statement = $db->prepare("INSERT INTO teams (`teamname`, `conference`, `division`, `homehouse`, `contact`)
            VALUES(:teamName, :conference, :teamDivision, :homeHouse, :teamContact)");
                
            $statement->execute(array(
                "teamName" => $teamName,
                "conference" => $conference,
                "teamDivision" => $teamDivision,
                "homeHouse" => $homeHouse,
                "teamContact" => $teamContact
            ));      

            $_SESSION['success'] = 'Team Added';
            header("Location: ".$base_url."/dashboard/addTeam.php");
            
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
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