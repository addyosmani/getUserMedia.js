/**
* Extension work: Addy Osmani. I want to create a getUserMedia.js polyfill.
* Initial cam plugin by Robert Eisele (robert@xarg.org)
**/

/*
recompiling the flash binaries:
apt-get install swfmill mtasc
vim src/jscam.xml
make
*/
(function ($) {

    var webcam = {

	extern: null, // external select token to support jQuery dialogs
	append: true, // append object instead of overwriting

	width: 320,
	height: 240,

	mode: "callback", // callback | save | stream

	swffile: "resource/jscam.swf",
	quality: 85,

	debug:	    function () {},
	onCapture:  function () {},
	onTick:	    function () {},
	onSave:	    function () {},
	onLoad:	    function () {}    //The onLoad callback is called as soon as the registration of the interface is done
    };

    window.webcam = webcam;

    $.fn.webcam = function(options) {

	if (typeof options === "object") {
	    for (var ndx in webcam) {
		if (options[ndx] !== undefined) {
		    webcam[ndx] = options[ndx];
		}
	    }
	}

	var source = '<object id="XwebcamXobjectX" type="application/x-shockwave-flash" data="'+webcam.swffile+'" width="'+webcam.width+'" height="'+webcam.height+'"><param name="movie" value="'+webcam.swffile+'" /><param name="FlashVars" value="mode='+webcam.mode+'&amp;quality='+webcam.quality+'" /><param name="allowScriptAccess" value="always" /></object>';

	if (null !== webcam.extern) {
	    $(webcam.extern)[webcam.append ? "append" : "html"](source);
	} else {
	    this[webcam.append ? "append" : "html"](source);
	}

	(_register = function(run) {

	    var cam = document.getElementById('XwebcamXobjectX');

	    if (cam.capture !== undefined) {

		/* Simple callback methods are not allowed :-/ */
		webcam.capture = function(x) {
		    try {
			return cam.capture(x);
		    } catch(e) {}
		}
		webcam.save = function(x) {
		    try {
			return cam.save(x);
		    } catch(e) {}
		}
		webcam.setCamera = function(x) {
		    try {
			return cam.setCamera(x);
		    } catch(e) {}
		}
		webcam.getCameraList = function() {
		    try {
			return cam.getCameraList();
		    } catch(e) {}
		}

		webcam.onLoad();
	    } else if (0 == run) {
		webcam.debug("error", "Flash movie not yet registered!");
	    } else {
		/* Flash interface not ready yet */
		window.setTimeout(_register, 1000 * (4 - run), run - 1);
	    }
	})(3);
    }

})(jQuery);
