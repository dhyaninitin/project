$(function () {
            $("#datepicker").datepicker();

            var team = [];
            var teamList = [];

            fetchTeams();

            var teamCount = 1;
            var bowlerCount = 0;

            $('#teams').change(function(event){
                var teamSel = $( "#teams option:selected" ).val();

                var formData = {
                    'teamname': teamSel
                };
                    
                $.ajax({
                type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
                url         : 'fetchbowler.php', // the url where we want to POST
                data        : formData, // our data object
                dataType    : 'json', // what type of data do we expect back from the server
                encode      : true
                })
                // using the done promise callback
                .done(function(data) {
                        team = data;

                        $("#sb1").empty(); 
                        $("#sb2").empty(); 
                        $("#sb3").empty(); 
                        $("#h1b1").empty(); 
                        $("#h1b2").empty(); 
                        $("#h1b3").empty(); 
                        $("#h2b1").empty(); 
                        $("#h2b2").empty(); 
                        $("#h2b3").empty();
                        $("#sub").empty();
                        
                        $("#sb1").append('<option value="-" selected disabled>-</option>');
                        $("#sb2").append('<option value="-" selected disabled>-</option>');
                        $("#sb3").append('<option value="-" selected disabled>-</option>');
                        $("#h1b1").append('<option value="-" selected disabled>-</option>');
                        $("#h1b2").append('<option value="-" selected disabled>-</option>');
                        $("#h1b3").append('<option value="-" selected disabled>-</option>');
                        $("#h2b1").append('<option value="-" selected disabled>-</option>');
                        $("#h2b2").append('<option value="-" selected disabled>-</option>');
                        $("#h2b3").append('<option value="-" selected disabled>-</option>');
                        $("#sub").append('<option value="-" selected disabled>-</option>');

                    data.forEach(bowler => {

                        $("#sb1").append('<option value="'+bowler['name']+'/'+bowler['bowlerid']+'">'+bowler['name']+'</option>'); 
                        $("#sb2").append('<option value="'+bowler['name']+'/'+bowler['bowlerid']+'">'+bowler['name']+'</option>'); 
                        $("#sb3").append('<option value="'+bowler['name']+'/'+bowler['bowlerid']+'">'+bowler['name']+'</option>'); 
                        $("#h1b1").append('<option value="'+bowler['name']+'/'+bowler['bowlerid']+'">'+bowler['name']+'</option>'); 
                        $("#h1b2").append('<option value="'+bowler['name']+'/'+bowler['bowlerid']+'">'+bowler['name']+'</option>'); 
                        $("#h1b3").append('<option value="'+bowler['name']+'/'+bowler['bowlerid']+'">'+bowler['name']+'</option>'); 
                        $("#h2b1").append('<option value="'+bowler['name']+'/'+bowler['bowlerid']+'">'+bowler['name']+'</option>'); 
                        $("#h2b2").append('<option value="'+bowler['name']+'/'+bowler['bowlerid']+'">'+bowler['name']+'</option>'); 
                        $("#h2b3").append('<option value="'+bowler['name']+'/'+bowler['bowlerid']+'">'+bowler['name']+'</option>'); 
                        $("#sub").append('<option value="'+bowler['name']+'/'+bowler['bowlerid']+'">'+bowler['name']+'</option>'); 
                    });
                });
            });

            function seriesTotal(z, noOfGames) {
                $('.'+z+'g').keyup(function(e) {
                    if (noOfGames == 4) {
                        var totalScore = parseInt($('#'+z+'g1').val()) + parseInt($('#'+z+'g2').val()) + parseInt($('#'+z+'g3').val()) + parseInt($('#'+z+'g4').val());    
                    } else if (noOfGames == 5) {
                        var totalScore = parseInt($('#'+z+'g1').val()) + parseInt($('#'+z+'g2').val()) + parseInt($('#'+z+'g3').val()) + parseInt($('#'+z+'g4').val()) + parseInt($('#'+z+'g5').val());    
                    } else if (noOfGames == 6) {
                        var totalScore = parseInt($('#'+z+'g1').val()) + parseInt($('#'+z+'g2').val()) + parseInt($('#'+z+'g3').val()) + parseInt($('#'+z+'g4').val()) + parseInt($('#'+z+'g5').val()) + parseInt($('#'+z+'g6').val());    
                    } else {
                        var totalScore = parseInt($('#'+z+'g1').val()) + parseInt($('#'+z+'g2').val()) + parseInt($('#'+z+'g3').val());
                    }
                    // var seriesScore = totalScore / 3;
                    $('#'+z+'Total').text(totalScore.toFixed(2));
                });
            }

            seriesTotal('sb1', 3);
            seriesTotal('sb2', 3);
            seriesTotal('sb3', 3);
            seriesTotal('h1b1', 3);
            seriesTotal('h1b2', 3);
            seriesTotal('h1b3', 3);
            seriesTotal('h2b1', 3);
            seriesTotal('h2b2', 3);
            seriesTotal('h2b3', 3);
            seriesTotal('sub', 3);

            $('.addSub').click(function(event){
                event.preventDefault();
                var topParent = $(event.target).parent();
                topParent.append(`<ul class="bowlerScoreEntry"><li>Sub</li>
                <li><select name="sub" id="sub" required><option value="-" disabled selected>Select</option></select></li>
                <li><input type="number" name="subg1" id="subg1" class="subg" ></li>
                <li><input type="number" name="subg2" id="subg2" class="subg" ></li>
                <li><input type="number" name="subg3" id="subg3" class="subg" ></li>
                <li><span id="subTotal"></span></li></ul>`);
                
                seriesTotal('sub', 3);
                
                $('.addSub').remove();

                if (team.length > 0) {
                    $("#sub").empty();
                    $("#sub").append('<option value="-" selected disabled>-</option>');
                    team.forEach(bowler => {
                        $("#sub").append('<option value="'+bowler['name']+'/'+bowler['bowlerid']+'">'+bowler['name']+'</option>'); 
                    }); 
                }
            });

            // seriesTotal('b1');
            // seriesTotal('b2');

            // function addBowlersEvent(b, g) {

            //     for (let j = 1; j < (b+1); j++) {
            //         $('.bowlerSetTwo').append('<ul class="bowlerScoreEntry events" id="b'+j+'"><li><label for="b'+j+'">'+j+':</label><select name="b'+j+'" id="b'+j+'" required ><option value="-" disabled selected>Select</option></select></li>');
            //         var bowlerIden = '#b'+j;
    
            //         for(let index = 1; index < (g+1); index++) { 
            //             $(bowlerIden).append('<li><input type="number" name="b'+b+'g'+index+'" id="b'+b+'g'+index+'" class="b'+b+'g" required></li>');
            //         }
    
            //         $(bowlerIden).append('<li><span id="sb1Total"></span></li></ul>');                   
            //     }

            //     // seriesTotal('b3');
            //     // seriesTotal('b4');
            //     // seriesTotal('b5');
            //     // seriesTotal('b6');
            // }

            // function addBowlersEvent(g) {
            //     $('.bowlerSetTwo').append('<ul class="bowlerScoreEntry events" id="b'+teamCount+'"><li><label for="b'+teamCount+'">'+teamCount+':</label><select name="b'+teamCount+'" id="b'+teamCount+'" required ><option value="-" disabled selected>Select</option></select></li>');
            //     var bowlerIden = '#b'+teamCount;

            //     for(let index = 1; index < (g+1); index++) { 
            //         $(bowlerIden).append('<li><input type="number" name="b'+teamCount+'g'+index+'" id="b'+b+'g'+index+'" class="b'+b+'g" required></li>');
            //     }

            //     $(bowlerIden).append('<li><span id="sb1Total"></span></li></ul>');
            //     // seriesTotal('b3');
            //     // seriesTotal('b4');
            //     // seriesTotal('b5');
            //     // seriesTotal('b6');
            // }

            function fetchTeams() {

                $.ajax({
                    type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
                    url         : 'fetchteams.php', // the url where we want to POST
                    // data        : formData, // our data object
                    dataType    : 'json', // what type of data do we expect back from the server
                    encode      : true
                    })
                    // using the done promise callback
                    .done(function(data) {
                            teamList = data;
                    });
            }

            function addEventHeader(g, teamBoxIdentifir) {

                $(teamBoxIdentifir).append('<ul class="bowlerScoreEntry" id="eventHeaders"><li>Name</li>');
                var headerIdentifir = teamBoxIdentifir + ' #eventHeaders';
                for(let index = 1; index < (g+1); index++) { 
                    $(headerIdentifir).append('<li>Game '+index+'</li>')
                }
                $(headerIdentifir).append('<li>Series</li></ul>');
            }

            function checkTeamBoxID(event) {
                var teamBoxClick = event.currentTarget.id;
                var teamBoxClickOption = '#'+teamBoxClick+' option:selected';
                var teamSel = $(teamBoxClickOption).val();

                var showLoading = '#teamSel'+teamBoxClick + ' .loadingIcon';
                $(showLoading).show();

                var formData = {
                    'teamname': teamSel
                };
                    
                $.ajax({
                type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
                url         : 'fetchbowler.php', // the url where we want to POST
                data        : formData, // our data object
                dataType    : 'json', // what type of data do we expect back from the server
                encode      : true
                })
                // using the done promise callback
                .done(function(data) {

                    if (teamCount == 'one') {
                        for (let index = 0; index < bowlerCount; index++) {
                            var bowlerID = '#bowler'+index;
                    
                            $(bowlerID).empty();
                            $(bowlerID).append('<option value="-" selected disabled>-</option>');
                            data.forEach(bowler => {
                                $(bowlerID).append('<option value="'+bowler['name']+'/'+bowler['bowlerid']+'">'+bowler['name']+'</option>'); 
                            });
                            
                        }
                    } else {
                        var bowlerID = '#bowler'+teamBoxClick;
                    
                        $(bowlerID).empty();
                        $(bowlerID).append('<option value="-" selected disabled>-</option>');
                        data.forEach(bowler => {
                            $(bowlerID).append('<option value="'+bowler['name']+'/'+bowler['bowlerid']+'">'+bowler['name']+'</option>'); 
                        });
                    }

                    
                });
                $(showLoading).hide();
            }

            function addTeamBox(games) {
                teamCount++;

                // if (teamCount < 26) {                    

                    $('.bowlerSetTwo').append('<div class="teamSel" id="teamSel'+teamCount+'"><span class="teamBoxNo">'+teamCount+'</span></div>');
                    var teamBox = '#teamSel'+teamCount;
                    $(teamBox).append('<div><label for="teams'+teamCount+'">Team:</label><select name="teams[]" id="'+teamCount+'" class="teamSelectBox" required></select></div>');
                    $(teamBox).append('<div class="loadingIcon"><img src="../images/30.gif"></div>');
                    var selectTeamBox = '#'+teamCount;
                    $(selectTeamBox).append('<option value="-" disabled selected>Select</option>');
                    
                    for (let j = 0; j < teamList.length; j++) {
                        $(selectTeamBox).append('<option value="'+teamList[j]+'">'+teamList[j]+'</option>');
                        
                    }

                    // console.log(teamBox);
                    // addBowlersEvent(games);
                    addEventHeader(games, teamBox);
                    
                    $(teamBox).append('<ul class="bowlerScoreEntry events" id="b'+teamCount+'"><li><select name="bowler[]" id="bowler'+teamCount+'" required ><option value="-" disabled selected>Select</option></select></li>');
                    var bowlerIden = '#b'+teamCount;

                    for(let index = 1; index < (games+1); index++) { 
                        $(bowlerIden).append('<li><input type="number" name="bowlergame'+index+'[]" id="b'+teamCount+'g'+index+'" class="b'+teamCount+'g" ></li>');
                    }

                    $(bowlerIden).append('<li><span id="b'+teamCount+'Total"></span></li></ul>');

                    var bowlerseriesTotal = 'b'+teamCount;
                    seriesTotal(bowlerseriesTotal, games);
                    

                    allTeamBoxes = Array.from(document.querySelectorAll('.teamSelectBox'));
                    allTeamBoxes.forEach(team => team.addEventListener('click', checkTeamBoxID));

                    
                        $('.addEventBowlerBtn').show();

                    
                // } else {
                //         $('.bowlerSetTwo').append('<div class="error">Max Bowlers Reached</div>');
                //         $('.addEventBowlerBtn').hide();    
                // }

            }

            // Bowlers from the same team

            function addTeamBoxSameTeam(games, bowlers) {
                    teamCount = 'one';
                    bowlerCount = bowlers;
                    

                    $('.bowlerSetTwo').append('<div class="teamSel" id="teamSel'+teamCount+'"><span class="teamBoxNo">Team</span></div>');
                    var teamBox = '#teamSel'+teamCount;
                    $(teamBox).append('<div><label for="teams'+teamCount+'">Team:</label><select name="teams[]" id="'+teamCount+'" class="teamSelectBox" required></select></div>');
                    $(teamBox).append('<div class="loadingIcon"><img src="../images/30.gif"></div>');
                    var selectTeamBox = '#'+teamCount;
                    $(selectTeamBox).append('<option value="-" disabled selected>Select</option>');
                    
                    for (let j = 0; j < teamList.length; j++) {
                        $(selectTeamBox).append('<option value="'+teamList[j]+'">'+teamList[j]+'</option>');
                        
                    }

                    // console.log(teamBox);
                    // addBowlersEvent(games);
                    addEventHeader(games, teamBox);
                    
                    for (let bowlersNo = 0; bowlersNo < bowlers; bowlersNo++) {
                        $(teamBox).append('<ul class="bowlerScoreEntry events" id="b'+bowlersNo+'"><li><select name="bowler[]" id="bowler'+bowlersNo+'" required ><option value="-" disabled selected>Select</option></select></li>');
                        var bowlerIden = '#b'+bowlersNo;

                        for(let index = 1; index < (games+1); index++) { 
                            $(bowlerIden).append('<li><input type="number" name="bowlergame'+index+'[]" id="b'+bowlersNo+'g'+index+'" class="b'+bowlersNo+'g"></li>');
                        }

                        $(bowlerIden).append('<li><span id="b'+bowlersNo+'Total"></span></li></ul>');

                        var bowlerseriesTotal = 'b'+bowlersNo;
                        seriesTotal(bowlerseriesTotal, games);
                    }
                    

                    allTeamBoxes = Array.from(document.querySelectorAll('.teamSelectBox'));
                    allTeamBoxes.forEach(team => team.addEventListener('click', checkTeamBoxID));

            }

            allTeamBoxes = Array.from(document.querySelectorAll('.teamSelectBox'));
            allTeamBoxes.forEach(team => team.addEventListener('click', checkTeamBoxID));

            $('.addEventBowlerBtn').show();

            $('.addEventBowlerBtn').click(function(){
                var eventSelected = $('#eventName option:selected').text();
                
                addTeamBox(5);
                // if (eventSelected == 'Unholy Alliance') {
                //     // addEventHeader(5);
                //     addTeamBox(5, 1);
                // } else if (eventSelected == 'Conference Classic') {
                //     addTeamBox(5, 1);
                // }
                // else if (eventSelected == 'Last Man/Woman Standing') {
                //     addTeamBox(4,1);
                // }
                // else if (eventSelected == 'The Draft' || eventSelected == 'Gauntlet') {
                //     addTeamBox(3,1);
                // }

                if (teamCount > 1) {
                    $('.deleteEventBowlerBtn').show();
                }

                $('html, body').animate({ scrollTop: $(document).height() }, 1500);
            })

            $('.deleteEventBowlerBtn').click(function(){
                $('.bowlerSetTwo > div:last-child').remove();
                teamCount--;
                if (teamCount < 2) {
                    $('.deleteEventBowlerBtn').hide();
                }
                $('html, body').animate({ scrollTop: $(document).height() }, 1500);
            })

            // $('#subEvent').change(function() {
            //     $('.bowlerSetTwo').empty();
            //     teamCount = 0;
            //     var eventSelected = $('#eventName option:selected').text();

            //     if (eventSelected == 'Unholy Alliance' || eventSelected == 'Conference Classic') {
            //         // addEventHeader(5);
            //         addTeamBox(5,1);
            //     } else if (eventSelected == 'Last Man/Woman Standing') {
            //         addTeamBox(4,1);
            //     } else if (eventSelected == 'The Draft' || eventSelected == 'Gauntlet') {
            //         addTeamBox(3,1);
            //     } else if (eventSelected == 'Rankings Qualifier') {
            //         addTeamBoxSameTeam(5,6);
            //     } else if (eventSelected == 'Team Relay') {
            //         addTeamBoxSameTeam(3,6);
            //     } else if (eventSelected == 'Last Team Standing') {
            //         addTeamBoxSameTeam(3,3);
            //     }
                
            // });

            

            function setEvent() {
                $('.bowlerSetTwo').empty();
                teamCount = 0;

                addTeamBox(5);
            }

            // setEvent();

            
            // $('.sb1g').keyup(function(e) {
            //     // console.log($('#sb1g1').val());
            //     var totalScore = parseInt($('#sb1g1').val()) + parseInt($('#sb1g2').val()) + parseInt($('#sb1g3').val());
            //     var seriesScore = totalScore / 3;
            //     $('#sb1Total').text(seriesScore.toFixed(2));
            // });

            // $('.sb2g').keyup(function(e) {
            //     // console.log($('#sb1g1').val());
            //     var totalScore = parseInt($('#sb2g1').val()) + parseInt($('#sb2g2').val()) + parseInt($('#sb2g3').val());
            //     var seriesScore = totalScore / 3;
            //     $('#sb2Total').text(seriesScore.toFixed(2));
            // });

            // $('.sb3g').keyup(function(e) {
            //     // console.log($('#sb1g1').val());
            //     var totalScore = parseInt($('#sb3g1').val()) + parseInt($('#sb3g2').val()) + parseInt($('#sb3g3').val());
            //     var seriesScore = totalScore / 3;
            //     $('#sb3Total').text(seriesScore.toFixed(2));
            // });

            
        
        
            // $( "#citcategory" ).autocomplete({
            // source: 'fetchcategory.php',
            // showNoSuggestionNotice: true,
            // messages: {
            //     noResults: 'Not results. Please check the Subject List or Create a New Subject',
            //     results: function() {}
            // },
            // response: function( event, ui ) {
            //     if (ui.content == null) {
            //     //in this moment you get count results you
            //     $('#subjectcount').html('No results founds. Please check the subject list or create a new subject');
            //     $("#subjectcount").fadeIn();
            //     $('#ui-id-1').css({"display": "none"});
            //     } else {
            //         $("#subjectcount").fadeOut();
            //     }
            //     }
            // });

            // $( "#sb1" ).autocomplete({
            //     source: 'fetchtaxstatute.php'
            // });
        });