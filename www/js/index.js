// start application when PhoneGap is ready
document.addEventListener('deviceready', onDeviceReady, false);

// for testing in browser
if (!navigator.userAgent.match(/(iPhone|iPod|iPad)/)) {
    $(document).ready(onDeviceReady);
}

function loadWishes(uuid) {
	$.get(window.server + uuid + '/wishes', function(wishes) {
		
		$('.wishes').html('');
		
		wishes.map(function(data, index) {
			var header = data.header;
			var text = data.text;
			var currentImageURI = data.image;
			
			var wish = '<li>';
			if (currentImageURI) {
			    wish += '<img src="' + currentImageURI + '" />';
			}
			
			wish += '<div class="description"><h2>' + header + '</h2>';
			wish += '<p>' + text + '</p></div>';
			wish += '<button class="remove"></button>';
			wish += '<div style="clear:left;">';
			
			wish += '</li>';
			
			// make remove button work
			wish = $(wish);
			wish.find('button.remove').click(function() {
				$.post(window.server + uuid + '/wishes/' + index, { _method: 'delete' }, function(response) {
					loadWishes(uuid);
				});
			});
			
			// change image on wishes
			wish.find('img').click(
			    allowUserToAddPicture(
			        function(imageURI, context) {
						$.post(window.server + uuid + '/wishes/' + index, { _method: 'put', image: imageURI }, function(response) {
							loadWishes(uuid);
						});
			        }
			    )
			);
			
			$('.wishes').append(wish);
			myScroll.refresh();
		});
	});
}



var myScroll;
function onDeviceReady() {
	
	window.server = 'http://evening-escarpment-5061.herokuapp.com/';
	// for testing in a browser
	if (! window.device) {
		window.device = {
			uuid: 'web-browser'	
		};
		window.server = 'http://localhost:5000/';
	}

	// iScroll 4
	myScroll = new iScroll('wrapper');
    document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

	loadWishes(window.device.uuid);

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
		
		var data = {
			header: header,
			text: text,
			image: currentImageURI
		};
		var url = window.server + device.uuid + '/wishes/';
		$.post(url, data, function(response) {
	        $('.make-wish textarea').val('');
	        currentImageURI = '';
	        $('.make-wish .picture-frame img').remove();
	        
	        loadWishes(device.uuid);
		});
    });
}



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
        }

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
                if (buttonIndex === 0)  {
                    getPhoto(Camera.PictureSourceType.CAMERA, innerSuccess);
                } else if (buttonIndex === 1)  {
                    getPhoto(Camera.PictureSourceType.PHOTOLIBRARY, innerSuccess);
                }
            },
            { cancelButtonIndex: 2 }
        );
    };
}
