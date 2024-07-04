function nano(template, data) {
  return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
    var keys = key.split('.'), v = data[keys.shift()];
    for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
    return (typeof v !== 'undefined' && v !== null) ? v : '';
  });
}


$('.toggle-add-color-form').on('change', function(e) {
    if ($(this).prop('checked')) {
        var addImagesTemplate = $('#vehicle-color-form-template').html();
        var templateString = nano(addImagesTemplate, { vehicle_id: $(this).data('vehicleId')});

        $('.color_form_container').append(templateString);
    } else {
        $('.color_form_container').html('');
    }
});

function showSpinner() {
    $('.loader').show();
}

function hideSpinner() {
    $('.loader').hide();
}

$(document).on('click', '.add-color-image', function(){
    if(validation()){
        showSpinner()
        var $button = $('.add-color-image');
        var $form = $('#add_color_form');
        var $successMessage = $('#success_message');
        var $errorMessage = $('#error_message');
        var values = $form.serializeArray();
        $('#add_color_form :input').prop('disabled', true);

        $button.prop('disabled', true);

        var vehicleId =  $(this).data('vehicleId');

        $.ajax({
            type: 'POST',
            url: '/admin/addColor/'+ vehicleId,
            data: values,
            success: function (res) {
                hideSpinner()
                $('#add_color_form :input').prop('disabled', false);
                $button.prop('disabled', false);
                $form[0].reset();
                $successMessage.show().html('Successfully Updated');
                    setTimeout(function() {
                        $successMessage.hide();
                }, 10000 );

                getVehicleData(vehicleId);
            },
            error: function(error) {
                hideSpinner()
                $('#add_color_form :input').prop('disabled', false);
                $button.prop('disabled', false);
                var err = error.responseJSON
                $errorMessage.show().html(err.message || err.stack);
                    setTimeout(function() {
                        $errorMessage.hide();
                }, 10000 );
            }
        });
    }
});

function validation() {
    var vehicle_color_add = $("#vehicle_color_add").val();
    var image_1 = $("#image_1").val();
    var image_32 = $("#image_32").val();
    var image_14 = $("#image_14").val();

    if (vehicle_color_add === '' || image_1 === '' || image_32 === '' || image_14 === '') {
        $('#error_message').show().html("<h5>Please insert all filed</h5>");
            setTimeout(function() {
                $('#error_message').hide();
        }, 10000 );
    } else {
        return true;
    }
}

var fuel_id = {
    '12': {
        name: 'Color 640 Angle 32 PNG'
    },
    '6': {
        name: 'Color 640 Angle 1 PNG'
    },
    '8': {
        name: 'Color 640 Angle 14 PNG'
    }
};

function getVehicleData(vehicleId) {
    $.get('/admin/vehicles/' + vehicleId)
        .done(function(response) {
            var vehicleColorTemplate = $('#vehicle-color-media-template').html();
            $('.vehicle-color-list').html('');

            $.each(response.data.VehicleColors, function (colorIndex, color) {
                var $row = $('<div class="row">');
                var $col12 = $('<div class="col-md-12">');
                $row.append($col12);
                $.each(color.VehicleColorsMedia , function(mediaIndex, colorMedia){
                    var vehicleMedia = {
                        image_url: colorMedia.image_url,
                        color: color.color,
                        fuel_format_name: fuel_id[colorMedia.fuel_format_id].name,
                    };

                    var vehicle =  nano(vehicleColorTemplate, { colorMedia: vehicleMedia });
                    return $col12.append(vehicle);
                });
                $('.vehicle-color-list').append($row);
            });
        });
}
