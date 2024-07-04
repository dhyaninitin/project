<?php
	include_once '../baseurl.php';
    include_once '../session.php';
    include_once '../connect.php';

    if($_SESSION['userrole'] != 'admin'){
        header("Location: ".$base_url."/dashboard/home.php");
    }

    $title = 'Add Team';

    include 'inc/header.php';

    try {
        $database = new Connection();
        $db = $database->openConnection();

        $sql = $db->prepare("SELECT * FROM `districtcodes`");
        $sql->execute();
        $dataFetched = $sql->fetchAll();
        
    } catch (PDOException $e) {
        echo "There was some problem with the connection: " . $e->getMessage();
    }

    if (isset($_SESSION['success'])) {
        $msg = '<div class="col-12"><p class="successMsg">'.$_SESSION['success'].'</p></div>';
    } else if (isset($_SESSION['error'])) {
        $msg = '<div class="col-12"><p class="errorMsg">'.$_SESSION['error'].'</p></div>';
    } else {
        $msg = '';
    }



?>

<style>




.button {
    font-size: 1em;
    padding: 10px;
    color: #000;
    border: 2px solid #4F4F4F;
    /*border-radius: 20px/50px;*/
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease-out;
}

.button:hover {
    background: #4F4F4F;
    color: #fff;
}

.overlay {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.7);
    transition: opacity 500ms;
    visibility: hidden;
    opacity: 0;
    z-index: 99;
}

.overlay:target {
    visibility: visible;
    opacity: 1;
}

.popup {
    margin: 0px auto;
    padding: 20px;
    background: #fff;
    border-radius: 5px;
    width: 30%;
    position: relative;
    transition: all 5s ease-in-out;
}

.popup h2 {
	font-size: 17px;
    margin-top: 0;
    color: #333;
    font-family: Tahoma, Arial, sans-serif;
}

.popup .close {
    position: absolute;
    top: 20px;
    right: 30px;
    transition: all 200ms;
    font-size: 30px;
    font-weight: bold;
    text-decoration: none;
    color: #333;
}

.popup .close:hover {
    color: #06D85F;
}

.popup .content {
    max-height: 450px;
    overflow: auto;
}

@media screen and (max-width: 700px) {
    .box {
        width: 90%;
    }

    .popup {
        width: 90%;
    }
    
}

@media screen and (max-width: 768px) {
	.box {
        width: 90%;
    }

    .popup {
        width: 90%;
    }
    
}

.radioChekc{
	top:40px;
}
.adddistc{
	    padding-right: 15px;
    padding-top: 2px;
}
.editDelete{
	margin-left: 7px;
}
.radiotext{
	height: 22px;
    width: 141px;
}
.donefafa{
	color: #138496;
    cursor: pointer;
}
.editfafa{
	color: #0069D9;
    cursor: pointer;
}
.deletefafa{
	color: #C82333;
	cursor: pointer;
}
.showMessage{
	padding: 3px 17px 4px 17px;  
}
.successMsg{
	background-color: #218838;
    color: #fff;
}

.errorMsg{
	background-color: red;
    color: #fff;	
}
.editDelete button {
    font-size: 10px;
    padding: 4px 4px 4px 4px;
}  
.form-check {
    position: relative;
    display: block;
    padding-left: 1.25rem;
    padding: 0px 0px 8px 35px;
}
</style>



