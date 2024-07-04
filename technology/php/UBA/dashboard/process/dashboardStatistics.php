<?php
	include_once '../../baseurl.php';
    include_once '../../session.php';
    include_once '../../connect.php';
    // include_once 'checkuser.php';
	// ini_set('display_errors', 1);
	// ini_set('display_startup_errors', 1);
	// error_reporting(E_ALL);


    try {
        $database = new Connection();
        $db = $database->openConnection();

           if($_POST['action'] == 'season'){	
	            //veriable define
	            $useremail = $_POST['useremail'];
			    $year = $_POST['year'];
				//get the data
				$sql = $db->prepare("SELECT * FROM `bowlers` WHERE `uemail` = :useremail");
	            $sql->execute([':useremail' => $useremail]);
	            $bowlerDeets = $sql->fetch();
	            $bowlerUBAID = $bowlerDeets['bowlerid'];
	            //echo $bowlerUBAID;
	            if($year == 'All Seasons'){
	            	 $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerUBAID'");
	            }else{
	            	 $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerUBAID' and `year` = '$year'");
	            }
	        
	            $sql->execute();
	            $dataFetchedSeasonTourYear = $sql->fetchAll();
	            echo json_encode($dataFetchedSeasonTourYear);

	        }else if($_POST['action'] == 'events'){

	        	//veriable define
	            $useremail = $_POST['useremail'];
			    $year = $_POST['year'];
				//get the data
				$sql = $db->prepare("SELECT * FROM `bowlers` WHERE `uemail` = :useremail");
	            $sql->execute([':useremail' => $useremail]);
	            $bowlerDeets = $sql->fetch();
	            $bowlerUBAID = $bowlerDeets['bowlerid'];
	            //echo $bowlerUBAID;
	            if($year == 'All Events'){
	            	 $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$bowlerUBAID'");
	            }else{
	            	 $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$bowlerUBAID' and `year` = '$year'");
	            }
	        
	            $sql->execute();
	            $dataFetchedEventsYear = $sql->fetchAll();
	            echo json_encode($dataFetchedEventsYear);

	        }
 

        
		}
		 catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    if (isset($_SESSION['success'])) {
        $msg = '<div class="col-12"><p class="successMsg">'.$_SESSION['success'].'</p></div>';
    } else if (isset($_SESSION['error'])) {
        $msg = '<div class="col-12"><p class="errorMsg">'.$_SESSION['error'].'</p></div>';
    } else {
        $msg = '';
    }

?>
