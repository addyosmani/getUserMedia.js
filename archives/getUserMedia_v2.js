/**
* getUserMedia() polyfill
* Copyright (c) 2012, Addy Osmani
* Dual licensed under the MIT or GPL Version 2 licenses.
* Date: 09/12/2010
*
* @specs http://dev.w3.org/2011/webrtc/editor/getusermedia.html
**/

/*

	MediaStreamOptions options
	NavigatorUserMediaSuccessCallback successCallback
	NavigatiorUserMediaErrorCallback errorCallback
*/

//MediaStreamOptions


$(function(){

var options = {
	"audio": true,
	"video": true,

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
	onLoad:	    function () {}  
}


//errorCallback optional
getUserMedia = function( sourceId, options, successCallback, errorCallback){
	
if (navigator.webkitGetUserMedia) {


		if(!(options.audio && options.video)){

			console.log('This mode is not supported: NOT_SUPPORTED_ERR');
			
		}else{

navigator.webkitGetUserMedia('video', gotStream, noStream);

	var holder = document.getElementById(sourceId);

	//previously we just used the sourceId, now we
	//append the video element we need to use to it

	var temp = document.createElement('video');
	temp.autoplay = true;
 	holder.appendChild(temp);
 	var video = temp;


	//var video = document.getElementById('monitor');
	//var canvas = document.getElementById('photo');

	function gotStream(stream) {

		video.src = webkitURL.createObjectURL(stream);
		video.onerror = function () {
			stream.stop();
			streamError();
		};
		document.getElementById('splash').hidden = true;
		document.getElementById('app').hidden = false;
	}

	function noStream() {
		document.getElementById('errorMessage').textContent = 'No camera available.';
	}

	function streamError() {
		document.getElementById('errorMessage').textContent = 'Camera error.';
	}

	function snapshot() {
		/*
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		canvas.getContext('2d').drawImage(video, 0, 0);
		*/
	}

/*
			// assign the <video> to a variable
			// this should be more flexible..perhaps pass in the
			// source directly? That or fall on qSA for other selectors
			var video = document.getElementById(sourceId);

			// navigator.getUserMedia('video')
			navigator.webkitGetUserMedia(options, successCallback, errorCallback);

			// This should probably all be shifted to a cleaner object literal
			successCallback = function( stream ){
				//use stream
				//video.src = stream;
				video.src = window.URL.getObjectURL(stream);
			}

			errorCallback = function( error ){
				console.error('An error occurred: [CODE ' + error.code + ']');
				return;	
			}


			// system should default to the system camera
			// or microphone for the media stream

			// UAs may allow users to use any media source
			// including pre-recorded media files

			// if the user indicates permission for local
			// devices like webcams, an indicator should
			// be displayed
			
			var videoRatio = video.videoWidth / video.videoHeight;
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

				options.onLoad = successCallback;

			    } else if (0 == run) {
				options.debug("error", "Flash movie not yet registered!");
			    } else {
				/* Flash interface not ready yet */
				window.setTimeout(_register, 1000 * (4 - run), run - 1);
			    }
			})(3);

	}
}

//
getUserMedia('webcam', options, function(){
	console.log('success');
});
//

});