<div class="users">
    <?php echo $msg; ?>

    <div class="container">
        <div class="row">
            <div class="col-12">
                <h4>Add Team</h4>
                <hr>
				<form action="process/teamAdded.php" method="post">
                <div class="row">
                    <div class="col-sm-6">
                        
                        <div class="form-group">
                            <label for="teamName">Team's Name</label>
                            <input type="text" name="teamName" id="teamName" required placeholder="Enter Teams's Name">
                        </div>

                        <div class="form-group">
                            <label for="conference">Conference</label>
                            <input type="text" name="conference" id="conference" required placeholder="Enter Team Conference">
                        </div>

                        <div class="form-group">
                        	<label for="teamDivision">Team District</label>
	                        <div class="input-group">
								<select name="teamDivision" id="teamDivision">
								<option value="-"disabled selected>-</option>
								<?php
								foreach ($dataFetched as $division) {
								?>
								<option value="<?php echo $division['division'];?>"><?php echo $division['division'];?></option>
								<?php
								}
								?>
								</select>
							  <!-- <input type="text" name="teamDivision" id="teamDivision" required placeholder="Enter Teams Division"> -->
							  <div class="input-group-prepend">
									<a class="button" href="#popup1" data-toggle="tooltip" data-placement="top" title="Add New District " ><i class="fa fa-plus-circle"></i> Add/Update/Remove District </a>
							  </div>
							</div>
						</div>
                    </div>

                    <div class="col-sm-6">
                            <div class="form-group">
                                <label for="homeHouse">Home House</label>
                                <input type="text" name="homeHouse" id="homeHouse" required placeholder="Enter Home House">
                            </div>
                        <!-- <div class="form-group">
                            <label for="teamPresident">Team President</label>
                            <input type="text" name="teamPresident" id="teamPresident" placeholder="Enter Team President">
                        </div>

                        <div class="form-group">
                            <label for="teamVicePresident">Team Vice President</label>
                            <input type="text" name="teamVicePresident" id="teamVicePresident" placeholder="Enter Team Vice President">
                        </div>

                        <div class="form-group">
                            <label for="teamCaptain">Team Captain</label>
                            <input type="text" name="teamCaptain" id="teamCaptain" placeholder="Enter Team Captain">
                        </div> -->

                        <!--<div class="form-group">-->
                        <!--    <label for="teamContact">Team Contact</label>-->
                        <!--    <input type="text" name="teamContact" id="teamContact" placeholder="Enter Team Contact">-->
                        <!--</div>-->
                    </div>

                    <div class="col-12">
                        <div class="form-group">
                            <input type="submit" value="Add Team">
                        </div>
                    </div>

                </div>
				</form>
				
            </div>
        </div>
    </div>
</div>



<div id="popup1" class="overlay">
    <div class="popup">
        <h2>Add new district</h2>
        <a class="close" href="#">&times;</a>
        <hr>
        <div class="content">
        	<div class="showMessage"> </div>
        	<div class="float-right adddistc">
        		<button class="btn btn-md addfafa"><i class="fa  fa-plus-circle"></i> Add</button>
        	</div>
        	<span class="radioinput"></span>
        	
        </div>
    </div>
</div>

<?php
unset($_SESSION['success']);
unset($_SESSION['error']);
include 'inc/footer.php';
?>

<script>
var clicks = 1000;

$('.addfafa').on('click',function(){
	 clicks += 1;
	 
	$('.radioinput').prepend(`<div class="form-check radioChekc addradiocheck`+clicks+`">
	<input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault`+clicks+`">
	<span class="addinput`+clicks+`"><input class="radiotext" type="text" id="radioaddinput`+clicks+`"> 
	<button type="button" class="btn btn-success btn-sm" onclick="adddistrict('`+clicks+`')">Done</button>
	</span>
	</div> `);
	
});


