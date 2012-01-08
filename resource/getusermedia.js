/**
* getUserMedia.js
* Addy Osmani
**/


;

$(function(){


    var options = {

    el: 'webcam', //'#webcam'
	extern: null, 
	append: true, // append object instead of overwriting

	width: 320,
	height: 240,

	mode: "callback", // callback | save | stream

	swffile: "resource/jscam_canvas_only.swf",
	quality: 85,

	debug:	    function () {},
	onCapture:  function () {},
	onTick:	    function () {},
	onSave:	    function () {},
	onLoad:	    function () {}    //The onLoad callback is called as soon as the registration of the interface is done
    };



    webcam = function(options) {

	var source = '<object id="XwebcamXobjectX" type="application/x-shockwave-flash" data="'+options.swffile+'" width="'+options.width+'" height="'+options.height+'"><param name="movie" value="'+options.swffile+'" /><param name="FlashVars" value="mode='+options.mode+'&amp;quality='+options.quality+'" /><param name="allowScriptAccess" value="always" /></object>';


	// If no library used use qSA or something like:
	 var el = document.querySelectorAll(options.el);
	 el.innerHTML =  source;

	//$(options.el) = source;

		(_register = function(run) {

		    var cam = document.getElementById('XwebcamXobjectX');

		    if (cam.capture !== undefined) {

			/* Simple callback methods are not allowed :-/ */
			options.capture = function(x) {
			    try {
				return cam.capture(x);
			    } catch(e) {}
			}
			options.save = function(x) {
			    try {
				return cam.save(x);
			    } catch(e) {}
			}
			options.setCamera = function(x) {
			    try {
				return cam.setCamera(x);
			    } catch(e) {}
			}
			options.getCameraList = function() {
			    try {
				return cam.getCameraList();
			    } catch(e) {}
			}

			options.onLoad();
		    } else if (0 == run) {
			options.debug("error", "Flash movie not yet registered!");
		    } else {
			/* Flash interface not ready yet */
			window.setTimeout(_register, 1000 * (4 - run), run - 1);
		    }
		})(3);

    }(options);


})();