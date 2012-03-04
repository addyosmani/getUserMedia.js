$(function () {

	var pos = 0,
		ctx = null,
		cam = null,
		image = null,
		filter_on = false,
		filter_id = 0,
		canvas = document.getElementById("canvas"),
		ctx = canvas.getContext("2d"),
		img = new Image();


	ctx.clearRect(0, 0, 320, 240);
	image = ctx.getImageData(0, 0, 320, 240);


	window.changeFilter = function () {
		if (filter_on) {
			filter_id = (filter_id + 1) & 7;
		}
	}

	function toggleFilter(obj) {
		if (filter_on = !filter_on) {
			obj.parentNode.style.borderColor = "#c00";
		} else {
			obj.parentNode.style.borderColor = "#333";
		}
	}


	function getSnapshot() {
		if (options.context == 'webrtc') {

			//This needs to be done better.
			//Can't just be golfing the first video element found.
			var video = document.getElementsByTagName('video')[0]; //options.el
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			canvas.getContext('2d').drawImage(video, 0, 0);

		} else {
			webcam.capture();
			changeFilter();
		}
	}

	jQuery('#takeSnapshot').on('click', function (e) {
		e.preventDefault();
		getSnapshot();
	});


	var options = {
		"audio": true,
		"video": true,
		el: "webcam",

		extern: null,
		append: true,

		width: 320,
		height: 240,

		mode: "callback",
		// callback | save | stream
		swffile: "resource/jscam_canvas_only.swf",
		quality: 85,
		context: "",

		debug: function () {},
		onCapture: function () {
			webcam.save();
		},
		onTick: function () {},
		onSave: function (data) {

			var col = data.split(";");
			var img = image;

			for (var i = 0; i < 320; i++) {
				var tmp = parseInt(col[i]);
				img.data[pos + 0] = (tmp >> 16) & 0xff;
				img.data[pos + 1] = (tmp >> 8) & 0xff;
				img.data[pos + 2] = tmp & 0xff;
				img.data[pos + 3] = 0xff;
				pos += 4;
			}

			if (pos >= 4 * 320 * 240) {
				ctx.putImageData(img, 0, 0);
				pos = 0;
			}

		},
		onLoad: function () {}
	}

	window.webcam = options;


	function success(stream) {

		if (options.context === 'webrtc') {

			var video = options.videoEl;
			var vendorURL = window.URL || window.webkitURL;
			video.src = vendorURL ? vendorURL.createObjectURL(stream) : stream;

			video.onerror = function () {
				stream.stop();
				streamError();
			};

		} else {
			//flash context
			console.log('flash loaded');
		}
	}


	function deviceError(error) {
		document.getElementById('errorMessage').textContent = 'No camera available.';
		//console.error('An error occurred: [CODE ' + error.code + ']');
	}

	getUserMedia(options, success, deviceError);


});