function adddistrict(addnum){
	var addtval = $('#radioaddinput'+addnum).val();
	var formAddData = {
        'action': 'adddistrict',
        'addvalue':addtval
    };
    
	    $.ajax({
	        type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
	        url         : '<?=$base_url?>/dashboard/getDistrict.php', // the url where we want to POST
	        data        : formAddData, // our data object
	        dataType    : 'json', // what type of data do we expect back from the server
	        encode      : true
	    })
	    .done(function(data) {
	    	// console.log('adddistrict',data);
			// $('.checkbox'+inputnum).show();
			$('.addradiocheck'+addnum).hide();
			// $('#districttext'+inputnum).html(updtval);
			
	    	if(data == 'not'){
	    		$('.close'+inputnum).show();
	    		$('.showMessage').addClass('errorMsg');
	    		$('.showMessage').html('Something Wrong');
	    	}else{
	    		$('.showMessage').addClass('successMsg');
	    		$('.showMessage').html('District Added');
	    		
	    		var distc = 1;
	    		var addDist = '';
	    		for (let index = 0; index < data.length; index++) {
					addDist += `<div class="form-check radioChekc">
							  <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault`+distc+`">
							  <span style="display:none;" class="showinput`+distc+`"><input class="radiotext" type="text" id="radiotext`+distc+`"> 
							  <button type="button" class="btn btn-success btn-sm done`+distc+`">Done</button>
							  </span>
							  
							  <span class="checkbox`+distc+`">
							  <label class="form-check-label" for="flexRadioDefault`+distc+`"><span id="districttext`+distc+`">`+data[index]['division']+`</span></label> 
							  
								<span class="editDelete"> 
									<button type="button" class="btn btn-primary btn-sm edit`+distc+`" onclick="editinput('`+distc+`','`+data[index]['id']+`')">Update</button>
									<button type="button" class="btn btn-danger btn-sm delete`+distc+`" 
									onclick="deleteDistric('`+distc+`','`+data[index]['id']+`','`+data[index]['division']+`')">Remove</button>
								</span>
							  
							  </span>
							  <span><i style="display:none;color:#1F8035;" class="fa fa-check-circle complete`+distc+`"></i>
							  <i style="display:none;color:#C82333;" class="fa fa-times close`+distc+`"></i>
							  </span>
							</div> `;
				
				distc ++;
	    			// console.log(data[index]['division']);
	    		}
	    		$('.radioinput').html(addDist);
	    		
	    		var distroptionupadd = '';
		    		distroptionupadd += '<option value="-"disabled selected>-</option>';
					for (let index = 0; index < data.length; index++) {
						distroptionupadd += '<option value="'+data[index]['division']+'" >'+data[index]['division']+'</option>';
					}
					$('#teamDivision').html(distroptionupadd);
	    		
	    		
	    	}
			
				
				
	    });	
	    
}







