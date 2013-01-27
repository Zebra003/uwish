// start application when PhoneGap is ready
document.addEventListener('deviceready', onDeviceReady, false);

// for testing in browser
if (!navigator.userAgent.match(/(iPhone|iPod|iPad)/)) {
    $(document).ready(onDeviceReady);
}

/**
 * given a template id and data HTML will be returned
 */
function render(template, data) {
	var html = $('#' + template).html();
	for (var key in data) {
		html = html.replace(new RegExp('{{' + key + '}}', 'g'), data[key]);
	}
	return html;
}

function renderWishes(wishes) {
	wishes.map(function(data, index) {
		if (! data) return;
		var wish = render('wish', data);
		wish = attach_wish_behaviour(wish, index, window.device.uuid);
		$('.wishes').append(wish);
	});
	myScroll.refresh();
}

function attach_wish_behaviour(wish, index, uuid) {
	// make remove button work
	wish = $(wish);
	wish.find('button.remove').click(function() {
		$(this).parent().transition({ scale: [1, 0], opacity: 0 }, function() {
			$(this).remove();
			myScroll.refresh();
		});
		$.ajax({
			type: 'POST',
			url: window.server + uuid + '/wishes/' + index + '?string-because-we-do-not-know-how-to-clear-the-cache-on-iphone',
			data: { _method: 'delete' },
			success: function(response) {
				// TODO? error handling
			}
		});
	});
	
	// show overlay image on click
	wish.find('img').click(function() {
		var src = $(this).attr('src');
		var dimensions = 'width: ' + $(window).width() + 'px; height: ' + $(window).height() + 'px;';
		var overlay = $('<div class="overlay" style="' + dimensions + '"><img src="' + src + '" /></div>');
		overlay.click(function() {
			$(this).remove();
		})
		$('body').append(overlay);		
	});
	return wish;
}



var storage = window.localStorage;
var myScroll;
var wishes = [];
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


	if (storage.getItem('wishes')) {
		console.log('Loading wishes LOCALLY')
		wishes = JSON.parse(storage.getItem('wishes'));
		renderWishes(wishes);
	} else {
		console.log('Loading wishes from SERVER');
		$.ajax({
			url: window.server + window.device.uuid + '/wishes' + '?string-because-we-do-not-know-how-to-clear-the-cache-on-iphone',
			success: function(receivedWishes) {
				wishes = receivedWishes;
				storage.setItem('wishes', JSON.stringify(wishes));
				renderWishes(wishes);
			}
		});
	}
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

		// for testing
		if (currentText == '  Clear' || currentText == '  clear') {
			console.log('Forcing clear of localStorage.');
			storage.clear();
			$(this).find('textarea').val('');
			return;
		}

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
		var index = wishes.push(data) - 1;
		
		var wish = render('wish', data);
		wish = attach_wish_behaviour(wish, index, device.uuid);
		$('.wishes').append(wish);
		myScroll.refresh();
		myScroll.scrollToElement('li:last-child', 0);
		$(wish).transition({ scale: [1, 0], opacity: 0.0 }, 0);
		$(wish).transition({ scale: [1, 1], opacity: 1.0 });
		
		var url = window.server + device.uuid + '/wishes/' + '?string-because-we-do-not-know-how-to-clear-the-cache-on-iphone';
		$.post(url, data, function(response) {
			$('.make-wish textarea').val('');
			currentImageURI = '';
			$('.make-wish .picture-frame img').remove();
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
