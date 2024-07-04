<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] != 'admin'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    try {
        $database = new Connection();
        $db = $database->openConnection();

        if (isset($_POST['teamSelected'])) {

            $teamName = $_POST['teamSelected'];

            $sql = $db->prepare("SELECT * FROM `teams` WHERE `teamname` = :teamName ORDER BY `teamname` ASC");
            $sql->execute([':teamName' => $teamName]);
            // $sql->execute();
            $teamDeets = $sql->fetch();

            $sql = $db->prepare("SELECT * FROM `districtcodes`");
            $sql->execute();
            $dataFetched = $sql->fetchAll();

        } else {
            $sql = $db->prepare("SELECT * FROM `teams` ORDER BY `teamname` ASC");
            $sql->execute();
            $dataFetched = $sql->fetchAll();   
        }
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    $title = 'Edit Team';

    include 'inc/header.php';

    if (isset($_SESSION['success'])) {
        $msg = '<div class="col-12"><p class="successMsg">"'.$_SESSION['teamName'].'" '.$_SESSION['success'].'</p></div>';
    } else if (isset($_SESSION['error'])) {
        $msg = '<div class="col-12"><p class="errorMsg">'.$_SESSION['error'].'</p></div>';
    } else {
        $msg = '';
    }



?>

<div class="users">
    <?php echo $msg; ?>

    <div class="container">
        <div class="row">
            <div class="col-12">

                <?php
                
                    if (!isset($_POST['teamSelected'])) {

                ?>

                    <h4>Select Team</h4>

                    <form action="" method="post">
                        <div class="form-group">
                        <label for="teamSelected">Fetch Team Details</label>
                        <select name="teamSelected" id="teamSelected">
                            <option value="-" disabled selected>Select</option>
                            <?php
                                foreach ($dataFetched as $team) {
                            ?>
                            <option value="<?php echo $team['teamname']; ?>"><?php echo ucfirst($team['teamname']); ?></option>
                            <?php
                                }
                            ?>
                        </select>
                        </div>
                        

                        <div class="form-group">
                            <input type="submit" value="Select Team">
                        </div>
                    </form>

                <?php
                        
                    } else {

                ?>

                <div class="row">
                    <div class="col-12">
                        <a href="/dashboard/teamDetails.php" class="backTeamBtn"><i class="fas fa-chevron-left"></i> Select Team</a>
                        <hr>
                    </div>
                </div>

                <h4>Team Details</h4>
                <hr>

                <div class="row">
                    
                    <div class="col-sm-6">
                        <form action="process/teamEdits.php" method="post">
                            <input type="hidden" name="oldTeamName" id="oldTeamName" value="<?php echo $teamDeets['teamname']; ?>">
                            <div class="form-group">
                                <label for="teamName">Team's Name</label>
                                <input type="text" name="teamName" id="teamName" required placeholder="Enter Teams's Name"
                                value="<?php echo $teamDeets['teamname']; ?>"
                                >
                            </div>

                            <div class="form-group">
                                <label for="conference">Conference</label>
                                <input type="text" name="conference" id="conference" required placeholder="Enter Team Conference"
                                value="<?php echo $teamDeets['conference']; ?>"
                                >
                            </div>

                            <div class="form-group">
                                <label for="teamDivision">Team Division</label>
                                <select name="teamDivision" id="teamDivision">
                                    <?php
                                        foreach ($dataFetched as $division) {
                                            if($teamDeets['division'] == $division['division']) {
                                    ?>
                                    <option value="<?php echo $division['division'];?>" selected><?php echo $division['division'];?></option>
                                    <?php
                                        } else {
                                    ?>
                                    <option value="<?php echo $division['division'];?>"><?php echo $division['division'];?></option>
                                    <?php
                                        }
                                    }
                                    ?>
                                </select>
                            </div>

                    </div>

                    <div class="col-sm-6">
                            <div class="form-group">
                                <label for="homeHouse">Home House</label>
                                <input type="text" name="homeHouse" id="homeHouse" required placeholder="Enter Home House"
                                value="<?php echo $teamDeets['homehouse']; ?>"
                                >
                            </div>

                        <div class="form-group">
                            <label for="teamContact">Team Contact</label>
                            <input type="text" name="teamContact" id="teamContact" placeholder="Enter Team Contact"
                            value="<?php echo $teamDeets['contact']; ?>"
                            >
                        </div>
                    </div>

                    <div class="col-12">
                        <div class="form-group">
                            <input type="submit" value="Update Team">
                        </div>

                        </form>
                    </div>

                </div>

                <?php

                    };

                ?>

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