$( document ).ready(function() {
		var formData = {
		'action': 'select',
		};
    $.ajax({
        type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
        url         : '<?=$base_url?>/dashboard/getDistrict.php', // the url where we want to POST
        data        : formData, // our data object
        dataType    : 'json', // what type of data do we expect back from the server
        encode      : true
    })
    .done(function(data) {
    	// console.log('getDistrict',data);
    	if (data.length > 0) {
    		var distc = 1;
    		var editdis='';
    		for (let index = 0; index < data.length; index++) {
    			editdis += `<div class="form-check radioChekc">
    			
			  <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault`+distc+`">
			  <span style="display:none;" class="showinput`+distc+`"><input class="radiotext" type="text" id="radiotext`+distc+`"> 
			  <button type="button" class="btn btn-success btn-sm done`+distc+`">Done</button>
			  </span>
			  
			  <span class="checkbox`+distc+`">
			  <label class="form-check-label" for="flexRadioDefault`+distc+`"><span id="districttext`+distc+`">`+data[index]['division']+`</span></label> 
			  
				<span class="editDelete"> 
					<button type="button" class="btn btn-primary btn-sm edit`+distc+`" onclick="editinput('`+distc+`','`+data[index]['id']+`')">Update</button>
					<button type="button" class="btn btn-danger btn-sm delete`+distc+`" 
					onclick="deleteDistric('`+distc+`','`+data[index]['id']+`','`+data[index]['division']+`')">Remove</button>
				</span>
			  
			  </span>
			  <span><i style="display:none;color:#1F8035;" class="fa fa-check-circle complete`+distc+`"></i>
			  <i style="display:none;color:#C82333;" class="fa fa-times close`+distc+`"></i>
			  </span>
			</div> `;
			
			distc ++;
    			// console.log(data[index]['division']);
    		}
    	
    		
    		$('.radioinput').html(editdis)
    	}else{
    		$('.radioinput').html(data);
    		
    	}
    });	
});



	function editinput(inputnum,updateid){
		$('.showMessage').hide();
		$('.complete'+inputnum).hide();
		$('.close'+inputnum).hide();
		// console.log('updateid',updateid);
		$('.checkbox'+inputnum).hide();
		$('.showinput'+inputnum).show();
			var inputval = $('#districttext'+inputnum).html();
		$('#radiotext'+inputnum).val(inputval);
		
		$('.done'+inputnum).on('click',function(){
			var updtval = $('#radiotext'+inputnum).val();
			var formupdateData = {
                'action': 'update',
                'upateid':updateid,
                'updatevalue':updtval
            };
			
			$.ajax({
		        type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
		        url         : '<?=$base_url?>/dashboard/getDistrict.php', // the url where we want to POST
		        data        : formupdateData, // our data object
		        dataType    : 'json', // what type of data do we expect back from the server
		        encode      : true
		    })
		    .done(function(data) {
		    	// console.log(data);
		    	$('.showMessage').show();
		    	$('.showMessage').addClass('successMsg');
	    		$('.showMessage').html('`'+updtval+'`'+' District Updated');
	    		
				$('.checkbox'+inputnum).show();
				$('.showinput'+inputnum).hide();
				$('#districttext'+inputnum).html(updtval);

		    	if(data == 'not'){
		    		$('.close'+inputnum).show();
		    		
		    	}else{
		    		$('.complete'+inputnum).show();
		    		var distroptionup = '';
		    		distroptionup += '<option value="-"disabled selected>-</option>';
					for (let index = 0; index < data.length; index++) {
						distroptionup += '<option value="'+data[index]['division']+'" >'+data[index]['division']+'</option>';
					}
					$('#teamDivision').html(distroptionup);
					// console.log('distroptionup',distroptionup);
		    	}
				
					
					
		    });	
		 	
		});	
	}
	
	
	function deleteDistric(deltnum,deleteid,deletevalue){
		if (confirm('Are you sure you want to remove this " '+deletevalue+' " District ?')) {
		  // Save it!
		 
			var formdeleteData = {
	            'action': 'delete',
	            'deleteid':deleteid
	        };
	        
	    	$.ajax({
		        type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
		        url         : '<?=$base_url?>/dashboard/getDistrict.php', // the url where we want to POST
		        data        : formdeleteData, // our data object
		        dataType    : 'json', // what type of data do we expect back from the server
		        encode      : true
		    })
	        .done(function(data) {
	        	// console.log('deleteDistric',data);
	    		$('.showMessage').addClass('successMsg');
	    		$('.showMessage').html('`'+deletevalue+'`'+' District Deleted');
	        	
		    		
		    		var distc = 1;
		    		var addDist = '';
		    		for (let index = 0; index < data.length; index++) {
						addDist += `<div class="form-check radioChekc">
								  <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault`+distc+`">
								  <span style="display:none;" class="showinput`+distc+`"><input class="radiotext" type="text" id="radiotext`+distc+`"> 
								  <button type="button" class="btn btn-success btn-sm done`+distc+`">Done</button>
								  </span>
								  
								  <span class="checkbox`+distc+`">
								  <label class="form-check-label" for="flexRadioDefault`+distc+`"><span id="districttext`+distc+`">`+data[index]['division']+`</span></label> 
								  
									<span class="editDelete"> 
										<button type="button" class="btn btn-primary btn-sm edit`+distc+`" onclick="editinput('`+distc+`','`+data[index]['id']+`')">Update</button>
										<button type="button" class="btn btn-danger btn-sm delete`+distc+`" 
										onclick="deleteDistric('`+distc+`','`+data[index]['id']+`','`+data[index]['division']+`')">Remove</button>
									</span>
								  
								  </span>
								  <span><i style="display:none;color:#1F8035;" class="fa fa-check-circle complete`+distc+`"></i>
								  <i style="display:none;color:#C82333;" class="fa fa-times close`+distc+`"></i>
								  </span>
								</div> `;
					
					distc ++;
		    			// console.log(data[index]['division']);
		    		}
		    		$('.radioinput').html(addDist);
		    		
		    		var distroptionupadd = '';
			    		distroptionupadd += '<option value="-"disabled selected>-</option>';
						for (let index = 0; index < data.length; index++) {
							distroptionupadd += '<option value="'+data[index]['division']+'" >'+data[index]['division']+'</option>';
						}
						$('#teamDivision').html(distroptionupadd);
		    		
	        });
			// console.log('Thing was saved to the database.');
		} 
        
	}
	
</script>


