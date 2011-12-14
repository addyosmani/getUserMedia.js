/**
* getUserMedia() polyfill
* Copyright (c) 2011, Addy Osmani
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
var options = {
	"audio": true,
	"video": true
}


//errorCallback optional
getUserMedia = function( sourceId, options, successCallback, errorCallback){
	
	if(navigator.getUserMedia){

		if(!(options.audio && options.video)){
			console.log('This mode is not supported: NOT_SUPPORTED_ERR');
		}else{

			// assign the <video> to a variable
			// this should be more flexible..perhaps pass in the
			// source directly? That or fall on qSA for other selectors
			var video = document.getElementById(sourceId);

			// navigator.getUserMedia('video')
			navigator.getUserMedia(options, successCallback, errorCallback);

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

		}
	}else{
		//fallback to flash

		//console.log('getUserMedia() is not supported in this browser');
		//return;
	}
}



