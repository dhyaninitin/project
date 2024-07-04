<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] == 'admin' || $_SESSION['userrole'] == 'staff' || $_SESSION['userrole'] == 'bowler'  || $_SESSION['userrole'] == 'eventstaff'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    try {
        $database = new Connection();
        $db = $database->openConnection();

        if (isset($_POST['bowlerName'])) {

            $bowlerName = $_POST['bowlerName'];
            $searchBowlers = $_SESSION['team'];
           
            $sql = $db->prepare("SELECT `id`,`bowlerid`, `bowler`,`team` FROM `bowlersreleased` WHERE `bowler` LIKE '%".$bowlerName."%' AND `currentstatus` = 'Released' AND `team` = 'Released Bowlers' AND `isTransferred` = '0'");
            // $sql->execute([':bowlerName' => $bowlerName]);
            $sql->execute();
            $independentBowlers = $sql->fetchAll();
            //echo"<pre>",print_r($independentBowlers);exit();
        }

        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    $title = 'Add Bowler to Team Roster';

    include 'inc/header.php';

    if (isset($_SESSION['success'])) {
        $msg = '<div class="col-12"><p class="successMsg">'.$_SESSION['success'].'</p></div>';
    } else if (isset($_SESSION['error'])) {
        $msg = '<div class="col-12"><p class="errorMsg">'.$_SESSION['error'].'</p></div>';
    } else {
        $msg = '';
    }

?>

<div class="users roster">
    <?php echo $msg; ?>

    <div class="container">
        <div class="row">
            <div class="col-12">

                <!-- <div class="row">
                    <div class="col-12">
                        <h5>Bowler List</h5>
                        <hr>
                    </div>
                </div> -->

                

                <div class="row">

                    <div class="col-12">

                    <?php
                        if (isset($_POST['bowlerName'])) {
                    ?>
                    <h4>Add Bowler to Team</h4>
                    <p>Bowlers would appear in the Team Roster after the Admin approves the Transfer</p>
                    <a href="teamAddBowler.php" class="backTeamBtn">Reset Search</a>
                    <hr>
                    
                    <table id="independentBowlerList">
                        <thead>
                            <th>No.</th>
                            <th>Name</th>
                            <th>Bowler ID</th>
                            <th>Team</th>
                            <th>Add to Team</th>
                        </thead>
                        <tbody>
                        <?php
                            $i = 1;
                            foreach ($independentBowlers as $bowlers) {
                                if ($bowlers['team'] != $searchBowlers) {
                        ?>
                            <tr>
                                <td><?php echo $i; ?></td>
                                <td><?php echo $bowlers['bowler']; ?></td>
                                <td><?php echo $bowlers['bowlerid']; ?></td>
                                <td><?php echo $bowlers['team']; ?></td>
                                <td><a href="process/addBowlertoTeam.php?id=<?php echo $bowlers['bowlerid']; ?>"><i class="fas fa-plus-square"></i></a></td>
                            </tr>
                        <?php
                                }
                            $i++;
                            }

                        ?>
                        </tbody>
                    </table>
                    <?php
                        } else {
                    ?>
                    <h4>Search Bowlers</h4>
                    <hr>
                    <form action="" method="POST">
                        <input type="text" name="bowlerName" placeholder="Search by bowler name">
                        <br>
                        <input type="submit" value="Search">
                    </form>
                    <?php
                        }
                    ?>
                        
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