<?php

$state     = $_GET['state'];
$state_url = base64_decode( $state );

$params       = http_build_query( $_GET );
$redirect_url = $state_url . '&' . $params;

header( "Location: $redirect_url" );
exit();

