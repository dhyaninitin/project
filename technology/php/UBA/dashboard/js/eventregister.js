$(function () {
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
                var setup = data['setup'];

                $("#squad").empty();
                $("#squad").append('<option value="-" selected disabled>-</option>');
                for(var i = 1; i <= squads; i++) {
                    $("#squad").append('<option value="'+i+'">'+ i +'</option>');
                }
                
                $(".eventfee").text(fee);

        });
    });
});