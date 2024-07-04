<?php
include_once '../baseurl.php';
session_start();//session is a way to store information (in variables) to be used across multiple pages.
session_destroy();

header("Location: ".$base_url."/index.php");//use for the redirection to some page
?> 
