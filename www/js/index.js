
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



	$('.make-wish .picture-frame').on('click', function(event) {
	    // for testing in a browser
	    if (!window.plugins || !window.plugins.actionSheet) {
	    	onSuccessAddedPhoto('http://placekitten.com/300/300');
	    	return;
	    }

	    // summon dialog to allow user to take photo or choose photo from library
	    window.plugins.actionSheet.create(
	        null,
	        ['Take Photo', 'Choose Existing', 'Cancel'],
	        function(buttonValue, buttonIndex) {
	        	if (buttonIndex == 0)  {
	        		getPhoto(Camera.PictureSourceType.CAMERA, onSuccessAddedPhoto);
	        	} else if (buttonIndex == 1)  {
	        		getPhoto(Camera.PictureSourceType.PHOTOLIBRARY, onSuccessAddedPhoto);
	        	}
	        },
	        { cancelButtonIndex: 2 }
	    );
	});

	$('.wishes li img').live('click', function(event) {
		var self = this;
	    function onSuccessChangedPhoto(imageURI) {
			$(self).attr('src', imageURI);
		}

	    // for testing in a browser
	    if (!window.plugins || !window.plugins.actionSheet) {
	    	onSuccessChangedPhoto('http://placekitten.com/300/300');
	    	return;
	    }

	    // summon dialog to allow user to take photo or choose photo from library
	    window.plugins.actionSheet.create(
	        null,
	        ['Take Photo', 'Choose Existing', 'Cancel'],
	        function(buttonValue, buttonIndex) {
	        	if (buttonIndex == 0)  {
	        		getPhoto(Camera.PictureSourceType.CAMERA, onSuccessChangedPhoto);
	        	} else if (buttonIndex == 1)  {
	        		getPhoto(Camera.PictureSourceType.PHOTOLIBRARY, onSuccessChangedPhoto);
	        	}
	        },
	        { cancelButtonIndex: 2 }
	    );
	});



	$('form.make-wish').submit(function(event) {
	    event.preventDefault();
	    var currentText = $('.make-wish textarea').val();
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
	
	
	$('.wishes button.remove').live('click', function() {
	    $(this).parent().remove();
	    myScroll.refresh();
	});
	
	
	// extracted from getPhoto to allow fallback functionality
	function onSuccessAddedPhoto(imageURI) {
	    currentImageURI = imageURI;
		$('.make-wish .picture-frame img').remove();
		$('.make-wish .picture-frame').append('<img src="' + currentImageURI + '" />');
	}
	
	function getPhoto(sourceType, onSuccessCallback) {
	    navigator.camera.getPicture(onSuccessCallback, onFail, {
	        quality: 50,
	        sourceType: sourceType,
	        destinationType: Camera.DestinationType.FILE_URI }); 
	
	    function onFail(message) {
	        alert('Failed because: ' + message);
	    }
	}
}