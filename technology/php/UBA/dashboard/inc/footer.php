

        </div>
    </div>

    <!-- jQuery CDN - Slim version (=without AJAX) -->
    <script src="../js/jquery.js"></script>
    <script src="../js/jquery-ui.min.js"></script>
    <!-- Popper.JS -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.0/umd/popper.min.js" integrity="sha384-cs/chFZiN24E4KMATLdqdvsezGxaGsi4hLGOzlXwp5UZB1LY//20VyM2taTB4QvJ" crossorigin="anonymous"></script>
    <!-- Bootstrap JS -->
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/js/bootstrap.min.js" integrity="sha384-uefMccjFJAIv6A+rW+L4AHf99KvxDjWSu1z9VI8SKNVmz4sk7buKt/6v9KI65qnm" crossorigin="anonymous"></script>
    <script src="https://cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js"></script>
    <!-- <script src="https://cdn.datatables.net/select/1.2.7/js/dataTables.select.min.js"></script> -->
    <script src="https://cdn.datatables.net/buttons/1.5.2/js/dataTables.buttons.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/1.5.2/js/buttons.flash.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.36/pdfmake.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.36/vfs_fonts.js"></script>
    <script src="https://cdn.datatables.net/buttons/1.5.2/js/buttons.html5.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/1.5.2/js/buttons.print.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/1.5.2/js/buttons.colVis.min.js"></script>
    
    

    <script src="/js/app.js"></script>
    
    <!-- jQuery Custom Scroller CDN -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/malihu-custom-scrollbar-plugin/3.1.5/jquery.mCustomScrollbar.concat.min.js"></script>
    
    <?php
        if ($addscore == true) {
    ?>
        <script src="js/addscore.js"></script>;
    <?php
        }
    ?>

    <?php
        if ($registerevent == true) {
    ?>
        <script src="js/eventregister.js"></script>;
    <?php
        }
    ?>

    <script type="text/javascript">
        $(document).ready(function () {

            var checkedAll = 0;

            $('#selCheckboxs').click(function(e) {
                e.preventDefault();
                if (checkedAll == 0) {
                    $('.scoreTable .checkboxes').attr('checked', true);    
                    checkedAll = 1;
                } else {
                    $('.scoreTable .checkboxes').attr('checked', false);    
                    checkedAll = 0;
                }
                

            })
            

            $("#datepicker").datepicker();

            $("#loaderbg").fadeOut("slow");
            
            $('#sidebarCollapse').on('click', function () {
                $('#sidebar').toggleClass('active');
                $(this).toggleClass('active');
            });

            $('.erTeam').change(function(event) {
                var box = '#'+$(this).parent().parent().attr('id');
                var boxid = '#'+$(this).attr('id');
                var teamSelected = $(boxid+' option:selected').text();
                
                var formData = {
                    'teamname': teamSelected
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
                    
                    var bowlerID = box+' .erTeammates';
                    $(bowlerID).empty();
                    $(bowlerID).append('<option value="-" selected disabled>-</option>');

                    data.forEach(bowler => {
                        $(bowlerID).append('<option value="'+bowler['name']+'/'+bowler['bowlerid']+'">'+bowler['name']+'</option>'); 
                    });

                    // for (let index = 0; index < bowlerCount; index++) {
                    //     var bowlerID = '#bowler'+index;
                
                    //     $(bowlerID).empty();
                    //     $(bowlerID).append('<option value="-" selected disabled>-</option>');
                    //     data.forEach(bowler => {
                    //         $(bowlerID).append('<option value="'+bowler['name']+'/'+bowler['bowlerid']+'">'+bowler['name']+'</option>'); 
                    //     });
                        
                    // }

                    
                });

            });

            $('#mainEvent').change(function() {
                $('.bowlerSetTwo').empty();
                teamCount = 0;
                var eventSelected = $('#mainEvent option:selected').text();

                if(eventSelected == 'Mega Bowl') {

                }

                if (eventSelected == 'Unholy Alliance' || eventSelected == 'Conference Classic') {
                    // addEventHeader(5);
                    addTeamBox(5,1);
                } else if (eventSelected == 'Last Man/Woman Standing') {
                    addTeamBox(4,1);
                } else if (eventSelected == 'The Draft' || eventSelected == 'Gauntlet') {
                    addTeamBox(3,1);
                } else if (eventSelected == 'Rankings Qualifier') {
                    addTeamBoxSameTeam(5,6);
                } else if (eventSelected == 'Team Relay') {
                    addTeamBoxSameTeam(3,6);
                } else if (eventSelected == 'Last Team Standing') {
                    addTeamBoxSameTeam(3,3);
                }
                
            });

            $('#dataByEvent').change(function(event){
                var teamSel = $( "#dataByEvent option:selected" ).val();
                
                var formData = {
                    'teamname': teamSel
                };
                    
                $.ajax({
                type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
                url         : 'fetchEvents.php', // the url where we want to POST
                data        : formData, // our data object
                dataType    : 'json', // what type of data do we expect back from the server
                encode      : true
                })
                // using the done promise callback
                .done(function(data) {

                        $("#eventSelected").empty();
                        
                        $("#eventSelected").append('<option value="-" selected disabled>-</option>');

                    data.forEach(bowler => {
                        var event = bowler['event'];
                        $("#eventSelected").append('<option value="'+event+'">'+ event +'</option>');
                    });
                });
            });

            $('#mainEvent').change(function(event){
                var eventSel = $( "#mainEvent option:selected" ).val();
                
                var formData = {
                    'eventsel': eventSel
                };
                    
                $.ajax({
                type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
                url         : 'fetchEventsList.php', // the url where we want to POST
                data        : formData, // our data object
                dataType    : 'json', // what type of data do we expect back from the server
                encode      : true
                })
                // using the done promise callback
                .done(function(data) {

                        $("#subEvent").empty();
                        
                        $("#subEvent").append('<option value="-" selected disabled>-</option>');

                    data.forEach(bowler => {
                        var event = bowler;
                        $("#subEvent").append('<option value="'+event+'">'+ event +'</option>');
                    });
                });
            });

            $('#eventRegister').change(function(event){
                var eventSel = $( "#eventRegister option:selected" ).val();
                
                var formData = {
                    'eventsel': eventSel
                };
                    
                $.ajax({
                type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
                url         : 'fetchSubEvents.php', // the url where we want to POST
                data        : formData, // our data object
                dataType    : 'json', // what type of data do we expect back from the server
                encode      : true
                })
                // using the done promise callback
                .done(function(data) {
                        var squads = data['squads'];
                        var fee = data['fee'];

                        $("#squad").empty();
                        $("#squad").append('<option value="-" selected disabled>-</option>');
                        for(var i = 1; i <= squads; i++) {
                            $("#squad").append('<option value="'+i+'">'+ i +'</option>');
                        }
                        
                        $(".eventfee").text(fee);

                });
            });

            $("#perteam").hide();
            $("#bowlersPerTeam").prop('required',false);
            $("#teamStructure").prop('required',false);

            $('#entryEvent').change(function(event){
                var eventSel = $( "#entryEvent option:selected" ).val();
                
                if(eventSel == 'team') {
                    $("#perteam").show();
                    $("#bowlersPerTeam").prop('required',true);
                    $("#teamStructure").prop('required',true);
                } else {
                    $("#perteam").hide();
                    $("#bowlersPerTeam").prop('required',false);
                    $("#teamStructure").prop('required',false);
                }
            });

            $('#multiSelect').click(function() {
                $('.checkboxes').attr("checked", true);
                // var allCheckboxes = Array.from(document.querySelectorAll('.checkboxes'));
                // console.log(allCheckboxes);
            });

            // $('#dataByDivision').change(function(event){
            //     var teamSel = $( "#dataByDivision option:selected" ).val();

            //     var formData = {
            //         'teamname': teamSel
            //     };
                    
            //     $.ajax({
            //     type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
            //     url         : 'getDivisions.php', // the url where we want to POST
            //     data        : formData, // our data object
            //     dataType    : 'json', // what type of data do we expect back from the server
            //     encode      : true
            //     })
            //     // using the done promise callback
            //     .done(function(data) {
            //             console.log(data);

            //             $("#divisionSelected").empty();
                        
            //             $("#divisionSelected").append('<option value="-" selected disabled>-</option>');

            //         data.forEach(bowler => {
            //             $("#divisionSelected").append('<option value="'+bowler['name']+'/'+bowler['bowlerid']+'">'+bowler['name']+'</option>');
            //         });
            //     });
            // });

            $('#relbowler').on('click', function () {
                return confirm('Are you sure you want to RELEASE this bowler?');
            });

            $('#susbowler').on('click', function () {
                return confirm('Are you sure you want to SUSPEND this bowler?');
            });

            $('#delbowler').on('click', function () {
                return confirm('Are you sure you want to DELETE this bowler?');
            });

            $('#table_1_events').DataTable({
                dom: 'lBfrtip',
                "aoColumns": [
                            { "bSortable": false },
                            null,
                            null,
                            { "bSortable": false },
                            null,
                            { "bSortable": false },
                            null,
                            null,
                            { "bSortable": false },
                            { "bSortable": false },
                            { "bSortable": false },
                            { "bSortable": false },
                            { "bSortable": false }
                            ],
                buttons: [
                    'csv', 'excel', 'pdf',
            'colvis'
                ],
                order: [[ 1, 'asc' ]]
            });

            $('#table_1_seasons').DataTable({
                dom: 'lBfrtip',
                "aoColumns": [
                            { "bSortable": false },
                            null,
                            null,
                            { "bSortable": false },
                            null,
                            { "bSortable": false },
                            null,
                            null,
                            { "bSortable": false },
                            { "bSortable": false },
                            { "bSortable": false },
                            { "bSortable": false }
                            ],
                buttons: [
                    'csv', 'excel', 'pdf',
            'colvis'
                ],
                order: [[ 1, 'asc' ]]
            });

            $('#table_1_events_me').DataTable({
                dom: 'lBfrtip',
                "aoColumns": [
                            { "bSortable": false },
                            null,
                            null,
                            { "bSortable": false },
                            null,
                            { "bSortable": false },
                            null,
                            null,
                            { "bSortable": false },
                            { "bSortable": false },
                            { "bSortable": false },
                            { "bSortable": false },
                            { "bSortable": false }
                            ],
                order: [[ 1, 'asc' ]]
            });

            $('#table_1_events_es').DataTable({
                dom: 'lBfrtip',
                "aoColumns": [
                            null,
                            null,
                            { "bSortable": false },
                            null,
                            { "bSortable": false },
                            null,
                            null,
                            { "bSortable": false },
                            { "bSortable": false },
                            { "bSortable": false },
                            { "bSortable": false },
                            { "bSortable": false }
                            ],
                buttons: [
                    'csv', 'excel', 'pdf',
            'colvis'
                ],
                order: [[ 1, 'asc' ]]
            });

            

            $('#submitted_rosters').DataTable({
                dom: 'lBfrtip',
                "aoColumns": [
                            null,
                            null,
                            { "bSortable": false },
                            null,
                            { "bSortable": false }
                            ],
                buttons: [
                    'csv', 'excel', 'pdf'
                ]
            });

            $('#submitted_rosters_list').DataTable({
                dom: 'lBfrtip',
                "aoColumns": [
                            null,
                            null,
                            { "bSortable": false },
                            { "bSortable": false },
                            null
                            ],
                buttons: [
                    'csv', 'excel', 'pdf'
                ],
                order: [[ 1, 'asc' ]]
            });



            
            $('#nonactive_table_home').DataTable({
                 dom: 'lBfrtip',
                "aoColumns": [
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            { "bSortable": false },
                            { "bSortable": false }
                            ],
                             buttons: [
                    'csv', 'excel', 'pdf','colvis'],
                            order: [[ 0, 'asc' ]],
                            "searching": false
            });
            
            $('#released_bowlers_table_home').DataTable({
                 dom: 'lBfrtip',
                "aoColumns": [
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            { "bSortable": false },
                            { "bSortable": false }
                            ],
                             buttons: [
                    'csv', 'excel', 'pdf','colvis'],
                            order: [[ 0, 'asc' ]],
                            "searching": false
            });

            $('#bowlers_released_table_home').DataTable({
                "aoColumns": [
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            { "bSortable": false },
                            { "bSortable": false }
                            ],
                            order: [[ 0, 'asc' ]],
                            "searching": false
            });

            

            $('#released_bowlers').DataTable({

                dom: 'lBfrtip',
                "aoColumns": [
                            null,
                            { "bSortable": false },
                            null,
                            null,
                            null,
                            null,
                            { "bSortable": false },
                            { "bSortable": false },
                            { "bSortable": false }
                            ],
                buttons: [
                    'csv', 'excel', 'pdf',
            'colvis'
                ],
                order: [[ 0, 'asc' ]]
            });

            

            $('#president_table_home').DataTable({
                "aoColumns": [
                            null,
                            null,
                            null,
                            null,
                            null,
                            { "bSortable": false }
                            ],
                            order: [[ 0, 'asc' ]],
                            "searching": false
            });

            $('#owner_table_home').DataTable({
                "aoColumns": [
                            null,
                            null,
                            null,
                            null,
                            { "bSortable": false }
                            ],
                            order: [[ 0, 'asc' ]],
                            "searching": false
            });

            $('#transfer_table_home').DataTable({
                dom: 'lBfrtip',
                "aoColumns": [
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            { "bSortable": false },
                            { "bSortable": false }
                            ],
                             buttons: [
                    'csv', 'excel', 'pdf','colvis'],
                            order: [[ 0, 'asc' ]],
                            "searching": false
            });

            $('#nickname_table_home').DataTable({
                "aoColumns": [
                            null,
                            null,
                            null,
                            null,
                            { "bSortable": false },
                            { "bSortable": false }
                            ],
                            order: [[ 0, 'asc' ]],
                            "searching": false
            });

            $('#teamRosterTwo').DataTable({
                dom: 'lBfrtip',
                "aoColumns": [
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            { "bSortable": false }
                            ],
                buttons: [
                    'csv', 'excel', 'pdf',
            'colvis'
                ],
                order: [[ 1, 'asc' ]]
            });

            $('#independentBowlerList').DataTable({
                "aoColumns": [
                            null,
                            null,
                            null,
                            null,
                            { "bSortable": false }
                            ],
                            order: [[ 1, 'asc' ]]
            });
            
            $('#registrationTable').DataTable( {
                dom: 'lBfrtip',
                "aoColumns": [
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            { "bSortable": false },
                            { "bSortable": false },
                            { "bSortable": false }
                            ],
                buttons: [
                    'csv', 'excel', 'pdf',
            'colvis'
                ],
                order: [[ 1, 'asc' ]]
            } );
            

            $('#teamRoster').DataTable( {
                dom: 'lBfrtip',
                "aoColumns": [
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            { "bSortable": false },
                            { "bSortable": false },
                            { "bSortable": false },
                            { "bSortable": false }
                            ],
                buttons: [
                    'csv', 'excel', 'pdf',
            'colvis'
                ],
                order: [[ 1, 'asc' ]]
            } );

             $('#divisionRoster').DataTable( {
                dom: 'lBfrtip',
                "aoColumns": [
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            { "bSortable": false },
                            { "bSortable": false },
                            { "bSortable": false }
                            ],
                buttons: [
                    'csv', 'excel', 'pdf',
            'colvis'
                ],
                order: [[ 1, 'asc' ]]
            });

            $('#table_1_seasons_me').DataTable({
                dom: 'lBfrtip',
                "aoColumns": [
                            { "bSortable": false },
                            null,
                            null,
                            { "bSortable": false },
                            null,
                            null,
                            null,
                            { "bSortable": false },
                            { "bSortable": false },
                            { "bSortable": false }
                            ],
                order: [[ 0, 'asc' ]]
            });

            $('#table_1_seasons_es').DataTable({
                dom: 'lBfrtip',
                "aoColumns": [
                            null,
                            null,
                            { "bSortable": false },
                            null,
                            null,
                            null,
                            null,
                            { "bSortable": false },
                            { "bSortable": false },
                            { "bSortable": false }
                            ],
                buttons: [
                    'csv', 'excel', 'pdf',
            'colvis'
                ],
                order: [[ 1, 'asc' ]]
            });

            $('#team_officials').DataTable({
                dom: 'lBfrtip',
                "aoColumns": [
                            null,
                            null,
                            { "bSortable": false },
                            null
                            ],
                            buttons: [
                    'csv', 'excel', 'pdf',
            'colvis'
                ],
                order: [[ 1, 'asc' ]]
            });

            $('#table_1_events_home').DataTable({
                dom: 'lBfrtip',
                "aoColumns": [
                            null,
                            null,
                            { "bSortable": false },
                            null,
                            { "bSortable": false },
                            null,
                            { "bSortable": false },
                            { "bSortable": false },
                            { "bSortable": false },
                            { "bSortable": false },
                            { "bSortable": false }
                            ],
                            buttons: ['csv', 'excel', 'pdf','colvis'],
                        order: [[ 0, 'asc' ]]
            });

            $('#table_1_seasons_home').DataTable({
                dom: 'lBfrtip',
                "aoColumns": [
                            null,
                            null,
                            { "bSortable": false },
                            null,
                            { "bSortable": false },
                            null,
                            null,
                            { "bSortable": false },
                            { "bSortable": false }
                            ],
                            buttons: ['csv', 'excel', 'pdf','colvis'],
        order: [[ 0, 'asc' ]]
            });
        });
    </script>


</body></html>
