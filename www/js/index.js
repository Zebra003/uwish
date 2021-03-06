// start application when PhoneGap is ready
document.addEventListener('deviceready', onDeviceReady, false);

// for testing in browser
if (!navigator.userAgent.match(/(iPhone|iPod|iPad)/)) {
  $(document).ready(onDeviceReady);
}

function generateGUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
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
  wishes.map(function(data) {
    if (! data) return;
    if (data.status == 'pending remove') return;
    var wish = render('wish', data);
    wish = attach_wish_behaviour(wish, data);
    $('.wishes').append(wish);
  });
  myScroll.refresh();
}

function attach_wish_behaviour(htmlWish, wish) {
  // make remove button work
  htmlWish = $(htmlWish);
  htmlWish.find('button.remove').click(function() {
    $(this).parent().transition({ scale: [1, 0], opacity: 0 }, function() {
      $(this).remove();
      myScroll.refresh();
    });
    updateStatus(wish.guid, 'pending remove');
    removeWishOnServer(wish);
  });

  // show overlay image on click
  htmlWish.find('img').click(function() {
    var src = $(this).attr('src');
    var dimensions = 'width: ' + $(window).width() + 'px; height: ' + $(window).height() + 'px;';
    var overlay = $('<div class="overlay" style="' + dimensions + '"><img src="' + src + '" /></div>');
    overlay.click(function() {
      $(this).remove();
    })
    $('body').append(overlay);
  });
  return htmlWish;
}

function addWish(wish) {
  wish.guid = generateGUID();
  wish.status = 'pending add';
  wishes.push(wish);
  storage.setItem('wishes', JSON.stringify(wishes));
  return wish;
}

function updateStatus(guid, status) {
  wishes = JSON.parse(storage.getItem('wishes'));
  for (var i = 0; i < wishes.length; i++) {
    if (wishes[i].guid != guid) continue;
    wishes[i].status = status;
    storage.setItem('wishes', JSON.stringify(wishes));
    return wishes[i];
  }
}

function synchronizePending() {
  var wishes = JSON.parse(storage.getItem('wishes'))
    wishes.filter(function(wish) { return wish.status == 'pending add'; }).map(saveWishOnServer);
  wishes.filter(function(wish) { return wish.status == 'pending remove'; }).map(removeWishOnServer);
}

function saveWishOnServer(wish) {
  var url = window.server + device.uuid + '/wishes/' + '?string-because-we-do-not-know-how-to-clear-the-cache-on-iphone';
  $.post(url, { header: wish.header, text: wish.text, image: wish.image, guid: wish.guid }, function(response) {
    updateStatus(wish.guid, null);
  });
}

function removeWishOnServer(wish) {
  $.ajax({
    type: 'POST',
  url: window.server + device.uuid + '/wishes/' + wish.guid + '?string-because-we-do-not-know-how-to-clear-the-cache-on-iphone',
  data: { _method: 'delete' },
  success: function(response) {

    // remove wish locally
    var newWishes = [];
    for (var i = 0; i < wishes.length; i++) {
      if (wishes[i].guid != wish.guid) newWishes.push(wishes[i]);
    }
    wishes = newWishes;
    storage.setItem('wishes', JSON.stringify(wishes));
    return wish;
  }
  });
}

document.addEventListener('resume', synchronizePending, false);

var storage = window.localStorage;
var myScroll;
var wishes = [];
function onDeviceReady() {
  console.log("onDeviceReady");
  window.server = 'http://evening-escarpment-5061.herokuapp.com/';
  // for testing in a browser
  if (!window.device) {
    window.device = {
      uuid: 'web-browser'
    };
    window.server = 'http://localhost:5100/';
  }

  if (window.device.name === "iPhone Simulator") {
    window.device = {
      uuid: 'simulator'
    };
    window.server = 'http://localhost:5100/';
  }

  // iScroll 4
  myScroll = new iScroll('wrapper');
  document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);


  if (storage.getItem('wishes')) {
    wishes = JSON.parse(storage.getItem('wishes'));
    renderWishes(wishes);
    synchronizePending();
  } else {
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
    data = addWish(data);

    (function renderNewWishToCanvas(data) {
      var htmlWish = render('wish', data);
      htmlWish = attach_wish_behaviour(htmlWish, data);
      $('.wishes').append(htmlWish);
      myScroll.refresh();
      myScroll.scrollToElement('li:last-child', 0);
      $(htmlWish).transition({ scale: [1, 0], opacity: 0.0 }, 0);
      $(htmlWish).transition({ scale: [1, 1], opacity: 1.0 });
    }(data));

    // clear form
    $('.make-wish textarea').val('');
    currentImageURI = '';
    $('.make-wish .picture-frame img').remove();

    saveWishOnServer(data);
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
