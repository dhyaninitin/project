<?php

    include_once '../session.php';
    include_once '../connect.php';

    require_once('phpspreadsheet/vendor/autoload.php');

    use PhpOffice\PhpSpreadsheet\Spreadsheet;
    use PhpOffice\PhpSpreadsheet\IOFactory;

    $type = $_POST['type'];

    if ($type == 'event') {
        $spreadsheet = new Spreadsheet();

        //Specify the properties for this document
        $spreadsheet->getProperties()
            ->setTitle($type)
            ->setSubject($type . 'Format Sheet')
            ->setDescription('Format Sheet for UBA score entry')
            ->setCreator('UBA System');
            // ->setLastModifiedBy('php-download.com');

        //Adding data to the excel sheet
        $spreadsheet->setActiveSheetIndex(0)
            ->setCellValue('A1', 'BowlerID')
            ->setCellValue('B1', 'Date(YYYY-MM-DD)')
            ->setCellValue('C1', 'Year (eg - 2018/19)')
            ->setCellValue('D1', 'Event Name')
            ->setCellValue('E1', 'Event Type')
            ->setCellValue('F1', 'Team')
            ->setCellValue('G1', 'Name')
            ->setCellValue('H1', 'Game 1')
            ->setCellValue('I1', 'Game 2')
            ->setCellValue('J1', 'Game 3')
            ->setCellValue('K1', 'Game 4')
            ->setCellValue('L1', 'Game 5');

        $filename = "UBA-Event-Score-Entry-Format.xlsx";

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
    } 
    
    if ($type == 'season') {
        // $spreadsheet = new Spreadsheet();

        // //Specify the properties for this document
        // $spreadsheet->getProperties()
        //     ->setTitle($type)
        //     ->setSubject($type . 'Format Sheet')
        //     ->setDescription('Format Sheet for UBA score entry')
        //     ->setCreator('UBA System');
        //     // ->setLastModifiedBy('php-download.com');

        // //Adding data to the excel sheet
        // $spreadsheet->setActiveSheetIndex(0)
        //     ->setCellValue('A1', 'Match #')
        //     ->setCellValue('B1', 'Bowler`s Team')
        //     ->setCellValue('C1', 'Bowler`s Name')
        //     ->setCellValue('D1', 'Avg')
        //     ->setCellValue('E1', 'Game 1')
        //     ->setCellValue('F1', 'Game 2')
        //     ->setCellValue('G1', 'Game 3')
        //     ->setCellValue('H1', 'Series');

        // $styleArray = [
        //     'font' => [
        //         'bold' => true,
        //     ],
        //     'fill' => [
        //         'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_GRADIENT_LINEAR,
        //         'rotation' => 90,
        //         'startColor' => [
        //             'argb' => 'FFFFFF00',
        //         ],
        //         'endColor' => [
        //             'argb' => 'FFFFFF00',
        //         ],
        //     ],
        //     'alignment' => [
        //         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
        //     ],
        //     'borders' => [
        //         'top' => [
        //             'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
        //         ],
        //         'bottom' => [
        //             'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
        //         ],
        //         'left' => [
        //             'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
        //         ],
        //         'right' => [
        //             'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
        //         ],
        //     ],
        // ];

        // $styleAlignCenter = [
        //     'alignment' => [
        //         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT,
        //     ]
        // ];

        
        // $row = 2;
        // for ($i=1; $i < 7; $i++) { 

        //     for ($j=0; $j < 12; $j++) { 

        //         if ($j < 4) {
        //             $spreadsheet->setActiveSheetIndex(0)
        //             ->setCellValue('A'.$row, 'Match '.$i)
        //             ->setCellValue('B'.$row, 'Place Left Lane Team Here')
        //             ->setCellValue('C'.$row, '-')
        //             ->setCellValue('D'.$row, 'N/A')
        //             ->setCellValue('E'.$row, '0')
        //             ->setCellValue('F'.$row, '0')
        //             ->setCellValue('G'.$row, '0')
        //             ->setCellValue('H'.$row, '0')
        //             ->getStyle('A'.$row)->applyFromArray($styleArray);
                    
        //             $row++;
        //         } else {
        //             $spreadsheet->setActiveSheetIndex(0)
        //             ->setCellValue('A'.$row, 'Match '.$i)
        //             ->setCellValue('B'.$row, 'Place Left Lane Team Here')
        //             ->setCellValue('C'.$row, '-')
        //             ->setCellValue('D'.$row, '250')
        //             ->setCellValue('E'.$row, '0')
        //             ->setCellValue('F'.$row, '0')
        //             ->setCellValue('G'.$row, '0')
        //             ->setCellValue('H'.$row, '0')
        //             ->getStyle('A'.$row)->applyFromArray($styleArray);
                
        //             $row++;
        //         }

        //     }

        //     for ($j=0; $j < 12; $j++) { 

        //         if ($j < 4) {
        //             $spreadsheet->setActiveSheetIndex(0)
        //             ->setCellValue('A'.$row, 'Match '.$i)
        //             ->setCellValue('B'.$row, 'Place Right Lane Team Here')
        //             ->setCellValue('C'.$row, '-')
        //             ->setCellValue('D'.$row, 'N/A')
        //             ->setCellValue('E'.$row, '0')
        //             ->setCellValue('F'.$row, '0')
        //             ->setCellValue('G'.$row, '0')
        //             ->setCellValue('H'.$row, '0')
        //             ->getStyle('A'.$row)->applyFromArray($styleArray);
                    
        //             $row++;
        //         } else {
        //             $spreadsheet->setActiveSheetIndex(0)
        //             ->setCellValue('A'.$row, 'Match '.$i)
        //             ->setCellValue('B'.$row, 'Place Right Lane Team Here')
        //             ->setCellValue('C'.$row, '-')
        //             ->setCellValue('D'.$row, '250')
        //             ->setCellValue('E'.$row, '0')
        //             ->setCellValue('F'.$row, '0')
        //             ->setCellValue('G'.$row, '0')
        //             ->setCellValue('H'.$row, '0')
        //             ->getStyle('A'.$row)->applyFromArray($styleArray);
                
        //             $row++;
        //         }

        //     }

        // }





        // $spreadsheet->setActiveSheetIndex(0)->mergeCells('A2:A25');
        // $spreadsheet->setActiveSheetIndex(0)->mergeCells('A26:A49');
        // $spreadsheet->setActiveSheetIndex(0)->mergeCells('A50:A73');
        // $spreadsheet->setActiveSheetIndex(0)->mergeCells('A74:A97');
        // $spreadsheet->setActiveSheetIndex(0)->mergeCells('A98:A121');
        // $spreadsheet->setActiveSheetIndex(0)->mergeCells('A122:A145');

        // $filename = "UBA-Season-Score-Entry-Format.xlsx";

        // $writer = IOFactory::createWriter($spreadsheet, "Xlsx"); //Xls is also possible
        // $writer->save($filename);

        $filename = 'formatsheets/BLANK TOUR STOP RECAP.xlsx';

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

                <div class="form-group">
                    <label for="type">Type:</label>
                    <select name="type" id="type" required>
                        <option value="-" disabled selected>Select</option>
                        
                        <option value="season">Season</option>
                        <option value="event">Event</option>
                    </select>
                </div>


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