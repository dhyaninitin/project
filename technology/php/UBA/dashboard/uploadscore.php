<?php

    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] != 'admin'){
        header("Location: /dashboard/home.php");
    }

    require_once('phpspreadsheet/vendor/autoload.php');
 
    use PhpOffice\PhpSpreadsheet\Spreadsheet;
    use PhpOffice\PhpSpreadsheet\Reader\Csv;
    use PhpOffice\PhpSpreadsheet\Reader\Xlsx;
    
    if (isset($_POST['submit'])) {

        $type = $_POST['type'];

        $file_mimes = array('text/x-comma-separated-values', 'text/comma-separated-values', 'application/octet-stream', 'application/vnd.ms-excel', 'application/x-csv', 'text/x-csv', 'text/csv', 'application/csv', 'application/excel', 'application/vnd.msexcel', 'text/plain', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
        if(isset($_FILES['file']['name']) && in_array($_FILES['file']['type'], $file_mimes)) {
        
            $arr_file = explode('.', $_FILES['file']['name']);
            $extension = end($arr_file);
        
            if('csv' == $extension) {
                $reader = new \PhpOffice\PhpSpreadsheet\Reader\Csv();
            } else {
                $reader = new \PhpOffice\PhpSpreadsheet\Reader\Xlsx();
            }
        
            $spreadsheet = $reader->load($_FILES['file']['tmp_name']);
            $sheetData = $spreadsheet->getActiveSheet()->toArray();

            array_shift($sheetData);

            try {
                $database = new Connection();
                $db = $database->openConnection();

                foreach ($sheetData as $scoreentry) {
                    $bowlerUBAID = $scoreentry[0];
                    $eventDate = date('Y-m-d H:i:s',strtotime($scoreentry[1]));
                    $eventYear = $scoreentry[2];
                    $eventName = $scoreentry[3];
                    $eventLocation = $scoreentry[4];
                    $teamName = $scoreentry[5];
                    $bowler = $scoreentry[6];
                    $average = $scoreentry[7];
                    $game1 = $scoreentry[8];
                    $game2 = $scoreentry[9];
                    $game3 = $scoreentry[10];
                    $game4 = $scoreentry[11];
                    $game5 = $scoreentry[12];
                    $totalpinfall = 0;
                    $totalgames = 0;
                    $enteravg = 0;
                    $bowlingType = '-';
                    $bowlingNumber = '-';

                    $entryby = $_SESSION['useremail'];

                    $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `bowlerid` = '$bowlerUBAID'");
                    $sql->execute();
                    $bowlerIndData = $sql->fetch();

                    $bowler = $bowlerIndData['name'];
                    $teamName = $bowlerIndData['team'];

                    if ($type == 'season') {

                        $game4 = 0;
                        $game5 = 0;

                        $statement = $db->prepare("INSERT INTO bowlerdataseason (`bowlerid`,`eventdate`,`year`,`event`,`location`,`team`,`name`,`average`,`game1`,`game2`,`game3`,`totalpinfall`,`totalgames`,`enteravg`,`bowlingType`,`bowlerNumber`,`entryby`)
                        VALUES(:bowlerid, :eventDate, :eventYear, :eventName, :eventLocation, :teamName, :bowler, :average, :game1, :game2, :game3, :totalpinfall, :totalgames, :enteravg, :bowlingType, :bowlingNumber, :entryby)");
                        
                        $statement->execute(array(
                            "bowlerid" => "$bowlerUBAID",
                            "eventDate" => "$eventDate",
                            "eventYear" => "$eventYear",
                            "eventName" => "$eventName",
                            "eventLocation" => "$eventLocation",
                            "teamName" => "$teamName",
                            "bowler" => "$bowler",
                            "average" => "$average",
                            "game1" => "$game1",
                            "game2" => "$game2",
                            "game3" => "$game3",
                            "totalpinfall" => "$totalpinfall",
                            "totalgames" => "$totalgames",
                            "enteravg" => "$enteravg",
                            "bowlingType" => "$bowlingType",
                            "bowlingNumber" => "$bowlingNumber",
                            "entryby" => "$entryby"
                        ));
                    }

                    if ($type == 'event') {
                        $statement = $db->prepare("INSERT INTO bowlerdata (`bowlerid`,`eventdate`,`year`,`event`,`eventtype`,`team`,`name`,`average`,`game1`,`game2`,`game3`,`game4`,`game5`,`totalpinfall`,`totalgames`,`enteravg`,`entryby`)
                        VALUES(:bowlerid, :eventDate, :eventYear, :eventName, :eventLocation, :teamName, :bowler, :average, :game1, :game2, :game3, :game4, :game5, :totalpinfall, :totalgames, :enteravg, :entryby)");
                        
                        $statement->execute(array(
                            "bowlerid" => "$bowlerUBAID",
                            "eventDate" => "$eventDate",
                            "eventYear" => "$eventYear",
                            "eventName" => "$eventName",
                            "eventLocation" => "$eventLocation",
                            "teamName" => "$teamName",
                            "bowler" => "$bowler",
                            "average" => "$average",
                            "game1" => "$game1",
                            "game2" => "$game2",
                            "game3" => "$game3",
                            "game4" => "$game4",
                            "game5" => "$game5",
                            "totalpinfall" => "$totalpinfall",
                            "totalgames" => "$totalgames",
                            "enteravg" => "$enteravg",
                            "entryby" => "$entryby"
                        ));
                    }
                }

                foreach ($sheetData as $scoreentry) {
                    $bowlerUBAID = $scoreentry[0];

                                // Calculate UBA & Season Tour Average
                    $sql = $db->prepare("SELECT * FROM `bowlerdata` WHERE `bowlerid` = '$bowlerUBAID' ORDER BY `eventdate` DESC LIMIT 100");
                    $sql->execute();
                    $dataFetchedEvents = $sql->fetchAll();

                    $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerUBAID' ORDER BY `eventdate` DESC LIMIT 100");
                    $sql->execute();
                    $dataFetchedSeasonTour = $sql->fetchAll();

                    $dataFetched = array_merge($dataFetchedEvents,$dataFetchedSeasonTour);

                    // var_dump($dataFetched);

                    if ($dataFetched) {
                        usort($dataFetched, function ($a, $b){
                
                            if ($a['eventdate'] == $b['eventdate']) {
                                return strtotime($b['logtime']) - strtotime($a['logtime']);
                            }
            
                            return strtotime($b['eventdate']) - strtotime($a['eventdate']);
                        });
                
                        $gamesArr = array();
                        $gamesTotal = 0;
                
                        $totalPinfalls = 0;
                
                        $finalArr = array();
                
                        $sampleData = array();
                
                        foreach ($dataFetched as $eventRow) {
                
                                if ($gamesTotal > 49) {
                                    break;
                                }
                
                                $game1 = $eventRow['game1'];
                                $game2 = $eventRow['game2'];
                                $game3 = $eventRow['game3'];
                                $game4 = $eventRow['game4'];
                                $game5 = $eventRow['game5'];
                
                                $data = array();
                
                                if ($game5 > 0 && $gamesTotal < 50) {
                                    array_push($gamesArr, $game5);
                                    $totalPinfalls += $game5;
                                    $gamesTotal++;
                                }
                                if ($game4 > 0 && $gamesTotal < 50) {
                                    array_push($gamesArr, $game4);
                                    $totalPinfalls += $game4;
                                    $gamesTotal++;
                                }
                                if ($game3 > 0 && $gamesTotal < 50) {
                                    array_push($gamesArr, $game3);
                                    $totalPinfalls += $game3;
                                    $gamesTotal++;
                                }
                                if ($game2 > 0 && $gamesTotal < 50) {
                                    array_push($gamesArr, $game2);
                                    $totalPinfalls += $game2;
                                    $gamesTotal++;
                                }
                                if ($game1 > 0 && $gamesTotal < 50) {
                                    array_push($gamesArr, $game1);
                                    $totalPinfalls += $game1;
                                    $gamesTotal++;
                                }
                
                                array_push($sampleData, $eventRow);
                            
                            }
                
                            $totalGames = sizeof($gamesArr);
                            $ubaAvg = ($totalPinfalls / $totalGames);
                
                            $ubaAvg = number_format($ubaAvg,2);

                            if ($totalGames < 9) {
                                $ubaAvg = 0;
                            }

                    } else {
                        $ubaAvg = 0;
                    }
            

                $sql = $db->prepare("SELECT * FROM `bowlerdataseason` WHERE `bowlerid` = '$bowlerUBAID' AND `year` = '2019/20' ORDER BY `eventdate` DESC LIMIT 50");
                $sql->execute();
                $dataFetchedLatestSeasonTour = $sql->fetchAll();
    
                if ($dataFetchedLatestSeasonTour) {
                    usort($dataFetchedLatestSeasonTour, function($a, $b) {
                        return strtotime($b['eventdate']) - strtotime($a['eventdate']);
                    });
        
                    $gamesArr = array();
                    $gamesTotal = 0;
                    $totalPinfalls = 0;
                    $finalArr = array();
                    $sampleData = array();
                    $totalGames = 0;
        
                    foreach ($dataFetchedLatestSeasonTour as $eventRow) {
        
                        if ($gamesTotal > 49) {
                            break;
                        }
        
                        $game1 = $eventRow['game1'];
                        $game2 = $eventRow['game2'];
                        $game3 = $eventRow['game3'];
        
                        $data = array();
        
                        if ($game3 > 0 && $gamesTotal < 50) {
                            array_push($gamesArr, $game3);
                            $totalPinfalls += $game3;
                            $gamesTotal++;
                        }
                        if ($game2 > 0 && $gamesTotal < 50) {
                            array_push($gamesArr, $game2);
                            $totalPinfalls += $game2;
                            $gamesTotal++;
                        }
                        if ($game1 > 0 && $gamesTotal < 50) {
                            array_push($gamesArr, $game1);
                            $totalPinfalls += $game1;
                            $gamesTotal++;
                        }
                    }
        
                    $totalGames = sizeof($gamesArr);
                    $seasonTourAvg = ($totalPinfalls / $totalGames);
        
                    if ($totalGames < 9) {
                        $seasonTourAvg = 0;
                    }
        
                    $seasonTourAvg = number_format($seasonTourAvg,2);
                } else {
                    $seasonTourAvg = 0;
                }


                    $sql = "UPDATE `bowlers` 
                            SET `ubaAvg` = :ubaAvg,
                                `seasontourAvg` = :seasonTourAvg
                            WHERE `bowlerid` = :bowlerUBAID";

                    $stmt = $db->prepare($sql);                                  
                    $stmt->bindParam(':ubaAvg', $ubaAvg);
                    $stmt->bindParam(':seasonTourAvg', $seasonTourAvg);
                    $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
                    $stmt->execute(); 
                }

                $_SESSION['success'] = 'Scores Uploaded';
                $_SESSION['error'] = 'There was an error, please re-upload the score sheet';
                
            } catch (PDOException $e) {
                echo "There was some problem with the connection: " . $e->getMessage();
            }
        }
    }

    if (isset($_SESSION['success'])) {
        $msg = '<div class="col-12"><p class="successMsg">'.$_SESSION['success'].'</p></div>';
    } else if (isset($_SESSION['error'])) {
        $msg = '<div class="col-12"><p class="errorMsg">'.$_SESSION['error'].'</p></div>';
    } else {
        $msg = '';
    }

    $title = 'Upload Score Sheet';
    include 'inc/header.php';

?>

<div class="addscore">
        <div class="col-12">
            <h4>Upload Score Sheets</h4>
            <?php echo $msg; ?>
            <hr>
            <form action="" method="post" enctype="multipart/form-data">   

                <div class="form-group">
                    <label for="type">Type:</label>
                    <select name="type" id="type" required>
                        <option value="-" disabled selected>Select</option>
                        
                        <option value="season">Season</option>
                        <option value="event">Event</option>
                    </select>
                </div>    

                <div class="form-group">
                    <label for="exampleInputFile">File Upload</label>
                    <input type="file" name="file" class="form-control" id="exampleInputFile" required>
                </div>

                <div class="form-group">
                    <input type="submit" name="submit" value="Upload File" >
                </div>
                
            </form>
        </div>
    </div>

<?php
unset($_SESSION['success']);
unset($_SESSION['error']);
include 'inc/footer.php';

?>