$(function () {

    $('#registerteam').change(function(event){
        var teamSel = $( "#registerteam option:selected" ).val();

        var formData = {
            'teamname': teamSel
        };
            
        $.ajax({
        type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
        url         : 'getBowlers.php', // the url where we want to POST
        data        : formData, // our data object
        dataType    : 'json', // what type of data do we expect back from the server
        encode      : true
        })
        // using the done promise callback
        .done(function(data) {
                console.log(data);

                $("#registerbowler").empty();
                
                $("#registerbowler").append('<option value="-" selected disabled>-</option>');

            data.forEach(bowler => {
                $("#registerbowler").append('<option value="'+bowler['name']+'/'+bowler['bowlerid']+'">'+bowler['name']+'</option>');
            });
        });
    });

    

});