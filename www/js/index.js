
// start application when PhoneGap is ready
document.addEventListener('deviceready', onDeviceReady, false);

// for testing in browser
if (!navigator.userAgent.match(/(iPhone|iPod|iPad)/)) {
	$(document).ready(onDeviceReady);
}

function onDeviceReady() {
	
	// iScroll 4
	var myScroll = new iScroll('wrapper');
	document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);



	var currentImageURI;

	// add image from "make-wish"
	$('.make-wish .picture-frame').on('click',
		allowUserToAddPicture(
			function(imageURI, context) {
			    currentImageURI = imageURI;
				$(context).find('img').remove();
				$(context).append('<img src="' + currentImageURI + '" />');
			}
		)
	);

	// change image on wishes
	$('.wishes li img').live('click',
		allowUserToAddPicture(
			function(imageURI, context) {
				$(context).attr('src', imageURI);
			}
		)
	);

	function allowUserToAddPicture(onSuccess) {
		
		// communicate with iPhone - get picture
		function getPhoto(sourceType, onSuccessCallback) {
		    navigator.camera.getPicture(onSuccessCallback, onFail, {
		        quality: 50,
		        sourceType: sourceType,
		        destinationType: Camera.DestinationType.FILE_URI }); 
		
		    function onFail(message) {}
		}

		return function(event) {
			
			var _this = this;
			function innerSuccess(imageURI) {
			  onSuccess(imageURI, _this);
			};

		    // for testing in a browser
		    if (!window.plugins || !window.plugins.actionSheet) {
		    	innerSuccess('http://placekitten.com/300/300');
		    	return;
		    }

		    // summon dialog to allow user to take photo or choose photo from library
		    window.plugins.actionSheet.create(
		        null,
		        ['Take Photo', 'Choose Existing', 'Cancel'],
		        function(buttonValue, buttonIndex) {
		        	if (buttonIndex == 0)  {
		        		getPhoto(Camera.PictureSourceType.CAMERA, innerSuccess);
		        	} else if (buttonIndex == 1)  {
		        		getPhoto(Camera.PictureSourceType.PHOTOLIBRARY, innerSuccess);
		        	}
		        },
		        { cancelButtonIndex: 2 }
		    );
		}
	}


	
	// make a wish
	
	$('form.make-wish').submit(function(event) {
	    event.preventDefault();
	    var currentText = $(this).find('textarea').val();
	    if (!currentImageURI && !currentText) return;

		var header = '', text = '';
		if (currentText) {
			var textSections = currentText.split("\n");
			header = textSections[0];
			if (textSections.length > 1) text = textSections.splice(1).join("\n");
			
			if (!currentImageURI) {
				currentImageURI = 'img/placeholder-photo.png';
			}
		}

	    var item = '<li>';
	    if (currentImageURI) {
	        item += '<img src="' + currentImageURI + '" />';    
	    }

	    item += '<div class="description"><h2>' + header + '</h2>'
	    	+ '<p>' + text + '</p></div>'
	        + '<button class="remove"></button>'
	        + '<div style="clear:left;">';
	    
	    item += '</li>';

	    $('.wishes').append($(item));
	    myScroll.refresh();
	    $('.make-wish textarea').val('');
	    currentImageURI = '';
	    $('.make-wish .picture-frame img').remove();
	});



	// revoke wish

	$('.wishes button.remove').live('click', function() {
	    $(this).parent().remove();
	    myScroll.refresh();
	});	
}
