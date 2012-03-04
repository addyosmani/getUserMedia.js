
//jQuery like document ready.
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


	//Success and error
	function success(stream) {

		if(this.context === 'webrtc'){
		    var video = this.el;
		    var vendorURL = window.URL || window.webkitURL;
			video.src = vendorURL? vendorURL.createObjectURL(stream) : stream;

			video.onerror = function () {
				stream.stop();
				streamError();
			};
			//document.getElementById('splash').hidden = true;
			//document.getElementById('app').hidden = false;
		}else{
			//flash context
			//do something related to the flash fallback
		}

	}

	function deviceError( error ) {
		document.getElementById('errorMessage').textContent = 'No camera available.';
		//console.error('An error occurred: [CODE ' + error.code + ']');
	}

	getUserMedia('webcam', options, success, deviceError);


});
