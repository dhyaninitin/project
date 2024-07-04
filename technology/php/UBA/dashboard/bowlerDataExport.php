<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] == 'president' || $_SESSION['userrole'] == 'bowler' || $_SESSION['userrole'] == 'owner'  || $_SESSION['userrole'] == 'secretary'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    require_once('phpspreadsheet/vendor/autoload.php');

    use PhpOffice\PhpSpreadsheet\Spreadsheet;
    use PhpOffice\PhpSpreadsheet\IOFactory;

    // use PhpOffice\PhpSpreadsheet\Reader\Xlsx;

    // try {
    //     $database = new Connection();
    //     $db = $database->openConnection();

    //     $sql = $db->prepare("SELECT `bowlerid`, `team`, `name`, `enteringAvg`, `sanction`, `ubaAvg`, `seasontourAvg` FROM `teams`");
    //     $sql->execute();
    //     $dataFetched = $sql->fetchAll();
        
    // } catch (PDOException $e) {
    //     echo "There was some problem with the connection: " . $e->getMessage();
    // }

    if (isset($_POST['submit'])) {

                // $sheetname = 'STATS';
                // $reader = new \PhpOffice\PhpSpreadsheet\Reader\Xlsx();
                // // $reader->setLoadSheetsOnly(["STATS", "Standings", "Total Pins", "Match Information", "Match1", "Match2", "Match3", "Match4", "Match5", "Match6", "recap1", "recap2", "recap3", "recap4", "recap5", "recap6", "All scores", "All scores-"]);
                // $reader->setLoadSheetsOnly("STATS");
                // $spreadsheet = $reader->load("formatsheets/BLANK RECAP FILE.xlsx");
                // $sheetData = $spreadsheet->getActiveSheet()->toArray();

// "SELECT teamname.teamname,bowlers.bowlerid, bowlers.team, bowlers.name, bowlers.enteringAvg, bowlers.sanction, bowlers.ubaAvg, bowlers.seasontourAvg FROM teamname INNER JOIN bowlers ON teamname.teamname = bowlers.team"


                try {
                    $database = new Connection();
                    $db = $database->openConnection();

                    $sql = $db->prepare("SELECT teams.teamname,bowlers.bowlerid, bowlers.team, bowlers.name, bowlers.enteringAvg,
                    bowlers.sanction, bowlers.ubaAvg, bowlers.seasontourAvg FROM teams INNER JOIN bowlers ON teams.teamname = bowlers.team 
                    ORDER BY teams.teamname  ASC ");
                    $sql->execute();
                    $allTeams = $sql->fetchAll();

                    $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
                    $sheet = $spreadsheet->getActiveSheet();
    
                    //Specify the properties for this document
                    $spreadsheet->getProperties()
                    ->setTitle($type)
                    ->setSubject($type . 'Format Sheet')
                    ->setDescription('Format Sheet for UBA score entry')
                    ->setCreator('UBA System');
                    // ->setLastModifiedBy('php-download.com');
    
                    // Adding data to the excel sheet
                    $spreadsheet->setActiveSheetIndex(0)
                        ->setCellValue('A1', 'UBA ID')
                        ->setCellValue('B1', 'Team')
                        ->setCellValue('C1', 'Name')
                        ->setCellValue('D1', '')
                        ->setCellValue('E1', 'Entering Avg')
                        ->setCellValue('F1', 'UBA Avg')
                        ->setCellValue('G1', 'Season Tour Avg');
                    	// ->setCellValue('H1', 'demo avrg')
                    	// ->setCellValue('I1', 'Demo Total length')
                    	// ->setCellValue('J1', 'demo avrge');
                    	
                    	$i = 2;
							foreach ($allTeams as $team) {
								$bowlerId = $team['bowlerid'];
									$bow = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerId' ");
	                        	$bow->execute();
	            				$dataFetched = $bow->fetchAll();
	            				$arrayCount = array(); $gamelenth = array();
	            				// $eventName = ''; 
	            				  //$addAll = 0; 
	            				  $game1 = 0; $game2 = 0; $game3 = 0; $addAll = 0; $avrgss =0;
	                        		foreach ($dataFetched as $bowler) {
	                        			
	                        				$eventDate = date('Y-m-d ', strtotime($bowler['eventdate']));
	                        				$sectValue1 = date('Y-m-d ', strtotime('09-01-2021'));
	                        				$sectValue2 = date('Y-m-d ', strtotime('09-01-2022'));
	                        				if (($eventDate <= $sectValue2) && ($eventDate >=  $sectValue1)){
	                        					
	                        					if($bowler['game1'] > 1 ){
	                        						$game1 = $game1 + $bowler['game1'];
					                        		array_push($gamelenth, $bowler['game1']);
					                        	}
					                        	if($bowler['game2'] > 1 ){
					                        		$game2 = $game2 + $bowler['game2'];
					                        		array_push($gamelenth, $bowler['game2']);
					                        	}
					                        	
					                        	if($bowler['game3'] > 1 ){
					                        		$game3 = $game3 + $bowler['game3'];
					                        		array_push($gamelenth, $bowler['game3']);
					                        	}
					                        	array_push($arrayCount, '1');
					                        	
					                        	if(sizeof($gamelenth) >= 9){
					                        		$addAll = $game1 + $game2 + $game3;
					                        		$avrgss = $addAll/sizeof($gamelenth);
					                        	}else{
					                        		$addAll = 0;
						                        	}
						                        
		                        			}
		                        			
		                        		}
                        		
                        		
								$spreadsheet->setActiveSheetIndex(0)
                                    ->setCellValue('A'.$i, $bowlerId)
                                    ->setCellValue('B'.$i, $team['team'])
                                    ->setCellValue('C'.$i, $team['name'])
                                    ->setCellValue('D'.$i, '')
                                    ->setCellValue('E'.$i, $team['enteringAvg'])
                                    ->setCellValue('F'.$i, $team['ubaAvg'])
                                    ->setCellValue('G'.$i, number_format($avrgss,2));
                                    // ->setCellValue('H'.$i, 'count($gamelenth)')
                                    // ->setCellValue('I'.$i, '$counttt')
                                    // ->setCellValue('J'.$i, '$avrgss');
                                    
                                    $i++;
							}
							
                    	

                        $filename = "UBA Bowler Data.xlsx";
    
                        $writer = IOFactory::createWriter($spreadsheet, "Xlsx"); //Xls is also possible
                        // $writer->setPreCalculateFormulas(false);
                        $writer->save($filename);
    
                            // Process download
                            if(file_exists($filename)) {
                                header('Content-Description: File Transfer');
                                header('Content-Type: application/octet-stream');
                                header('Content-Disposition: attachment; filename="'.basename($filename).'"');
                                header('Expires: 0');
                                header('Cache-Control: must-revalidate');
                                header('Pragma: public');
                                header('Content-Length: ' . filesize($filename));
                                flush(); // Flush system output buffer
                                readfile($filename);
                            }
                        unlink($filename);
                    
                } catch (PDOException $e) {
                    echo "There was some problem with the connection: " . $e->getMessage();
                }

            
    
            
    }

    

    $title = 'Bowler Data';

    include 'inc/header.php';

?>

    <div class="users">
        <?php echo $msg; ?>
        
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <h4>Download Bowler Data</h4>
                    <form action="" method="post">
                        <!--<div class="form-group">-->
                            <!-- <label for="username">User's Name</label> -->
                            <!-- <input type="text" name ="username" id="username" required placeholder="Enter User's Name"> -->
                        <!--</div>-->
                        <div class="form-group">
                            <input type="submit" value="Download Bowler Data" name="submit">
                        </div>

                    </form>
                </div>
            </div>
        </div>
    </div>

<?php

include 'inc/footer.php';

?>
