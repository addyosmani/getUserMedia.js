/*
	This will all be cleaned up shortly.
	Just rough for experimentation purposes.

	yarp..globals, no namespacing etc etc.
	all will be cleaned up soon.
*/
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



	//can be significantly optimized.
	function drawToCanvas(effect) {
		var source, glasses, canvas, ctx, pixels;

		source = document.querySelector('#canvas');
		glasses = new Image();
		glasses.src = "glasses/i/glasses.png";
		canvas = document.querySelector("#output");
		ctx = canvas.getContext("2d");


		ctx.drawImage(source, 0, 0, 520, 426);

		pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

		// Hipstergram!
		if (effect === 'hipster') {

			for (i = 0; i < pixels.data.length; i = i + 4) {
				pixels.data[i + 0] = pixels.data[i + 0] * 3;
				pixels.data[i + 1] = pixels.data[i + 1] * 2;
				pixels.data[i + 2] = pixels.data[i + 2] - 10;
			}

			ctx.putImageData(pixels, 0, 0);

		}

		// Blur!
		else if (effect === 'blur') {
			stackBlurCanvasRGBA('output', 0, 0, 515, 426, 20);
		}

		// Green Screen
		else if (effect === 'greenscreen') {

			/* Selectors */
			var rmin = $('#red input.min').val();
			var gmin = $('#green input.min').val();
			var bmin = $('#blue input.min').val();
			var rmax = $('#red input.max').val();
			var gmax = $('#green input.max').val();
			var bmax = $('#blue input.max').val();

			// console.log(rmin,gmin,bmin,rmax,gmax,bmax);
			for (i = 0; i < pixels.data.length; i = i + 4) {
				red = pixels.data[i + 0];
				green = pixels.data[i + 1];
				blue = pixels.data[i + 2];
				alpha = pixels.data[i + 3];

				if (red >= rmin && green >= gmin && blue >= bmin && red <= rmax && green <= gmax && blue <= bmax) {
					pixels.data[i + 3] = 0;
				}
			}

			ctx.putImageData(pixels, 0, 0);

		} else if (effect === 'glasses') {
			var comp = ccv.detect_objects({
				"canvas": (canvas),
				"cascade": cascade,
				"interval": 5,
				"min_neighbors": 1
			});

			// Draw glasses on everyone!
			for (i = 0; i < comp.length; i++) {
				ctx.drawImage(glasses, comp[i].x, comp[i].y, comp[i].width, comp[i].height);
			}
		}
		//
	}


	jQuery('#takeSnapshot').on('click', function (e) {
		e.preventDefault();
		getSnapshot();
	});

	jQuery('#enableGlasses').on('click', function (e) {
		e.preventDefault();
		drawToCanvas('glasses');
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
		swffile: "fallback/jscam_canvas_only.swf",
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