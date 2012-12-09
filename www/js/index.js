/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // `load`, `deviceready`, `offline`, and `online`.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of `this` is the event. In order to call the `receivedEvent`
    // function, we must explicity call `app.receivedEvent(...);`
    onDeviceReady: function() {
        
    }
};

$('.photo').on('click', function(event) {
    event.preventDefault();
    
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
            switch (arguments[1]) {
                case 0:
                    getPhoto(Camera.PictureSourceType.CAMERA, onSuccessAddedPhoto);
                    break;
                case 1:
                    getPhoto(Camera.PictureSourceType.PHOTOLIBRARY, onSuccessAddedPhoto);
                    break;
            }
        },
        { cancelButtonIndex: 2 }
    );
});

$('#thelist li img').live('click', function(event) {
    event.preventDefault();

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
            switch (arguments[1]) {
                case 0:
                    getPhoto(Camera.PictureSourceType.CAMERA, onSuccessChangedPhoto);
                    break;
                case 1:
                    getPhoto(Camera.PictureSourceType.PHOTOLIBRARY, onSuccessChangedPhoto);
                    break;
            }
        },
        { cancelButtonIndex: 2 }
    );
});



function saveItem(event) {
    event.preventDefault();
    app.currentText = $('.new-item textarea').val();
    if (!app.currentImageURI && !app.currentText) return;

	var header = '', text = '';
	if (app.currentText) {
		var textSections = app.currentText.split("\n");
		header = textSections[0];
		if (textSections.length > 1) text = textSections.splice(1).join("\n");
		
		if (!app.currentImageURI) {
			app.currentImageURI = 'img/placeholder-photo.png';
		}
	}

    var item = '<li>';
    if (app.currentImageURI) {
        item += '<img src="' + app.currentImageURI + '" class="item-image" />';    
    }

    item += '<div class="item-text"><h2>' + header + '</h2>'
    	// TODO Perhaps don't show if not present...
    	+ '<p>' + text + '</p></div>'
        + '<button class="remove-item"></button>'
        + '<div style="clear:left;">';
    
    item += '</li>';

    $('#thelist').append($(item));
    myScroll.refresh();
    $('.new-item textarea').val('');
    app.currentImageURI = '';
    $('.photo img').remove();
}

$('form').submit(saveItem);
$('#add-item').click = saveItem;


$('button.remove-item').live('click', function() {
    $(this).parent().remove();
});


// extracted from getPhoto to allow fallback functionality
function onSuccessAddedPhoto(imageURI) {
    app.currentImageURI = imageURI;
	$('.photo img').remove();
	$('.photo').append('<img src="' + app.currentImageURI + '" />');
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
