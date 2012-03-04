/* getUserMedia - v0.3
 * http://addyosmani.com
 * Copyright (c) 2012 Addy Osmani; Licensed MIT, GPL */

getUserMedia = function (options, successCallback, errorCallback) {

	navigator.getUserMedia_ = navigator.getUserMedia || navigator.webkitGetUserMedia;

	if ( !! navigator.getUserMedia_) {

		if (!(options.audio && options.video)) {

			console.log('This mode is not supported: NOT_SUPPORTED_ERR');

		} else {

			var container, temp, video;

			container = document.getElementById(options.el);
			temp = document.createElement('video');
			temp.width = options.width;
			temp.height = options.height;
			temp.autoplay = true;
			container.appendChild(temp);

			video = temp;
			options.videoEl = video;
			options.context = 'webrtc';

			navigator.getUserMedia_('video', successCallback, errorCallback);

		}
	} else {
		//fallback to flash
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