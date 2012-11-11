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

document.getElementById('add-photo').onclick = function(event) {
    event.preventDefault();
    // summon dialog to allow user to take photo or choose photo from library
    window.plugins.actionSheet.create(
        null,
        ['Take Photo', 'Choose Existing', 'Cancel'],
        function(buttonValue, buttonIndex) {
            switch (arguments[1]) {
                case 0:
                    getPhoto(Camera.PictureSourceType.CAMERA);
                    break;
                case 1:
                    getPhoto(Camera.PictureSourceType.PHOTOLIBRARY);
                    break;
            }
        },
        { cancelButtonIndex: 2 }
    ); 
}

document.getElementById('add-item').onclick = function(event) {
    event.preventDefault();
    app.currentText = document.getElementById('new-wish-text').value;
    if (!app.currentImageURI && !app.currentText) return;

    var item = '<div>'
             + '<p>' + app.currentText + '</p>'
             + '<button class="remove-item">remove</button>';
    if (app.currentImageURI) {
        item += '<img src="' + app.currentImageURI + '" class="item-image" />';    
    }
    item += '</div>';

    $('.app').append($(item));
}

$('button.remove-item').live('click', function() {
    $(this).parent().remove();
});

function getPhoto(sourceType) {
    navigator.camera.getPicture(onSuccess, onFail, {
        quality: 50,
        sourceType: sourceType,
        destinationType: Camera.DestinationType.FILE_URI }); 

    function onSuccess(imageURI) {
        app.currentImageURI = imageURI;
        /*var img = document.createElement('img');
        img.setAttribute('src', imageURI);
        img.setAttribute('class', 'item-image');
        document.body.appendChild(img);*/
    }

    function onFail(message) {
        alert('Failed because: ' + message);
    }
}


