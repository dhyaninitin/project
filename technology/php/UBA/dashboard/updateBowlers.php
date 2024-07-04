<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] != 'admin'){
        header("Location: ".$base_url."/dashboard/home.php");
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

            $sheetData = array_slice($sheetData,1);

            try {
                $database = new Connection();
                $db = $database->openConnection();

                foreach ($sheetData as $scoreentry) {
                    $bowlerUBAID = $scoreentry[0];
                    $teamName = $scoreentry[1];
                    $bowlerName = $scoreentry[2];
                    $enterAvg = $scoreentry[3];
                    $sanction = $scoreentry[4];


                    $sql = "UPDATE `bowlers` 
                            SET `team` = :teamName,
                                `name` = :bowlerName,
                                `enteringAvg` = :enterAvg,
                                `sanction` = :sanction                            
                            WHERE `bowlerid` = :bowlerUBAID";

                    $stmt = $db->prepare($sql);                                  
                    $stmt->bindParam(':teamName', $teamName);
                    $stmt->bindParam(':bowlerName', $bowlerName);
                    $stmt->bindParam(':enterAvg', $enterAvg);
                    $stmt->bindParam(':sanction', $sanction);
                    $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
                    $stmt->execute(); 

                    $sql = "UPDATE `bowlerdata` 
                            SET `team` = :teamName,
                                `name` = :bowlerName                                
                            WHERE `bowlerid` = :bowlerUBAID";

                    $stmt = $db->prepare($sql);                                  
                    $stmt->bindParam(':teamName', $teamName);
                    $stmt->bindParam(':bowlerName', $bowlerName);
                    $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
                    $stmt->execute(); 

                    $sql = "UPDATE `bowlerdataseason` 
                            SET `team` = :teamName,
                                `name` = :bowlerName                                
                            WHERE `bowlerid` = :bowlerUBAID";

                    $stmt = $db->prepare($sql);                                  
                    $stmt->bindParam(':teamName', $teamName);
                    $stmt->bindParam(':bowlerName', $bowlerName);
                    $stmt->bindParam(':bowlerUBAID', $bowlerUBAID);
                    $stmt->execute(); 
                }

                $totalRows = sizeof($sheetData);

                $_SESSION['success'] = $totalRows. ' bowlers updated';
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

<div class="addscore updateData">
    <div class="col-12">
        <h4>Update Bowler Data - Upload</h4>
        <?php echo $msg; ?>
        <hr>
        <form action="" method="post" enctype="multipart/form-data">
            <!-- <p>Tick the columns which need to be updated with the sheet data:<br>(Not checking any box will not update any data)</p>
            <div class="form-group">
                <input type="checkbox" name="bteam" id="bteam"><label for="bteam">Team</label>
            </div>
            <div class="form-group">
                <input type="checkbox" name="bname" id="bname"><label for="bname">Bowler Name</label>
            </div>
            <div class="form-group">
                <input type="checkbox" name="enterAvg" id="enterAvg"><label for="enterAvg">Entering Average</label>
            </div>
            <div class="form-group">
                <input type="checkbox" name="sanction" id="sanction"><label for="sanction">Sanction #</label>
            </div>
            <hr> -->

            <div class="form-group">
                <label for="exampleInputFile">File Upload</label>
                <input type="file" name="file" class="form-control" id="exampleInputFile" required>
            </div>

            <div class="form-group">
                <input type="submit" name="submit" value="Update Bowler Data">
            </div>

        </form>
    </div>
</div>

<?php
unset($_SESSION['success']);
unset($_SESSION['error']);
include 'inc/footer.php';

?>