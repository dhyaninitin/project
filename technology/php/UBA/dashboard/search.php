<?php
    include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

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
            $sql = $db->prepare("SELECT * FROM `currentroster` WHERE `$column` LIKE '%$searchTerm%' ORDER BY name ASC  ");
            $sql->execute();
        } else {
            $searchTerm = $bowlerTeam;
            $column = 'teamname';
            $sql = $db->prepare("SELECT * FROM `teams` WHERE `$column` LIKE '%$searchTerm%' ORDER by teamname ASC ");
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
        <link rel="stylesheet" type="text/css" media="screen" href="../css/bootstrap.min.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="../css/animate.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="css/styleTwo.css" />
        <link rel="icon" href="<?=$base_url?>images/favicon.ico" type="image/x-icon" />
    
    <style>
        .eventgamesList .games.gamesHeading {
            background: #00121c !important;
            border-bottom: 2px solid white;
            border-top: 2px solid white;
        }
        .games.odd {
            background: #525252;
        }
        /*.card-header{*/
        /*  border: 1px solid white;    */
        /*}*/
        div#deux {
            background:#002335;
        }
        div#tre {
            background:#002335;
        }
        
        div#deux:hover {
          background: #00121C;
          border: 1px solid white;
        }
        div#tre:hover {
            background:#00121C;
            border: 1px solid white;
        }
        
        [data-toggle="collapse"] .fa:before {  
          content: "\f13a";
        }
        
        [data-toggle="collapse"].collapsed .fa:before {
            content: "\f139";
          
        }
        
        table {
          border-collapse: collapse;
          border-spacing: 0;
          width: 100%;
          border: 1px solid #ddd;
        }
        
        th, td {
          text-align: center;
          padding: 8px;
        }
        
        .games.gamesHeading {
            overflow-x: auto;
        }
        
        .table-striped tbody tr:nth-of-type(odd){
            background: #343434 !important;
        }
        
        tr.session.evenn {
            background: #525252;
        }
        
        .sesson-year{
            padding: 6px;
            padding-left: 30px;
        }
        
        select#cars {
            padding: 6px;
        }
        .session-button{
            padding: 3px 10px;
            background: #E6E6E6;
        }
        .loader{
			width: 55px;
			height: 51px;
        }
        

    </style>
    </head>

    <body>

        <header>
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        <div class="register">
                            <a href="home.php">Dashboard</a>
                        </div>
                        <div class="logo">
                            <img src="<?=$base_url;?>/images/UBA_logo.png" alt="UBA Logo">
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
                    <form action="" method="POST">
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

                    <?php if ($bowlerName != '') {
                        $i = 1;
                        // $dataFetched = ksort($dataFetched);
							foreach ($dataFetched as $player) { ?>
							
                         <div class="singlePlayer">
                            <div class="row info" id="<?php echo $i;?>" data-bowler="<?php echo $player['bowlerid'];?>">
                                <div class="col-12 col-md-3">
                                    <div class="name bowlerInfo">
                                        <span class="title">Player name</span>
                                        <h4>
                                            <?php echo strtolower($player['name']);?>
                                        </h4>
                                    </div>
                                </div>
                                <div class="col-12 col-md-3">
                                    <div class="name bowlerInfo">
                                        <span class="title">Nickname</span>
                                        <h4>
                                            <?php echo $player['nickname1'];?>
                                        </h4>
                                    </div>
                                </div>
                                <div class="col-12 col-md-3">
                                    <div class="name bowlerInfo">
                                        <span class="title">Team name</span>
                                        <h4>
                                            <?php echo $player['team'];?>
                                        </h4>
                                    </div>
                                </div>
                                <div class="col-12 col-md-3">
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

        <script src="../js/jquery.js"></script>
        <script src="../js/popper.js"></script>                             
        <script src="../js/bootstrap.js"></script>

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
            
            var bowlerBox = '#stats'+divNum+' .bowlerStats ';

            var allGames;

            var formData = {
                'bowlID': bowlID
            };
            var enterAvg = 0;
            // process the form
            $.ajax({
                type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
                url         : '<?=$base_url?>/dashboard/ubaAvg.php', // the url where we want to POST
                data        : formData, // our data object
                dataType    : 'json', // what type of data do we expect back from the server
                encode      : true
            })
                // using the done promise callback
                .done(function(data) {
                    // console.log(data);
                    var ubaAvg;
                    var enterAvg;
                    var stAvg;

                    if(isNaN(data['ubaAvg'])){
                        ubaAvg = '-';
                    }else{
                        ubaAvg = data['ubaAvg'];
                    }

                    if(isNaN(data['enterAvg'])){
                        enterAvg = '-';
                    }else{
                        enterAvg = data['enterAvg'];
                    }
                    if(isNaN(data['stAvg'])){
                        stAvg = '-';
                    }else{
                        stAvg = data['stAvg'];
                    }
                    
                    
                    
                    $(bowlerBox).empty();
                    $('.showubaavrg').hide();
                    $(bowlerBox).append(`<div class="card-header season" data-bowler="`+bowlID+`" data-event="2018/19" id="deux" class="btn btn-link" data-toggle="collapse" data-target="#collapseOne" 
                    aria-expanded="true" aria-controls="collapseOne">
                      <h5 class="mb-0 text-center"> Season Tour  <i class="fa float-right" aria-hidden="true"></i> </h5>  </div>
                    <div id="collapseOne" class="collapse " aria-labelledby="deux" data-parent="#accordion">
                      <div class="gamesList">
                      
                      </div>
                    </div>`);
                  
                  $(bowlerBox).append(`<div class="card-header events" id="tre" class="btn btn-link collapsed" data-bowler="`+bowlID+`" data-event="events"  data-toggle="collapse" data-target="#collapseTwo" 
                    aria-expanded="false" aria-controls="collapseTwo">
                      <h5 class="mb-0 text-center"> Events  <i class="fa float-right" aria-hidden="true"> </i></h5> 
                    </div>
                    <div id="collapseTwo" class="collapse" aria-labelledby="tre" data-parent="#accordion">
                        <div class="eventgamesList">
                        
                        </div>
                    </div>`);
                    
                    // $(bowlerBox).append('<ul class="headings season" data-bowler="'+bowlID+'" data-event="2018/19" id="deux"><li> Season Tour</li><li class="gameIcon"><span class="downBtn"><i class="fas fa-sort-down"></i></span><span class="upBtn"><i class="fas fa-sort-up"></i></span></li></ul>');
                    // // $(bowlerBox).append('<ul class="headings season" data-bowler="'+bowlID+'" data-event="2019/20" id="deux"><li>19/20 Season Tour</li><li class="gameIcon"><span class="downBtn"><i class="fas fa-sort-down"></i></span><span class="upBtn"><i class="fas fa-sort-up"></i></span></li></ul>');
                    // $(bowlerBox).append('<ul class="headings events" data-bowler="'+bowlID+'" data-event="events" id="tre"><li>Events</li><li class="gameIcon"><span class="downBtn"><i class="fas fa-sort-down"></i></span><span class="upBtn"><i class="fas fa-sort-up"></i></span></li></ul>');
						
					var sessionAvrgData = data['sessionAvrg'];
					var crntYear = new Date().getFullYear(); var nextYear = new Date().getFullYear()+1;
					var sectValue1 = new Date('09/'+'01'+ '/' + crntYear); var sectValue2 = new Date('09/'+'01'+ '/' + nextYear); 
					var totalval = 0; var sessgameCount = []; var nidexx = 1; var avrg = '';
					
                        for (let index = 0; index < sessionAvrgData.length; index++) {
                        	
                        	var checkDate = new Date(sessionAvrgData[index]['eventDate']);
	                        if ((checkDate <= sectValue2) && (checkDate >=  sectValue1)){
		                        if(sessionAvrgData[index]['game 1'] > 1 ){
		                    		sessgameCount.push(sessionAvrgData[index]['game 1']);
		                    	}
		                    	if(sessionAvrgData[index]['game 2'] > 1 ){
		                    		sessgameCount.push(sessionAvrgData[index]['game 2']);
		                    	}
		                    	
		                    	if(sessionAvrgData[index]['game 3'] > 1 ){
		                    		sessgameCount.push(sessionAvrgData[index]['game 3']);
		                    	}
				            		totalval = parseInt(totalval) + parseInt(sessionAvrgData[index]['pinfall']);
				            		// console.log('sessgameCount',sessgameCount);
				            		if(sessgameCount.length >= 9){
				            			avrg = totalval/sessgameCount.length;
				            			// ubaAvg = ubaAvg;
				            		}
				            }
                        
                        }
                        // console.log('on length',data['eventAvrg']);
                        // console.log('avrg',avrg);
       //                 if(avrg == ''){
       //                 	avrg = 0;
							// ubaAvg = '0.00';
       //                 }
       
       //console.log('sectValue1',sectValue1);
                        
                        
                        var evnetAvrgData = data['eventAvrg'];
                         var eventgameCount = []; var y = 1; 
                        for (let y = 0; y < evnetAvrgData.length; y++) {
                            
		                        if(evnetAvrgData[y]['game 1'] > 1 ){
		                    		eventgameCount.push(evnetAvrgData[y]['game 1']);
		                    	}
		                    	if(evnetAvrgData[y]['game 2'] > 1 ){
		                    		eventgameCount.push(evnetAvrgData[y]['game 2']);
		                    	}
		                    	
		                    	if(evnetAvrgData[y]['game 3'] > 1 ){
		                    		eventgameCount.push(evnetAvrgData[y]['game 3']);
		                    	}
		                    	if(evnetAvrgData[y]['game 4'] > 1 ){
		                    		eventgameCount.push(evnetAvrgData[y]['game 4']);
		                    	}
		                    	if(evnetAvrgData[y]['game 5'] > 1 ){
		                    		eventgameCount.push(evnetAvrgData[y]['game 4']);
		                    	}
		                    
                        }
                        
                //         	if(eventgameCount.length >= 09){
		            		// 	ubaAvg = ubaAvg;
		            		// }else{
		            		// 	ubaAvg = '0.00';
		            		// }
                        
                        // console.log('eventgamelength',eventgameCount.length);
                        // console.log('sessgameCount',sessgameCount.length);
                        var totelLength = eventgameCount.length + sessgameCount.length;
                        
                        // console.log('totelLength',totelLength);
                        
                        if(totelLength >= 9){
                        	// console.log('innn');
                        	ubaAvg = ubaAvg;
                        }else{
                        	ubaAvg = '0.00';
                        	// console.log('out');
                        }
                        
                        // if(eventgameCount.length >= 9 || sessgameCount.length >= 9 ){
                        // 	// console.log('innn');
                        // 	ubaAvg = ubaAvg;
                        // }else{
                        // 	ubaAvg = '0.00';
                        // 	// console.log('out');
                        // }
                        
                         if(avrg == ''){
                        	avrg = 0;
							// ubaAvg = '0.00';
                        }
                        
                        // console.log('avrg',avrg);
                        
                    if (ubaAvg > enterAvg) {
                        $(bowlerBox).append('<ul class="uba" data-bowler="'+bowlID+'"><li>UBA Average</li><li class="highlight">'+ubaAvg+'</li><li>Entering Avg</li><li>'+enterAvg+'</li><li>Season Tour Avg</li><li> <span class="original">'+avrg.toFixed(2)+'</span><span class="fillterAvg"></span></li></ul>');
                    } else {
                        $(bowlerBox).append('<ul class="uba" data-bowler="'+bowlID+'"><li>UBA Average</li><li>'+ubaAvg+'</li><li class="highlight">Entering Avg</li><li>'+enterAvg+'</li><li>Season Tour Avg</li><li> <span class="original">'+avrg.toFixed(2)+'</span><span class="fillterAvg"></span></li></ul>');
                    }
                    

                    allSeasonGames = Array.from(document.querySelectorAll('.season'));
                    allSeasonGames.forEach(team => team.addEventListener('click', toggleSStats));

                    allEventsGames = Array.from(document.querySelectorAll('.events'));
                    allEventsGames.forEach(team => team.addEventListener('click', toggleEStats));

            });
            
           
            
        

            function toggleSStats() {
                var div = $(this);
                var elID = div.attr('id');
                var type = 'session';
                 var eventType = div.attr('data-event');
                    var formData = {
                        'eventType': eventType,
                        'bowlerID': bowlID,
                        'sessionType':type 
                    };  
                    
                    $.ajax({
                        type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
                        url         : '<?=$base_url?>/dashboard/games.php', // the url where we want to POST
                        data        : formData, // our data object
                        dataType    : 'json', // what type of data do we expect back from the server
                        encode      : true
                    })  
                    .done(function(data) {
                        // console.log('dasddasdsa',data);
                        if (data.length > 0) {
                            var all_session = '';
                             all_session += `<div class="games gamesHeading">
                             <div class="sesson-year"><label for="cars">Please select the year:</label>
	                              <select name="cars" id="cars" >
	                                <option value="allSession">All Session</option>
	                                <option value="2021/22">2021/22</option>
	                                <option value="2020/21">2020/21</option>
	                                <option value="2019/20">2019/20</option>
	                                <option value="2018/19">2018/19</option>
	                              </select> 
	                              <input type="button" value="Submit" onclick="myyear('`+bowlID+`','cars')" />
                               </div>
                             
                             <table class="table table-striped" id="sessionTable" >
                            <thead><tr><th>Sn No</th><th>Tour Stop</th><th>Location</th><th>Team</th><th>Date</th><th>Game 1</th><th>Game 2</th>
                            <th>Game 3</th><th>Total</th></tr></thead><tbody>`;
                                var nidexx = 1;
                                data = data.sort().reverse();
                                for (let index = 0; index < data.length; index++) {
                                    var tdlist ='';
                                    if(nidexx <= 9){ var numbrrr = '0'+nidexx;}else{ var numbrrr = nidexx;}
                                    if(numbrrr % 2 == 0) { tdlist = 'evenn';}else{ tdlist = 'oddd'; }
                                    all_session += `<tr class="session `+tdlist+`"><td>`+numbrrr+`</td><td>`+data[index]['tourStop']+`</td><td>`+data[index]['location']+`</td>
                                    <td>`+data[index]['team']+`</td><td>`+data[index]['eventDate']+`</td>
                                    <td>`+data[index]['game 1']+`</td><td>`+data[index]['game 2']+`</td>
                                    <td>`+data[index]['game 3']+`</td><td>`+data[index]['pinfall']+`</td></tr>`;    
                                    nidexx ++;
                                }    
                            all_session += `</tbody></table></div>`;
                            
                            $('.gamesList').html(all_session);
                            
                        }else {
                            $('.gamesList').html(`<div class="games gamesHeading"><table class="table table-striped "><tbody>
                            <tr class="odd"><td valign="top" colspan="9" style="font-size: 17px;font-weight: bold;text-align: center">
                            No  Data </td></tr></tbody></table></div>`);
                        } 
                    
                    });
                
                
                    
            
            }
            
          
            
            function toggleEStats() {
                var div = $(this);
                var elID = div.attr('id');
                
                var eventType = div.attr('data-event');
                    var formData = {
                        'eventType': eventType,
                        'bowlerID': bowlID
                    };
                 
                    $.ajax({
                        type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
                        url         : '<?=$base_url?>/dashboard/games.php', // the url where we want to POST
                        data        : formData, // our data object
                        dataType    : 'json', // what type of data do we expect back from the server
                        encode      : true
                    })
                    
                    .done(function(data) {
                        
                        if (data.length > 0) {
                            
                            var all_event = '';
                                all_event += `<div class="games gamesHeading"><table class="table table-striped ">
                                <thead><tr><th>Sn No</th><th style="width: 27%;">Tournament</th><th>Date</th><th>Game 1</th><th>Game 2</th>
                                <th>Game 3</th><th>Game 4</th> <th>Game 5</th><th>Total</th></tr></thead><tbody>`;
                                
                                
                            var evntnumm = 1;
                            for (let index = 0; index < data.length; index++) {
                                var evntlist ='';
                                if(evntnumm < 9){ var enumbrrr = '0'+evntnumm;}else{ var enumbrrr = evntnumm;}
                                if(evntnumm % 2 == 0) { tdlist = 'evenn';}else{ tdlist = 'oddd'; }
                                
                                    all_event += `<tr class="session `+tdlist+`"><td>`+enumbrrr+`</td><td>`+data[index]['event']+`</td>
                                    <td>`+data[index]['eventDate']+`</td>
                                    <td>`+data[index]['game 1']+`</td><td>`+data[index]['game 2']+`</td>
                                    <td>`+data[index]['game 3']+`</td><td>`+data[index]['game 4']+`</td>
                                    <td>`+data[index]['game 5']+`</td><td>`+data[index]['pinfall']+`</td></tr>`;
                                evntnumm++;                     
                            }
                            all_event += `</tbody></table></div>`;
                            
                            $('.eventgamesList').html(all_event);
                            
                        } else {
                            
                            $('.eventgamesList').html(`<div class="games gamesHeading"><table class="table table-striped "><tbody>
                            <tr class="odd"><td valign="top" colspan="9" style="font-size: 17px;font-weight: bold;text-align: center">
                            No  Data </td></tr> </tbody></table></div>`);                            
                        }

                    });
            }    
            
            
            
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
                url         : '<?=$base_url?>/dashboard/team.php', // the url where we want to POST
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
                        var nickname = data[index]['nickname'];

                        var style;
                        if (j%2 == 0) {
                            style = 'even';
                        } else {
                            style = 'odd';
                        }

                        var boxID = '#'+j;
                        var indBox = '.player'+j;
                        
                        $('.teamlist').append('<div class="singlePlayer player'+j+'"><div class="row info deets" id="'+j+'" data-bowler="'+bowlerID+'"></div></div>');

                        $(boxID).append('<div class="col-12 col-md-3"><div class="name bowlerInfo"><span class="title">Player name</span><h4>'+bowlerName.toLowerCase()+'</h4></div></div>');
                        $(boxID).append('<div class="col-12 col-md-3"><div class="name bowlerInfo"><span class="title">Nickname</span><h4>'+nickname+'</h4></div></div>');
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
        
        
        
        
        
        function myyear(bowlerid,selectval){
        	
        	$('#sessionTable tbody').html(`<tr class="odd loderclose"><td valign="top" colspan="9" style="font-size: 17px;font-weight: bold;text-align: center">
                    <img src="<?=$base_url?>/images/loading-screen-loading.gif" class="loader alt="loder"> </td></tr>`);
                 
                 //console.log('bowlerid',bowlerid);   
            // alert(bowlerid);
            var selectval = $('#'+selectval).val();
             var formData = {
                'eventType': selectval,
                'bowlerID': bowlerid,
                'sessionType':'sessionFilter' 
            };
            
            $.ajax({
                type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
                url         : '<?=$base_url?>/dashboard/games.php', // the url where we want to POST
                data        : formData, // our data object
                dataType    : 'json', // what type of data do we expect back from the server
                encode      : true
            }) 
            .done(function(data) {
                $('.loderclose').hide();
                var crntYear = selectval.split('/'); var crntMonth = (new Date()).getMonth();
					
					// if(data.length >= 5){
					// 	// console.log('big');
					// 	$('.original').show();
					// 	$('.fillterAvg').hide();
					// }else{
					// 	$('.original').hide();
					// 	$('.fillterAvg').show();
					// 	$('.fillterAvg').html('0.00');
					// 	// console.log('small');
					// }
					
                if (data.length > 0) {
                	// console.log('selectval',selectval);
                	if(selectval == 'allSession'){
                		
						var all_session = '';var nidexx = 1; var totalval = 0; var avrg = '';
						var gameCount = [];
						data = data.sort().reverse();
                        for (let index = 0; index < data.length; index++) {
                        	
                        	var checkDate = new Date(data[index]['eventDate']);
                        	
                        	var crntYear = new Date().getFullYear(); var nextYear = new Date().getFullYear()+1;
							var sectValue1 = new Date('09/'+'01'+ '/' + crntYear); var sectValue2 = new Date('09/'+'01'+ '/' + nextYear); 
								if ((checkDate <= sectValue2) && (checkDate >=  sectValue1)){
									if(data[index]['game 1'] > 1 ){
		                        		gameCount.push(data[index]['game 1']);
		                        	}
		                        	if(data[index]['game 2'] > 1 ){
		                        		gameCount.push(data[index]['game 1']);
		                        	}
		                        	
		                        	if(data[index]['game 3'] > 1 ){
		                        		gameCount.push(data[index]['game 1']);
		                        	}
		                        	
			                        	totalval = parseInt(totalval) + parseInt(data[index]['pinfall']);
			                        	if(gameCount.length >= 9){
			                        		avrg = totalval/gameCount.length;
			                        	}else{
			                        		avrg = 0;
			                        	}
								}  	
								
								
								
                            var tdlist ='';
                            if(nidexx < 9){ var numbrrr = '0'+nidexx;}else{ var numbrrr = nidexx;}
                            if(numbrrr % 2 == 0) { tdlist = 'evenn';}else{ tdlist = 'oddd'; }
                            all_session += `<tr class="session `+tdlist+`"><td>`+numbrrr+`</td><td>`+data[index]['tourStop']+`</td><td>`+data[index]['location']+`</td>
                            <td>`+data[index]['team']+`</td><td>`+data[index]['eventDate']+`</td>
                            <td>`+data[index]['game 1']+`</td><td>`+data[index]['game 2']+`</td>
                            <td>`+data[index]['game 3']+`</td><td>`+data[index]['pinfall']+`</td></tr>`;    
                            nidexx ++; 
                        }
                        $('.original').html(avrg.toFixed(2));
                        $('.original').show();
						$('.fillterAvg').hide();
                        
                        
                	}else{
                		
                		
                		var all_session = '';var nidexx = 1;
					var sectValue1 = new Date('09/'+'01'+ '/' + crntYear[0]);
					var sectValue2 = new Date('09/'+'01'+ '/' + crntYear[1]);
						var gameCount = [];  var totalval = 0; var avrg = '';
						data = data.sort().reverse();
                        for (let index = 0; index < data.length; index++) {
                        		// totalval.push(data[index]['pinfall']);
                        		
                        	if(data[index]['game 1'] > 1 ){
                        		gameCount.push(data[index]['game 1']);
                        	}
                        	if(data[index]['game 2'] > 1 ){
                        		gameCount.push(data[index]['game 1']);
                        	}
                        	
                        	if(data[index]['game 3'] > 1 ){
                        		gameCount.push(data[index]['game 1']);
                        	}
                        	
                        	totalval = parseInt(totalval) + parseInt(data[index]['pinfall']);
                        	// console.log('lenth',data.length);
                        	
                        	var checkDate = new Date(data[index]['eventDate']);
                        	
                        	if ((checkDate <= sectValue2) && (checkDate >=  sectValue1)){
                        		
                        		if(gameCount.length >= 9){
                        				// console.log('gamelenth',gameCount.length);
                        			avrg = totalval/gameCount.length;
                        		// console.log('avrg',avrg);
                        	
                        			
                        			$('.original').html(avrg.toFixed(2));
                        			$('.original').show();
                        			$('.fillterAvg').hide();	
                        		}else{
                        			$('.original').hide();
                        			$('.fillterAvg').html('0.00');
                        			$('.fillterAvg').show();	
                        		}
                        		
                        	}else{
								$('.original').hide();
								$('.fillterAvg').html('0.00');
								$('.fillterAvg').show();
                        	}
                        	
                        	
                    		var tdlist ='';
	                            if(nidexx < 9){ var numbrrr = '0'+nidexx;}else{ var numbrrr = nidexx;}
	                            if(numbrrr % 2 == 0) { tdlist = 'evenn';}else{ tdlist = 'oddd'; }
	                            all_session += `<tr class="session `+tdlist+`"><td>`+numbrrr+`</td><td>`+data[index]['tourStop']+`</td><td>`+data[index]['location']+`</td>
	                            <td>`+data[index]['team']+`</td><td>`+data[index]['eventDate']+`</td>
	                            <td>`+data[index]['game 1']+`</td><td>`+data[index]['game 2']+`</td>
	                            <td>`+data[index]['game 3']+`</td><td>`+data[index]['pinfall']+`</td></tr>`;    
	                            nidexx ++;
                        	
                        }
                		
                	}
                	
                    $('#sessionTable tbody').html(all_session);
                    
                } else {
                	
					$('.original').hide();
					$('.fillterAvg').html('0.00');
					$('.fillterAvg').show();

                    $('#sessionTable tbody').html(`<tr class="odd"><td valign="top" colspan="9" style="font-size: 17px;font-weight: bold;text-align: center">
                    No  Data </td></tr>`);
                }
                
                
            
            }); 
            
            
        }
        
        
        </script>

    </body>

    </html>