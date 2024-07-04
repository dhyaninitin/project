<?php

    include_once 'connect.php';

    $bowlerName = $_POST['name'];
    $bowlerTeam = $_POST['team'];
    $searchTerm = '';
    $column = '';

    try {
        $database = new Connection();
        $db = $database->openConnection();

        if ($bowlerName != '') {
            $searchTerm = $bowlerName;
            $column = 'name';
            $sql = $db->prepare("SELECT * FROM `bowlers` WHERE `$column` LIKE '%$searchTerm%' GROUP BY `bowlerid` ORDER BY `name`");
            $sql->execute();
        } else {
            $searchTerm = $bowlerTeam;
            $column = 'teamname';
            $sql = $db->prepare("SELECT * FROM `teams` WHERE `$column` LIKE '%$searchTerm%' GROUP BY `teamname` ORDER BY `teamname`");
            $sql->execute();
        }

        $dataFetched = $sql->fetchAll();
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

?>

    <!DOCTYPE html>
    <html>

    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>UBA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">
        <link rel="stylesheet" type="text/css" media="screen" href="css/bootstrap.min.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="css/animate.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="css/style.css" />

    </head>

    <body>

        <header>
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        <div class="logo">
                            <img src="images/UBA_logo.jpg" alt="UBA Logo">
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <div class="container">
            <div class="row">
                <div class="col-12">
                    <div class="searchContainer">
                    <h4>Member Search:</h4>
                    <form action="index.php" method="POST">
                        <div class="row">
                            <div class="col-md-6 col-12">
                                <label for="name">Name:</label>
                                <input type="text" name="name" id="name" placeholder="First or Last Name">
                            </div>
                            <div class="col-md-6 col-12">
                                <label for="team">Team name:</label>
                                <input type="text" name="team" id="team" placeholder="Team name">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12">
                                <input type="submit" value="Search" class="submitBtn">
                            </div>
                        </div>
                    </form>

                    <?php
                        if ($bowlerName != '') {
                            $i = 1;

                                foreach ($dataFetched as $player) {
                    ?>
                         <div class="singlePlayer">
                            <div class="row info" id="<?php echo $i;?>" data-bowler="<?php echo $player['bowlerid'];?>">
                                <div class="col-12 col-md-4">
                                    <div class="name bowlerInfo">
                                        <span class="title">Player name</span>
                                        <h4>
                                            <?php echo strtolower($player['name']);?>
                                        </h4>
                                    </div>
                                </div>
                                <div class="col-12 col-md-4">
                                    <div class="name bowlerInfo">
                                        <span class="title">Team name</span>
                                        <h4>
                                            <?php echo $player['team'];?>
                                        </h4>
                                    </div>
                                </div>
                                <div class="col-12 col-md-4">
                                    <div class="name bowlerInfo">
                                        <span class="title">ID #</span>
                                        <h4>
                                            <?php echo $player['bowlerid'];?>
                                        </h4>
                                    </div>
                                </div>
                            </div>

                            <div class="row stats <?php if ($i%2 == 0) { echo 'even'; } else { echo 'odd';}?>" id="stats<?php echo $i;?>">
                                <div class="col-12 col-md-12">
                                    <div class="bowlerStats">
                                        
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    <?php
                            $i++;
                            }
                        } elseif($bowlerTeam != '' ) {
                            $j = 1;
                            foreach ($dataFetched as $player) {
                    ?>
                        <div class="mainTeam">
                            <div class="team">
                                <div class="row teaminfo" id="team<?php echo $j;?>" data-team="<?php echo $player['teamname'];?>">
                                    <div class="col-12 col-md-3">
                                        <div class="name bowlerInfo">
                                            <span class="title">Team name</span>
                                            <h4>
                                                <?php echo $player['teamname'];?>
                                            </h4>
                                        </div>
                                    </div>
                                    <div class="col-12 col-md-3">
                                        <div class="name bowlerInfo">
                                            <span class="title">Division</span>
                                            <h4>
                                                <?php echo strtolower($player['division']);?>
                                            </h4>
                                        </div>
                                    </div>
                                    <div class="col-12 col-md-3">
                                        <div class="name bowlerInfo">
                                            <span class="title">Home House</span>
                                            <h4>
                                                <?php echo strtolower($player['homehouse']);?>
                                            </h4>
                                        </div>
                                    </div>
                                    <div class="col-12 col-md-3">
                                        <div class="name bowlerInfo">
                                            <span class="title">President</span>
                                            <h4>
                                                <?php echo strtolower($player['president']);?>
                                            </h4>
                                        </div>
                                    </div>
                                </div>

                                <div class="teamlist">
                                </div>

                                <!-- <div class="row info">
                                    <div class="col-12 col-md-12">
                                        <div class="bowlerNames">
                                            
                                            
                                        </div>
                                    </div>
                                </div> -->
                            </div>
                        </div>
                    <?php
                        $j++;
                            }
                        }
                    ?>
                            
                    </div>
                </div>
            </div>
        </div>

        <script src="js/jquery.js"></script>
        <script src="js/popper.js"></script>                             
        <script src="js/bootstrap.js"></script>

        <script>

        $(document).ready(function() {    
            $('.stats').hide();
        });

        var allGames;

        function toggleBStats() {
            var div = $(this);
            
            $('.bowlerStats').empty();

            var divNum = (div).attr("id");
            var bowlID = (div).attr("data-bowler");
            
            var bowlerBox = '#stats'+divNum+' .bowlerStats';

            var allGames;

            var formData = {
                'bowlID': bowlID
            };
            var enterAvg = 0;
            // process the form
            $.ajax({
                type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
                url         : 'ubaAvg.php', // the url where we want to POST
                data        : formData, // our data object
                dataType    : 'json', // what type of data do we expect back from the server
                encode      : true
            })
                // using the done promise callback
                .done(function(data) {
                    console.log(data);
                    var ubaAvg;
                    var enterAvg;

                    if(isNaN(data['ubaAvg'])){
                        ubaAvg = '-';
                    }else{
                        ubaAvg = parseFloat(data['ubaAvg'].toFixed(2));
                    }

                    if(isNaN(data['enterAvg'])){
                        enterAvg = '-';
                    }else{
                        enterAvg = parseFloat(data['enterAvg'].toFixed(2));
                    }

                    $(bowlerBox).empty();
                    $(bowlerBox).append('<ul class="headings season" data-bowler="'+bowlID+'" data-event="2017/18" id="uno"><li>17/18 Season Tour</li><li class="gameIcon"><span class="downBtn"><i class="fas fa-sort-down"></i></span><span class="upBtn"><i class="fas fa-sort-up"></i></span></li></ul>');
                    $(bowlerBox).append('<ul class="headings season" data-bowler="'+bowlID+'" data-event="2018/19" id="deux"><li>18/19 Season Tour</li><li class="gameIcon"><span class="downBtn"><i class="fas fa-sort-down"></i></span><span class="upBtn"><i class="fas fa-sort-up"></i></span></li></ul>');
                    $(bowlerBox).append('<ul class="headings events" data-bowler="'+bowlID+'" data-event="events" id="tre"><li>Events</li><li class="gameIcon"><span class="downBtn"><i class="fas fa-sort-down"></i></span><span class="upBtn"><i class="fas fa-sort-up"></i></span></li></ul>');
                    $(bowlerBox).append('<ul class="uba" data-bowler="'+bowlID+'"><li>UBA Average</li><li class="highlight">'+ubaAvg+'</li><li>Entering Avg</li><li>'+enterAvg+'</li></ul>');

                    allSeasonGames = Array.from(document.querySelectorAll('.season'));
                    allSeasonGames.forEach(team => team.addEventListener('click', toggleSStats));

                    allEventsGames = Array.from(document.querySelectorAll('.events'));
                    allEventsGames.forEach(team => team.addEventListener('click', toggleEStats));

            });

            function toggleSStats() {
                var div = $(this);
                var elID = div.attr('id');

                // var bowlerContentID = div.parent().parent().parent().attr('id');
                // var bowlerContentBox = '#'+bowlerContentID;
                // var bowlerContentDiv = bowlerContentBox + ' .season';

                // var downBtn = '#'+bowlerContentID+'.sessionActive .gameIcon .downBtn';
                // var upBtn = '#'+bowlerContentID+'.sessionActive .gameIcon .upBtn';

                if (div.hasClass( "sessionActive" )) {
                    var gamesEl = $('#'+elID+'.sessionActive .gamesList');
                    gamesEl.remove();
                    // $(downBtn).toggle();
                    // $(upBtn).toggle();
                    div.toggleClass('eventhighlight');
                    div.toggleClass('sessionActive');
                } else {
                    div.toggleClass('sessionActive');
                    var eventType = div.attr('data-event');
                    var formData = {
                        'eventType': eventType,
                        'bowlerID': bowlID
                    };                        
                
                    $.ajax({
                        type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
                        url         : 'games.php', // the url where we want to POST
                        data        : formData, // our data object
                        dataType    : 'json', // what type of data do we expect back from the server
                        encode      : true
                    })
                        // using the done promise callback
                        .done(function(data) {

                            // console.log(data);
                            var gamesEl = $('#'+elID+'.sessionActive .gamesList');
                            gamesEl.remove();

                            $(div).append('<div class="gamesList"></div>');
                            var gamesEl = '#'+elID+'.sessionActive .gamesList';
                            
                            if (data.length > 0) {
                                if (eventType == '2018/19') {
                                    console.log(data);
                                    $(gamesEl).append('<div class="games gamesHeading"><span>Tour Stop</span><span>Location</span><span>Team</span><span>Date</span><span>Game 1</span><span>Game 2</span><span>Game 3</span><span>Total</span></div>');
                                    for (let index = 0; index < data.length; index++) {
                                        $(gamesEl).append('<div class="games"><span>'+ data[index]['tourStop'] +'</span><span>'+ data[index]['location'] +'</span><span>'+ data[index]['team'] +'</span><span>'+ data[index]['eventDate'] +'</span><span>'+ data[index]['game 1'] +'</span><span>'+ data[index]['game 2'] +'</span><span>'+ data[index]['game 3'] +'</span><span>'+ data[index]['pinfall'] +'</span></div>');                            
                                    }    
                                } else {
                                    console.log(data);
                                    $(gamesEl).append('<div class="games gamesHeading"><span>Tour Stop</span><span>Location</span><span>Date</span><span>Game 1</span><span>Game 2</span><span>Game 3</span><span>Total</span></div>');
                                    for (let index = 0; index < data.length; index++) {
                                        $(gamesEl).append('<div class="games"><span>'+ data[index]['tourStop'] +'</span><span>'+ data[index]['location'] +'</span><span>'+ data[index]['eventDate'] +'</span><span>'+ data[index]['game 1'] +'</span><span>'+ data[index]['game 2'] +'</span><span>'+ data[index]['game 3'] +'</span><span>'+ data[index]['pinfall'] +'</span></div>');                            
                                    }
                                }
                            } else {
                                $(gamesEl).append('<div class="games"><span>No Data</span></div>');                                
                            }                          
                            

                            // $(downBtn).toggle();
                            // $(upBtn).toggle();
                            div.toggleClass('eventhighlight');


                    });
                }
            }


            function toggleEStats() {
                var div = $(this);
                var elID = div.attr('id');

                // var bowlerContentID = div.parent().parent().parent().attr('id');
                // var bowlerContentBox = '#'+bowlerContentID;
                // var bowlerContentDiv = bowlerContentBox + ' .events';
                // console.log(bowlerContentBox);

                // var downBtn = '#'+bowlerContentID+'.sessionActive .gameIcon .downBtn';
                // var upBtn = '#'+bowlerContentID+'.sessionActive .gameIcon .upBtn';

                if (div.hasClass( "sessionActive" )) {
                    var gamesEl = $('#'+elID+'.sessionActive .gamesList');
                    gamesEl.remove();
                    // $(downBtn).toggle();
                    // $(upBtn).toggle();
                    div.toggleClass('eventhighlight');
                    div.toggleClass('sessionActive');
                } else {
                    div.addClass('sessionActive');
                    var eventType = div.attr('data-event');
                    var formData = {
                        'eventType': eventType,
                        'bowlerID': bowlID
                    };                        
                
                    $.ajax({
                        type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
                        url         : 'games.php', // the url where we want to POST
                        data        : formData, // our data object
                        dataType    : 'json', // what type of data do we expect back from the server
                        encode      : true
                    })
                        // using the done promise callback
                        .done(function(data) {

                            // console.log(data);
                            var gamesEl = $('#'+elID+'.sessionActive .gamesList');
                            gamesEl.remove();

                            $(div).append('<div class="gamesList"></div>');
                            var gamesEl = '#'+elID+'.sessionActive .gamesList';

                            if (data.length > 0) {
                                $(gamesEl).append('<div class="games gamesHeading"><span>Tournament</span><span>Date</span><span>Game 1</span><span>Game 2</span><span>Game 3</span><span>Game 4</span><span>Game 5</span><span>Total</span></div>');
                            
                                for (let index = 0; index < data.length; index++) {
                                    $(gamesEl).append('<div class="games"><span>'+ data[index]['event'] +'</span><span>'+ data[index]['eventDate'] +'</span><span>'+ data[index]['game 1'] +'</span><span>'+ data[index]['game 2'] +'</span><span>'+ data[index]['game 3'] +'</span><span>'+ data[index]['game 4'] +'</span><span>'+ data[index]['game 5'] +'</span><span>'+ data[index]['pinfall'] +'</span></div>');                            
                                }
                            } else {
                                $(gamesEl).append('<div class="games"><span>No Data</span></div>');                                
                            }

                            
                            
                            

                            // $(downBtn).toggle();
                            // $(upBtn).toggle();
                            div.toggleClass('eventhighlight');


                    });
                }
            }
            

            // $(".bowlerStats").on('click','.season',function(){
            //     var div = $(this);

            //     var downBtn = '.sessionActive .gameIcon .downBtn';
            //     var upBtn = '.sessionActive .gameIcon .upBtn';

            //     if ($(div).hasClass( "sessionActive" )) {
            //         var gamesEl = $('.sessionActive .gamesList');
            //         gamesEl.remove();
            //         $(downBtn).toggle();
            //         $(upBtn).toggle();
            //         $('.sessionActive').toggleClass('eventhighlight');
            //         div.removeClass('sessionActive');
            //     } else {
            //         div.addClass('sessionActive');
            //         var eventType = div.attr('data-event');
            //         var formData = {
            //             'eventType': eventType,
            //             'bowlerID': bowlID
            //         };                        
                
            //         $.ajax({
            //             type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
            //             url         : 'games.php', // the url where we want to POST
            //             data        : formData, // our data object
            //             dataType    : 'json', // what type of data do we expect back from the server
            //             encode      : true
            //         })
            //             // using the done promise callback
            //             .done(function(data) {

            //                 // console.log(data);
            //                 var gamesEl = $('.sessionActive .gamesList');
            //                 gamesEl.remove();

            //                 $(div).append('<div class="gamesList"></div>');
            //                 var gamesEl = $('.sessionActive .gamesList');

            //                 if (eventType == '2018/19') {
            //                     $(gamesEl).append('<div class="games gamesHeading"><span>Tour Stop</span><span>Location</span><span>Team</span><span>Date</span><span>Game 1</span><span>Game 2</span><span>Game 3</span><span>Total</span></div>');
            //                     for (let index = 0; index < data.length; index++) {
            //                         $(gamesEl).append('<div class="games"><span>'+ data[index]['tourStop'] +'</span><span>'+ data[index]['location'] +'</span><span>'+ data[index]['team'] +'</span><span>'+ data[index]['eventDate'] +'</span><span>'+ data[index]['game 1'] +'</span><span>'+ data[index]['game 2'] +'</span><span>'+ data[index]['game 3'] +'</span><span>'+ data[index]['pinfall'] +'</span></div>');                            
            //                     }    
            //                 } else {
            //                     $(gamesEl).append('<div class="games gamesHeading"><span>Tour Stop</span><span>Location</span><span>Date</span><span>Game 1</span><span>Game 2</span><span>Game 3</span><span>Total</span></div>');
            //                     for (let index = 0; index < data.length; index++) {
            //                         $(gamesEl).append('<div class="games"><span>'+ data[index]['tourStop'] +'</span><span>'+ data[index]['location'] +'</span><span>'+ data[index]['eventDate'] +'</span><span>'+ data[index]['game 1'] +'</span><span>'+ data[index]['game 2'] +'</span><span>'+ data[index]['game 3'] +'</span><span>'+ data[index]['pinfall'] +'</span></div>');                            
            //                     }
            //                 }
                            
                            

            //                 $(downBtn).toggle();
            //                 $(upBtn).toggle();
            //                 $('.sessionActive').toggleClass('eventhighlight');


            //         });
            //     }

            // });

                    
            // var eventState = false;
            // $(".bowlerStats").on('click','.events',function(){
            //     var div = $(this);
            //     var eventType = div.attr('data-event');
            //     var formData = {
            //         'eventType': eventType,
            //         'bowlerID': bowlID
            //     };

            //     var downBtn = '.events .gameIcon .downBtn';
            //     var upBtn = '.events .gameIcon .upBtn';
                
            //     if (eventState == false) {
            //         $.ajax({
            //             type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
            //             url         : 'games.php', // the url where we want to POST
            //             data        : formData, // our data object
            //             dataType    : 'json', // what type of data do we expect back from the server
            //             encode      : true
            //         })
            //             // using the done promise callback
            //             .done(function(data) {
            //                 var gamesEl = $('.events .gamesList');
            //                 gamesEl.remove();

            //                 $(div).append('<div class="gamesList"></div>');
            //                 var gamesEl = $('.events .gamesList');
                            
            //                 $(gamesEl).append('<div class="games gamesHeading"><span>Tournament</span><span>Date</span><span>Game 1</span><span>Game 2</span><span>Game 3</span><span>Game 4</span><span>Game 5</span><span>Total</span></div>');
            //                 for (let index = 0; index < data.length; index++) {
            //                     $(gamesEl).append('<div class="games"><span>'+ data[index]['event'] +'</span><span>'+ data[index]['eventDate'] +'</span><span>'+ data[index]['game 1'] +'</span><span>'+ data[index]['game 2'] +'</span><span>'+ data[index]['game 3'] +'</span><span>'+ data[index]['game 4'] +'</span><span>'+ data[index]['game 5'] +'</span><span>'+ data[index]['pinfall'] +'</span></div>');                            
            //                 }

            //                 $(downBtn).toggle();
            //                 $(upBtn).toggle();
            //                 $('.events').toggleClass('eventhighlight');

            //                 eventState = true;

            //         });
            //     } else {
            //         var gamesEl = $('.events .gamesList');
            //         gamesEl.remove();
            //         $(downBtn).toggle();
            //         $(upBtn).toggle();
            //         $('.events').toggleClass('eventhighlight');
            //         eventState = false;
            //     }
            // });

            var target = '#stats'+divNum;
            $(target).toggle();

        }

        function toggleTStats() {
            var div = $(this);
            var divNum = (div).attr("id");
            var teamID = (div).attr("data-team");
            var formData = {
                'teamID': teamID
            };

            // process the form
            $.ajax({
                type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
                url         : 'team.php', // the url where we want to POST
                data        : formData, // our data object
                dataType    : 'json', // what type of data do we expect back from the server
                encode      : true
            })
                // using the done promise callback
                .done(function(data) {
                
                    $('.teamlist').empty();
                    
                    var j = 1;

                    for (let index = 0; index < data.length; index++) {

                        var bowlerName = data[index]['name'];
                        var teamName = data[index]['team'];
                        var bowlerID = data[index]['bowlerID'];

                        var style;
                        if (j%2 == 0) {
                            style = 'even';
                        } else {
                            style = 'odd';
                        }


                        var boxID = '#'+j;
                        var indBox = '.player'+j;
                        

                        $('.teamlist').append('<div class="singlePlayer player'+j+'"><div class="row info deets" id="'+j+'" data-bowler="'+bowlerID+'"></div></div>');

                        $(boxID).append('<div class="col-12 col-md-6"><div class="name bowlerInfo"><span class="title">Player name</span><h4>'+bowlerName.toLowerCase()+'</h4></div></div>');
                        $(boxID).append('<div class="col-12 col-md-3"><div class="name bowlerInfo"><span class="title">Team name</span><h4>'+teamName+'</h4></div></div>');
                        $(boxID).append('<div class="col-12 col-md-3"><div class="name bowlerInfo"><span class="title">ID #</span><h4>'+bowlerID+'</h4></div></div>');
                        $(indBox).append('<div class="row stats '+style+'" id="stats'+j+'"><div class="col-12 col-md-12"><div class="bowlerStats"></div></div></div>');
                        
                        j += 1;
                        
                    }        
                });


            // var target = '#'+divNum;
            $('.teamlist').toggle();

            $('.teamlist').on('click', '.deets', toggleBStats);
            
        }

        var allBowlers = Array.from(document.querySelectorAll('.info'));
        allBowlers.forEach(bowler => bowler.addEventListener('click', toggleBStats));

        // console.log(allBowlers);

        var allTeams = Array.from(document.querySelectorAll('.teaminfo'));
        allTeams.forEach(team => team.addEventListener('click', toggleTStats));
        
        </script>

    </body>

    </html>