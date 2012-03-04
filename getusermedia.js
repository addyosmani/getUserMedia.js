/*
Copyright Addy Osmani 2012
This is ALL work in progress. Please don't use/tweet/etc just yet.
*/


getUserMedia = function( sourceId, options, successCallback, errorCallback){
	
	navigator.getUserMedia_ = navigator.getUserMedia || navigator.webkitGetUserMedia;

	if (!!navigator.getUserMedia_){


		if(!(options.audio && options.video)){

			console.log('This mode is not supported: NOT_SUPPORTED_ERR');
			
		}else{

	var holder = document.getElementById(sourceId);


	// Create a video element for use. We'll
	// be cleaning up the existing div here shortly.
	var temp = document.createElement('video');
	temp.autoplay = true;
 	holder.appendChild(temp);
 	var video = temp;

 	this.el = video;
 	this.context = 'webrtc';
	navigator.getUserMedia_('video', successCallback, errorCallback);

	//var video = document.getElementById('monitor');
	//var canvas = document.getElementById('photo');


/*
	function streamError() {
		document.getElementById('errorMessage').textContent = 'Camera error.';
	}

	function snapshot() {
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		canvas.getContext('2d').drawImage(video, 0, 0);
	}
*/


		}
	}else{
		//fallback to flash

		var source = '<object id="XwebcamXobjectX" type="application/x-shockwave-flash" data="'+options.swffile+'" width="'+options.width+'" height="'+options.height+'"><param name="movie" value="'+options.swffile+'" /><param name="FlashVars" value="mode='+options.mode+'&amp;quality='+options.quality+'" /><param name="allowScriptAccess" value="always" /></object>';

		 var el = document.getElementById(sourceId);
		 el.innerHTML =  source;
		

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

				//options.onLoad();

				this.context = 'flash';
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