<?php

include_once '../session.php';
include_once '../connect.php';

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `bowlers` GROUP BY `bowlerid` ORDER BY `team` ASC");
        $sql->execute();
        $dataFetched = $sql->fetchAll();
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    $info = getdate();
    $date = $info['mday'];
    $month = $info['mon'];
    $year = $info['year'];
    $hour = $info['hours'];
    $min = $info['minutes'];
    $sec = $info['seconds'];

    $currentdate = $month.'/'.$date.'/'.$year;

    $datesubmitted = date('Y-m-d H:i:s',strtotime($currentdate));

    echo $datesubmitted;
    exit();

?>

<table>
<tbody>
    <?php
        $i = 1;
        foreach ($dataFetched as $bowler) {
    ?>
        <tr>
            <td><?php echo $i?></td>
            <td><?php echo $bowler['bowlerid'];?></td>
            <td><?php echo $bowler['name'];?></td>
            <td><?php echo $bowler['team'];?></td>
        </tr>
    <?php
            $i++;
        }
    ?>
</tbody>
</table>