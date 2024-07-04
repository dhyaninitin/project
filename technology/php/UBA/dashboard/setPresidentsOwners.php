<?php

    include_once '../session.php';
    include_once '../connect.php';

    require_once('phpspreadsheet/vendor/autoload.php');
 
    use PhpOffice\PhpSpreadsheet\Spreadsheet;
    use PhpOffice\PhpSpreadsheet\Reader\Csv;
    use PhpOffice\PhpSpreadsheet\Reader\Xlsx;
    
    if (isset($_POST['submit'])) {

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

            try {
                $database = new Connection();
                $db = $database->openConnection();

                foreach ($sheetData as $scoreentry) {
                    $bowlerName = $scoreentry[0];
                    $teamName = $scoreentry[1];
                    $president = $scoreentry[2];
                    $owner = $scoreentry[3];

                    $yes = 1;

                    if ($president == 'X') {
                        $sql = "UPDATE bowlers 
                                SET `president` = :yes
                                WHERE `name` = :bowlerName";

                        $stmt = $db->prepare($sql);                                  
                        $stmt->bindParam(':yes', $yes);
                        $stmt->bindParam(':bowlerName', $bowlerName);
                        $stmt->execute(); 

                        $sql = "UPDATE teams 
                                SET `president` = :bowlerName
                                WHERE `teamname` = :teamName";

                        $stmt = $db->prepare($sql);                                  
                        $stmt->bindParam(':bowlerName', $bowlerName);
                        $stmt->bindParam(':teamName', $teamName);
                        $stmt->execute(); 
                    }

                    if ($owner == 'X') {
                        $sql = "UPDATE bowlers 
                                SET `owner` = :yes
                                WHERE `name` = :bowlerName";

                        $stmt = $db->prepare($sql);                                  
                        $stmt->bindParam(':yes', $yes);
                        $stmt->bindParam(':bowlerName', $bowlerName);
                        $stmt->execute(); 

                        $sql = "UPDATE teams 
                                SET `owner` = :bowlerName
                                WHERE `teamname` = :teamName";

                        $stmt = $db->prepare($sql);                                  
                        $stmt->bindParam(':bowlerName', $bowlerName);
                        $stmt->bindParam(':teamName', $teamName);
                        $stmt->execute();
                    }
                }
                
            } catch (PDOException $e) {
                echo "There was some problem with the connection: " . $e->getMessage();
            }
        }
    }

    $title = 'Upload Score Sheet';
    include 'inc/header.php';

?>

<div class="addscore">
        <div class="col-12">
            <h4>Upload President Sheet</h4>
            <?php echo $msg; ?>
            <hr>
            <form action="" method="post" enctype="multipart/form-data">      

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