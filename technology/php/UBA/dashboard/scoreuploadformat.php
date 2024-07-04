<?php

    include_once '../session.php';
    include_once '../connect.php';

    require_once('phpspreadsheet/vendor/autoload.php');

    use PhpOffice\PhpSpreadsheet\Spreadsheet;
    use PhpOffice\PhpSpreadsheet\IOFactory;

    $type = $_POST['type'];

    $filename = 'formatsheets/UBA Score Sheet Upload Format.xlsx';

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

    $title = 'Score Format Sheet';
    include 'inc/header.php';

?>

<div class="addscore">
        <div class="col-12">
            <h4>Download Format Sheets</h4>
            <?php echo $msg; ?>
            <hr>
            <form action="" method="POST">
                <hr>

                <div class="form-group">
                    <input type="submit" value="Download Sheet" name="submit">
                </div>
            </form>
        </div>
    </div>

<?php

include 'inc/footer.php';

?>