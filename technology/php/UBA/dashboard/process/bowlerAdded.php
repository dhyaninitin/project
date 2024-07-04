<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';

    // $bowlerDbID = $_POST['userID'];

    $bowlerName = $_POST['bowlerName'];
    $nickname1 = $_POST['nickname1'];
    $teamName = $_POST['teamName'];
    // $bstatus = $_POST['bstatus'];
    $officeHeld = $_POST['officeHeld'];
    $enterAvg = $_POST['enterAvg'];
    $sanction = $_POST['sanction'];

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `teams` WHERE `teamName` = :teamName");
        $sql->execute([':teamName' => $teamName]);
        // $sql->execute();
        $teamDeets = $sql->fetch(PDO::FETCH_ASSOC);

        $teamDivision = $teamDeets['division'];

        $sql = $db->prepare("SELECT * FROM `districtcodes` WHERE `division` = :teamDivision");
        $sql->execute([':teamDivision' => $teamDivision]);
        // $sql->execute();
        $divionCodes = $sql->fetch(PDO::FETCH_ASSOC);

        $bowlerIdCode = $divionCodes['bcode'];

        // generate 8 digit code
        $number = mt_rand( 100000, 999999);

        $bowlerID = $bowlerIdCode.'-'.$number;

        if ($officeHeld == 'President') {
            $president = 1;
        } else {
            $president = 0;
        }

        $statement = $db->prepare("INSERT INTO bowlers (`bowlerid`, `team`, `name`, `nickname1`, `officeheld`, `enteringAvg`, `sanction`, `president`)
            VALUES(:bowlerID, :teamName, :bowlerName, :nickname1, :officeHeld, :enterAvg, :sanction, :president)");
                
            $statement->execute(array(
                "bowlerID" => $bowlerID,
                "teamName" => $teamName,
                "bowlerName" => $bowlerName,
                "nickname1" => $nickname1,
                "officeHeld" => $officeHeld,
                "enterAvg" => $enterAvg,
                "sanction" => $sanction,
                "president" => $president
            )); 

        $_SESSION['success'] = 'Bowler Added';

        header("Location: ".$base_url."/dashboard/addBowler.php");
        
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