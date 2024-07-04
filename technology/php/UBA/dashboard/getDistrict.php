<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] != 'admin'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    try {
    	
        $database = new Connection();
        $db = $database->openConnection();
        
		if($_POST['action'] == 'select'){
			$sql = $db->prepare("SELECT * FROM `districtcodes`");
			$sql->execute();
			$dataFetched = $sql->fetchAll();
			
			echo json_encode($dataFetched);
			
		}else if($_POST['action'] == 'update'){
			$sql = "UPDATE districtcodes SET `division` = :division WHERE `id` = :updateId";

            $stmt = $db->prepare($sql);                                  
            $stmt->bindParam(':division', $_POST['updatevalue']);
            $stmt->bindParam(':updateId', $_POST['upateid']);
            if($stmt->execute()){
				$sql = $db->prepare("SELECT * FROM `districtcodes`");
				$sql->execute();$dataFetched = $sql->fetchAll();
				
				echo json_encode($dataFetched);
				
            }else{
            	echo json_encode('not');
            }
			
		}else if($_POST['action'] == 'adddistrict'){
			$statement = $db->prepare("INSERT INTO districtcodes (`division`) VALUES(:adddivision)"); 
				$statement->execute(array(
                "adddivision" => $_POST['addvalue']
            ));  
				 
			if($statement){
				$sql = $db->prepare("SELECT * FROM `districtcodes`");
				$sql->execute();$dataFetched = $sql->fetchAll();
				
				echo json_encode($dataFetched);
			}else{
				echo json_encode('not');
			}	
		}else if($_POST['action'] == 'delete'){
			
			$deleteid = $_POST['deleteid'];
			$sql = ("DELETE FROM `districtcodes` WHERE `id` = '$deleteid'");
                if($db->exec($sql)){
					$sql = $db->prepare("SELECT * FROM `districtcodes`");
					$sql->execute();$dataFetched = $sql->fetchAll();
						echo json_encode($dataFetched);
                }else{
                	echo json_encode('not');
                }
                
		}	
		

        
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

   



?>