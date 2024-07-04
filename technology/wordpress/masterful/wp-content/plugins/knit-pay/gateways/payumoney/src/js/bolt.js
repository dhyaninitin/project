//jQuery(document).ready(function ($) {
    function launchBOLT($)
    {
        bolt.launch({
            key: $('[name ="key"]').val(),
            txnid: $('[name ="txnid"]').val(), 
            hash: $('[name ="hash"]').val(),
            amount: $('[name ="amount"]').val(),
            firstname: $('[name ="firstname"]').val(),
            lastname: $('[name ="lastname"]').val(),
            email: $('[name ="email"]').val(),
            phone: $('[name ="phone"]').val(),
            productinfo: $('[name ="productinfo"]').val(),
            udf5: $('[name ="udf5"]').val(),
            surl : $('[name ="surl"]').val(),
            furl: $('[name ="furl"]').val(),
            mode: 'dropout'	
        },{ 
            responseHandler: function(BOLT){console.log(BOLT);
                console.log( BOLT.response.txnStatus );		
                //if(BOLT.response.txnStatus != 'CANCEL')
                //{
                    var fr = '<form action=\"'+$('[name ="surl"]').val()+'\" method=\"post\">' +
                    '<input type=\"hidden\" name=\"key\" value=\"'+BOLT.response.key+'\" />' +
                    '<input type=\"hidden\" name=\"txnid\" value=\"'+BOLT.response.txnid+'\" />' +
                    '<input type=\"hidden\" name=\"amount\" value=\"'+BOLT.response.amount+'\" />' +
                    '<input type=\"hidden\" name=\"productinfo\" value=\"'+BOLT.response.productinfo+'\" />' +
                    '<input type=\"hidden\" name=\"firstname\" value=\"'+BOLT.response.firstname+'\" />' +
                    '<input type=\"hidden\" name=\"email\" value=\"'+BOLT.response.email+'\" />' +
                    '<input type=\"hidden\" name=\"udf5\" value=\"'+BOLT.response.udf5+'\" />' +
                    '<input type=\"hidden\" name=\"mihpayid\" value=\"'+BOLT.response.mihpayid+'\" />' +
                    '<input type=\"hidden\" name=\"status\" value=\"'+BOLT.response.status+'\" />' +
                    '<input type=\"hidden\" name=\"hash\" value=\"'+BOLT.response.hash+'\" />' +
                    '<input type=\"hidden\" name=\"txnStatus\" value=\"'+BOLT.response.txnStatus+'\" />' +
                    '</form>';
                    var form = jQuery(fr);
                    jQuery('body').append(form);								
                    form.submit();
                //}
            },
            catchException: function(BOLT){
                alert( BOLT.message );
            }
        });
    }
//});
//launchBOLT();
