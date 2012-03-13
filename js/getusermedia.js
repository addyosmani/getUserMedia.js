/* getUserMedia - v0.3
 * http://addyosmani.com
 * Copyright (c) 2012 Addy Osmani; Licensed MIT, GPL */

getUserMedia = function (options, successCallback, errorCallback) {

	navigator.getUserMedia_ = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

	// detect if {video: true} or "video" style options
  // by creating an iframe and blowing it up
  // style jacked from @kangax
  // taken here from @miketaylr: //gist.github.com/f2ac64ed7fc467ccdfe3
	var optionStyle = (function (win) {

	  var el = document.createElement('iframe'),
	  root = document.body || document.documentElement,
	  string = true, object = true, nop = function(){};
	  root.appendChild(el);

	  var f = win.frames[win.frames.length-1];

	  f.navigator.getUserMedia || (f.navigator.getUserMedia = f.navigator.webkitGetUserMedia || f.navigator.mozGetuserMedia || f.navigator.msGetUserMedia);

	  try { // Try spec (object) syntax
	    f.navigator.getUserMedia({video: true, audio: true}, nop);
	  } catch (e) {
	    object = false;
	    try { // Try string syntax
	      f.navigator.getUserMedia("video, audio", nop);
	    } catch (e) { // Neither supported
	      string = false;
	    }
	  } finally { // Clean up
	    root.removeChild(el);
	    el = null;
	  }

	  return { string: string, object: object }
	  
	}(window));

	if (!! navigator.getUserMedia_ ) {

		if( !optionStyle.string && !optionStyle.object ) {
      return undefined;
    }

    var getUserMediaOptions = undefined;
    if( optionStyle.string ) {
    	if( options.video && options.audio )
      	getUserMediaOptions = 'video, audio';
      else if( options.video )
      	getUserMediaOptions = 'video';
     	else if( options.audio )
      	getUserMediaOptions = 'audio';
    } else if( optionStyle.object ) {
    	if( options.video )
      	getUserMediaOptions.video = true;
     	if( options.audio )
      	getUserMediaOptions.audio = true;
    }

		var container, temp, video, ow, oh;

		container = document.getElementById(options.el);
		temp = document.createElement('video');

		// Fix for ratio
		ow = parseInt(container.offsetWidth);
		oh = parseInt(container.offsetHeight);
		if(options.width < ow && options.height < oh){
			options.width = ow;
			options.height = oh;
		}

		temp.width = options.width;
		temp.height = options.height;
		temp.autoplay = true;
		container.appendChild(temp);
		video = temp;
		options.videoEl = video;
		options.context = 'webrtc';

		navigator.getUserMedia_(getUserMediaOptions, successCallback, errorCallback);

	} else {
		// fallback to flash
		var source, el, cam;

		source = '<object id="XwebcamXobjectX" type="application/x-shockwave-flash" data="' + options.swffile + '" width="' + options.width + '" height="' + options.height + '"><param name="movie" value="' + options.swffile + '" /><param name="FlashVars" value="mode=' + options.mode + '&amp;quality=' + options.quality + '" /><param name="allowScriptAccess" value="always" /></object>';
		el = document.getElementById(options.el);
		el.innerHTML = source;

		(_register = function (run) {

			cam = document.getElementById('XwebcamXobjectX');

			if (cam.capture !== undefined) {

				/* Simple callback methods are not allowed :-/ */
				options.capture = function (x) {
					try {
						return cam.capture(x);
					} catch (e) {}
				}
				options.save = function (x) {
					try {
						return cam.save(x);
					} catch (e) {}
				}
				options.setCamera = function (x) {
					try {
						return cam.setCamera(x);
					} catch (e) {}
				}
				options.getCameraList = function () {
					try {
						return cam.getCameraList();
					} catch (e) {}
				}

				//options.onLoad();
				options.context = 'flash';
				options.onLoad = successCallback;

			} else if (0 == run) {
				//options.debug("error", "Flash movie not yet registered!");
				errorCallback();
			} else {
				/* Flash interface not ready yet */
				window.setTimeout(_register, 1000 * (4 - run), run - 1);
			}
		})(3);

	}
}