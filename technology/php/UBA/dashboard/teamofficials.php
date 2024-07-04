<?php	
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] != 'admin'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    require_once('phpspreadsheet/vendor/autoload.php');

    use PhpOffice\PhpSpreadsheet\Spreadsheet;
    use PhpOffice\PhpSpreadsheet\IOFactory;

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT `teamname`, `president`, `owner` FROM `teams` ORDER BY `teamname` ASC");
        $sql->execute();
        $dataFetched = $sql->fetchAll();
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    if (isset($_POST['submit'])) {
        $spreadsheet = new Spreadsheet();

        try {
            $database = new Connection();
            $db = $database->openConnection();

            $sql = $db->prepare("SELECT `teamname`, `president`, `owner` FROM `teams` ORDER BY `teamname` ASC");
            $sql->execute();
            $dataFetched = $sql->fetchAll();

            //Specify the properties for this document
            $spreadsheet->getProperties()
            ->setTitle($type)
            ->setSubject($type . 'Format Sheet')
            ->setDescription('Format Sheet for UBA score entry')
            ->setCreator('UBA System');
            // ->setLastModifiedBy('php-download.com');

        //Adding data to the excel sheet
        $spreadsheet->setActiveSheetIndex(0)
            ->setCellValue('A1', 'Team')
            ->setCellValue('B1', 'President')
            ->setCellValue('C1', 'Owner');

        $i = 2;

        foreach ($dataFetched as $bowler) {

            $spreadsheet->setActiveSheetIndex(0)
            ->setCellValue('A'.$i, $bowler['teamname'])
            ->setCellValue('B'.$i, $bowler['president'])
            ->setCellValue('C'.$i, $bowler['owner']);

            $i++;
        }

        $filename = "UBA-Team-Presidents&Owners-Data.xlsx";

        $writer = IOFactory::createWriter($spreadsheet, "Xlsx"); //Xls is also possible
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
    $title = 'Download Team Officials';

    include 'inc/header.php';


?>

<div class="users roster">
    <?php echo $msg; ?>

    <div class="container">
        <div class="row">
            <div class="col-12">

                <div class="row">
                    <div class="col-12">
                        <h4>Team Presidents & Owners</h4>
                        <!-- <form action="" method="post">
                            <div class="form-group">
                            </div>

                            <div class="form-group">
                                <input type="submit" value="Download Team Data" name="submit">
                            </div> -->

                            <table id="team_officials" class="display">
                                <thead>
                                    <tr>
                                        <th>No.</th>
                                        <th>Team</th>
                                        <th>President</th>
                                        <th>Owner</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php
                                        $i = 1;
                                        foreach ($dataFetched as $singleScoreData) {

                                        try {

                                          $teamName = $singleScoreData['teamname'];

                                          $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `team` = :teamName AND `president` = 1");
                                          $sql->execute([':teamName' => $teamName]);
                                          // $sql->execute();
                                          $presidentBowler = $sql->fetch();

                                        } catch (PDOException $e) {
                                            echo "There was some problem with the connection: " . $e->getMessage();
                                        }

                                    ?>
                                    <tr>
                                        <td>
                                            <?php echo $i; ?>
                                        </td>
                                        <td>
                                            <?php echo $singleScoreData['teamname'];?>
                                        </td>
                                        <td>
                                            <?php echo $presidentBowler['name']; ?>
                                        </td>
                                        <td>
                                            <?php echo $singleScoreData['owner']; ?>
                                        </td>

                                    </tr>
                                    <?php
                                                    $i++;
                                                    }
                                                ?>
                                </tbody>
                            </table>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    </div>
</div>

<?php

unset($_SESSION['success']);
unset($_SESSION['error']);
unset($_SESSION['teamName']);
include 'inc/footer.php';

?>
