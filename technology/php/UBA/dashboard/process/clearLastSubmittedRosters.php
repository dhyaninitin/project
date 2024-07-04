<?php

include_once '../../connect.php';

require_once('../phpspreadsheet/vendor/autoload.php');

    use PhpOffice\PhpSpreadsheet\Spreadsheet;
    use PhpOffice\PhpSpreadsheet\IOFactory;

            $spreadsheet = new Spreadsheet();

            try {
                $database = new Connection();
                $db = $database->openConnection();
        
                $sql = $db->prepare("SELECT `bowlerid`, `team`, `name`, `nickname1`, `bstatus`, `officeheld`, `uemail`, `sanction` FROM `submittedrosters`");
                $sql->execute();
                $dataFetched = $sql->fetchAll();

                $info = getdate();
                $date = $info['mday'];
                $month = $info['mon'];
                $year = $info['year'];
                $hour = $info['hours'];
                $min = $info['minutes'];
                $sec = $info['seconds'];

                $filen = 'submitted-rosters-'.$month.'-'.$date.'-'.$year;

                //Specify the properties for this document
                $spreadsheet->getProperties()
                ->setTitle($type)
                ->setSubject($type . ' ' .$filen)
                ->setDescription($filen)
                ->setCreator('UBA System');
                // ->setLastModifiedBy('php-download.com');

            //Adding data to the excel sheet
            $spreadsheet->setActiveSheetIndex(0)
                ->setCellValue('A1', 'Bowler ID')
                ->setCellValue('B1', 'Team')
                ->setCellValue('C1', 'Name')
                ->setCellValue('D1', 'Nickname')
                ->setCellValue('E1', 'Status')
                ->setCellValue('F1', 'Office Held')
                ->setCellValue('G1', 'Email')
                ->setCellValue('H1', 'Sanction');

            $i = 2;
            foreach ($dataFetched as $bowler) {

                $spreadsheet->setActiveSheetIndex(0)
                ->setCellValue('A'.$i, $bowler['bowlerid'])
                ->setCellValue('B'.$i, $bowler['team'])
                ->setCellValue('C'.$i, $bowler['name'])
                ->setCellValue('D'.$i, $bowler['nickname1'])
                ->setCellValue('E'.$i, $bowler['bstatus'])
                ->setCellValue('F'.$i, $bowler['officeheld'])
                ->setCellValue('G'.$i, $bowler['uemail'])
                ->setCellValue('H'.$i, $bowler['sanction']);

                $i++;
            }

            $filename = '../submittedrosters/'.$filen.'.xlsx';

            $writer = IOFactory::createWriter($spreadsheet, "Xlsx"); //Xls is also possible
            $writer->save($filename);

            $sql = $db->prepare("SELECT * FROM `teams` WHERE `rostersubmitted` = 1");
            $sql->execute();
            $checkTeamRoster = $sql->fetchAll();

            foreach ($checkTeamRoster as $team) {

                $teamName = $team['teamname'];

                $rostersubmitted = 0;
            
                    $sql = "UPDATE `teams` 
                            SET `rostersubmitted` = :rostersubmitted
                            WHERE `teamname` = :teamName";

                    $stmt = $db->prepare($sql);                                  
                    $stmt->bindParam(':rostersubmitted', $rostersubmitted);
                    $stmt->bindParam(':teamName', $teamName);
                    $stmt->execute(); 
            }

            $sql = "DELETE FROM `submittedrosters`";
            $db->exec($sql);
                
            } catch (PDOException $e) {
                echo "There was some problem with the connection: " . $e->getMessage();
            }
    

?>
