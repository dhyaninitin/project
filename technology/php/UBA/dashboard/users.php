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

        $sql = $db->prepare("SELECT * FROM `users`");
        $sql->execute();
        $dataFetched = $sql->fetchAll();
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    $title = 'Users';

    include 'inc/header.php';

    if (isset($_SESSION['success'])) {
        $msg = '<div class="col-12"><p style="color: #009a00; font-weight: 500;">'.$_SESSION['success'].'</p></div>';
    } else if (isset($_SESSION['error'])) {
        $msg = '<div class="col-12"><p style="color: #df3200; font-weight: 500;">'.$_SESSION['error'].'</p></div>';
    } else {
        $msg = '';
    }

?>

    <div class="users">
        <div class="col-12">
            <h4>Users <span><a href="addUser.php" class="adduser"><i class="fas fa-plus"></i> Add User</a></span></h4>
            <table>
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Edit</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                        $i = 1;
                        foreach ($dataFetched as $user) {
                    ?>
                        <tr>
                            <td><?php echo $i; ?></td>
                            <td><?php echo $user['name']; ?></td>
                            <td style="flex-grow: 2;"><?php echo $user['email']; ?></td>
                            <td><?php echo ucfirst($user['userrole']); ?></td>
                            <td><a href="editUser.php?id=<?php echo $user['id']; ?>"><i class="fas fa-edit"></i></a></td>
                        </tr>
                    <?php
                            $i++;
                        }
                    ?>
                </tbody>
            </table>
        </div>
    </div>

<?php

include 'inc/footer.php';

?>
