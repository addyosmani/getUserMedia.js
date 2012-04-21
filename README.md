# getUserMedia.js

A cross-browser shim for getUserMedia()

### Releases
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/addyosmani/getUserMedia.js/master/dist/getUserMedia.min.js
[max]: https://raw.github.com/addyosmani/getUserMedia.js/master/dist/getUserMedia.js

### Screenshot

![Screenshot](http://f.cl.ly/items/3U3m381z0J3L3a1S0o2Y/Screen%20Shot%202012-04-21%20at%2009.50.37.png)

## Getting Started

getUserMedia.js is a cross-browser shim for the [getUserMedia() API](http://dev.w3.org/2011/webrtc/editor/getusermedia.html) (now a part of [WebRTC](http://www.webrtc.org/)) that supports accessing a local camera device from inside the browser. Where WebRTC support is detected, it will use the browser's native ```getUserMedia()``` implementation, otherwise a Flash fallback will be loaded instead.

As you can see in the [demo](http://addyosmani.github.com/getUserMedia.js/face-detection-demo/index.html), what the shim provides is more than enough to create interactive applications that can relay device pixel information on to other HTML5 elements such as the canvas. By relaying, you can easily achieve tasks like capturing images which can be saved, applying filters to the data, or as shown in the demo, even perform tasks like facial detection.

The shim currently works in all modern browsers and IE8.Note that the API for this project is still under development and is currently being tweaked.I may end up refactoring this into a jQuery plugin, but wish to keep it vanilla for the time - being.

##Walkthough

Getting the shim working is fairly straight - forward, but you may be interested in checking out the sample application in `face-detection-demo/demo.html` for further information. First, include the```getusermedia.js```script in your page. Below we're using the minified version built by the grunt.js build process.

```html
<script src="dist/getusermedia.min.js"> </script>
```

Next, define mark-up that we can use as a container for the video stream. Below you'll notice that a simple ```div``` has been opted for (as per our demo). What will happen when we initialize the shim with it is we will either inject a ```video``` tag for use (if WebRTC is enabled) or alternatively an ```object``` tag if the Flash fallback needs to be loaded instead. Whilst most modern browsers will support the ```video``` tag, there is no reason to be using it here if your only interest is relaying the video data for further processing or use elsewhere.

```
<div id="webcam"></div > 
```

Calling the shim is as simple as: ```getUserMedia(options, success, error);``` where```options```is an object containing configuration data, ```success```is a callback executed when the stream is successfully streaming and```error```is a callback for catching stream or device errors.

We use the configuration object(```options``` in the above) to specify details such as the element to be used as a container, (e.g```webcam```), the quality of the fallback image stream(```85```) and a number of additional callbacks that can be further used to trigger behaviour. Callbacks beginning with```on``` in the below example is a Flash - fallback specific callback.If you don 't need to use it, feel free to exclude it from your code. 

```javascript
// options contains the configuration information for the shim
// it allows us to specify the width and height of the video
// output we're working with, the location of the fallback swf,
// events that are triggered onCapture and onSave (for the fallback)
// and so on.
var options = {

			"audio": true,
			"video": true,

			// the element (by id) you wish to apply
			el: "webcam",

			extern: null,
			append: true,

			// height and width of the output stream
			// container

			width: 320,
			height: 240,

			// the recommended mode to be used is 
			'callback '
			// where a callback is executed once data
			// is available
			mode: "callback",

			// the flash fallback Url
			swffile: "fallback/jscam_canvas_only.swf",

			// quality of the fallback stream
			quality: 85,
			context: "",

			debug: function () {},

			// callback for capturing the fallback stream
			onCapture: function () {
				window.webcam.save();
			},
			onTick: function () {},

			// callback for saving the stream, useful for
			// relaying data further.
			onSave: function (data) {},
			onLoad: function () {}
		};
```

Below is a sample ```success``` callback taken from the demo application, where we update the video tag we've injected with the stream data.Note that it 's also possible to capture stream errors by executing calls from within ```video.onerror()``` in the example.

```javascript
		success: function (stream) {
			if (App.options.context === 'webrtc ') {

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
		}
```

At present the ```error``` callback for ```getUserMedia()``` is fairly simple and should be used to inform the user that either WebRTC or Flash were not present or an error was experienced detecting a local device for use.

There are also a number of other interesting snippets in demo.js, such as `getSnapshot()` for capturing snapshots:

```javascript
		getSnapshot: function () {
			// If the current context is WebRTC/getUserMedia (something
			// passed back from the shim to avoid doing further feature
			// detection), we handle getting video/images for our canvas 
			// from our HTML5 <video> element.
			if (App.options.context === 'webrtc') {
				var video = document.getElementsByTagName('video')[0]; 
				App.canvas.width = video.videoWidth;
				App.canvas.height = video.videoHeight;
				App.canvas.getContext('2d').drawImage(video, 0, 0);

			// Otherwise, if the context is Flash, we ask the shim to
			// directly call window.webcam, where our shim is located
			// and ask it to capture for us.
			} else if(App.options.context === 'flash'){
				window.webcam.capture();
				App.changeFilter();
			}
			else{
				alert('No context was supplied to getSnapshot()');
			}
		}
```

##Performance

The shim has been tested on both single-frame captures and live video captures. As expected, native getUserMedia() works absolutely fine when pushing video content to canvas for real-time manipulation. The fallback works fine for single-frame, but as live frame manipulation requires capturing a frame from Flash and mapping it onto canvas every N milliseconds, an observable 'stutter' may be experienced here. I'm working on ways to optimize this further, but for now, as long as you aren't doing anything too intensive, the shim should work fine for a number of use cases.


##Credits

* getUserMedia() shim, demos: Addy Osmani
* Flash webcam access implementation: Robert Eisele
* Glasses positoning and filters for demo: Wes Bos

##Browsers

```getUserMedia()``` is natively supported in [Chrome](http://tools.google.com/dlpage/chromesxs)(simply enable experimental `MediaStream` compatibility in `chrome://flags/`) and Opera.next ([Camera build](http://snapshot.opera.com/labs/camera/)). When using the shim, if support isn'
t detected you will be provided a Flash fallback.

##Spec references 

* [http://dev.w3.org/2011/webrtc/editor/getusermedia.html](http://dev.w3.org/2011/webrtc/editor/getusermedia.html)
* [http://dev.w3.org/2011/webrtc/editor/webrtc.html](http://dev.w3.org/2011/webrtc/editor/webrtc.html)


## License
Copyright (c) 2012 addyosmani  
Licensed under the MIT license.
