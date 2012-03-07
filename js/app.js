/* app.js
 * Demo application using getUserMedia() shim
 * Copyright (c) 2012 Addy Osmani; Licensed MIT, GPL */ 

 (function () {
	'use strict';

	var App = {

		init: function () {

			if ( !! this.options) {
				this.pos = 0;
				this.cam = null;
				this.filter_on = false;
				this.filter_id = 0;
				this.canvas = document.getElementById("canvas");
				this.ctx = canvas.getContext("2d");
				this.img = new Image();
				this.ctx.clearRect(0, 0, 320, 240);
				this.image = this.ctx.getImageData(0, 0, 320, 240);
				this.snapshotBtn = document.getElementById('takeSnapshot');
				this.detectBtn = document.getElementById('detectFaces');
				
				getUserMedia(this.options, this.success, this.deviceError);
				window.webcam = this.options;

				this.addEvent('click', this.snapshotBtn, this.getSnapshot);

				this.addEvent('click', this.detectBtn, function () {
					App.drawToCanvas('glasses');
				});

			} else {
				alert('No options were supplied to the shim!')
			}
		},

		addEvent: function (type, obj, fn) {
			if (obj.attachEvent) {
				obj['e' + type + fn] = fn;
				obj[type + fn] = function () {
					obj['e' + type + fn](window.event);
				}
				obj.attachEvent('on' + type, obj[type + fn]);
			} else {
				obj.addEventListener(type, fn, false);
			}
		},

		options: {
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
				window.webcam.save();
			},
			onTick: function () {},
			onSave: function (data) {

				var col = data.split(";");
				var img = App.image;

				for (var i = 0; i < 320; i++) {
					var tmp = parseInt(col[i]);
					img.data[App.pos + 0] = (tmp >> 16) & 0xff;
					img.data[App.pos + 1] = (tmp >> 8) & 0xff;
					img.data[App.pos + 2] = tmp & 0xff;
					img.data[App.pos + 3] = 0xff;
					App.pos += 4;
				}

				if (App.pos >= 4 * 320 * 240) {
					App.ctx.putImageData(img, 0, 0);
					App.pos = 0;
				}

			},
			onLoad: function () {}
		},

		success: function (stream) {

			if (App.options.context === 'webrtc') {

				var video = App.options.videoEl;
				var vendorURL = window.URL || window.webkitURL;
				video.src = vendorURL ? vendorURL.createObjectURL(stream) : stream;

				video.onerror = function () {
					stream.stop();
					streamError();
				};

			} else {
				//flash context
			}
		},


		deviceError: function (error) {
			alert('No camera available.');
			//console.error('An error occurred: [CODE ' + error.code + ']');
		},

		changeFilter: function () {
			if (this.filter_on) {
				this.filter_id = (this.filter_id + 1) & 7;
			}
		},

		toggleFilter: function () {
			if (this.filter_on = !this.filter_on) {
				obj.parentNode.style.borderColor = "#c00";
			} else {
				obj.parentNode.style.borderColor = "#333";
			}
		},

		getSnapshot: function () {
			if (App.options.context === 'webrtc') {

				var video = document.getElementsByTagName('video')[0]; 
				App.canvas.width = video.videoWidth;
				App.canvas.height = video.videoHeight;
				App.canvas.getContext('2d').drawImage(video, 0, 0);

			} else if(App.options.context === 'flash'){

				window.webcam.capture();
				App.changeFilter();
			}
			else{
				alert('No context was supplied to getSnapshot()');
			}
		},

		drawToCanvas: function (effect) {
			var source, glasses, canvas, ctx, pixels, i;

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

				// Selectors 
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

		}

	};

	App.init();

})();


