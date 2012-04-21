/**
* jQuery webcam
* Copyright (c) 2010, Robert Eisele (robert@xarg.org)
* Dual licensed under the MIT or GPL Version 2 licenses.
* Date: 09/12/2010
*
* @author Robert Eisele
* @version 1.0
*
* @see http://www.xarg.org/project/jquery-webcam-plugin/
**/

import flash.system.Security;
import flash.external.ExternalInterface;
import flash.display.BitmapData;
import JPGEncoder;

class JSCam {

	private static var camera:Camera = null;
	private static var buffer:BitmapData = null;
	private static var quality:Number = 85;
	private static var interval = null;
	private static var stream = null;
	private static var mode = "callback";

	public static function main():Void {

		System.security.allowDomain("*");

		if (_root.mode) {
			mode = _root.mode;
		} else {
			ExternalInterface.call('webcam.debug', "error", "No camera mode present, falling back...");
		}

		if (_root.quality) {
			quality = _root.quality;
		}

		// From: http://www.squidder.com/2009/03/09/trick-auto-select-mac-isight-in-flash/
		var id:Number = -1;
		for (var i = 0, l = Camera.names.length; i < l; i++) {
			if (Camera.names[i] == "USB Video Class Video") {
				id = i;
				break;
			}
		}
		if (id > -1) {
			camera = Camera.get(id);
		} else {
			camera = Camera.get();
		}

		if (null != camera) {

			// http://www.adobe.com/support/flash/action_scripts/actionscript_dictionary/actionscript_dictionary133.html
			camera.onStatus = function(info:Object) {

			    switch (info.code) {
			    case 'Camera.Muted':
				ExternalInterface.call('webcam.debug', "notify", "Camera stopped");
				break;
			    case 'Camera.Unmuted' :
				ExternalInterface.call('webcam.debug', "notify", "Camera started");
				break;
			    }
			}

			camera.setQuality(0, 100);
			camera.setMode(Stage.width, Stage.height, 24, false);

			ExternalInterface.addCallback("capture", null, capture);

			ExternalInterface.addCallback("save", null, save);

			ExternalInterface.addCallback("setCamera", null, setCamera);
			ExternalInterface.addCallback("getCameraList", null, getCameraList);

			_root.attachMovie("clip", "video", 1);
			_root.video.attachVideo(camera);
			_root.video._x = 0;
			_root.video._y = 0;

		} else {
			ExternalInterface.call('webcam.debug', "error", "No camera was detected.");
		}
	}

	public static function capture(time:Number):Boolean {

		if (null != camera) {

			if (null != buffer) {
				return false;
			}

			buffer = new BitmapData(Stage.width, Stage.height);
			ExternalInterface.call('webcam.debug', "notify", "Capturing started.");

			if ("stream" == mode) {
				_stream();
				return true;
			}

			if (!time) {
				time = -1;
			} else if (time > 10) {
				time = 10;
			}

			_capture(time + 1);

			return true;
		}
		return false;
	}

	private static function _capture(time:Number):Void {

		if (null != interval) {
			clearInterval(interval);
		}

		if (0 == time) {
			buffer.draw(_root.video);
			ExternalInterface.call('webcam.onCapture');
			ExternalInterface.call('webcam.debug', "notify", "Capturing finished.");
		} else {
			ExternalInterface.call('webcam.onTick', time - 1);
			interval = setInterval(_capture, 1000, time - 1);
		}
	}

	public static function getCameraList():Array {

		var list = new Array();

		for (var i = 0, l = Camera.names.length; i < l; i++) {
			list[i] = Camera.names[i];
		}
		return list;
	}

	public static function setCamera(id:Number):Boolean {

		if (0 <= id && id < Camera.names.length) {
			camera = Camera.get(id);
			camera.setQuality(0, 100);
			camera.setMode(Stage.width, Stage.height, 24, false);
			return true;
		}
		return false;
	}

	public static function save(file:String):Boolean {

		if ("stream" == mode) {

			return true;

		} else if (null != buffer) {

			if ("callback" == mode) {

				for (var i = 0; i < 240; ++i) {

					var row = "";
					for (var j=0; j < 320; ++j) {
						row+= buffer.getPixel(j, i);
						row+= ";";
					}
					ExternalInterface.call("webcam.onSave", row);
				}

			} else if ("save" == mode) {

				if (file) {

					var e = new JPGEncoder(quality);

					var sal = {};
					sal.sendAndLoad = XML.prototype.sendAndLoad;
					sal.contentType = "image/jpeg";
					sal.toString = function() {
						return e.encode(JSCam.buffer);
					}

					var doc = new XML();
					doc.onLoad = function(success) {
						ExternalInterface.call("webcam.onSave", "done");
					}

					sal.sendAndLoad(file, doc);
/*
					ExternalInterface.call('webcam.debug', "error", "No save mode compiled in.");
					return false;
*/
				} else {
					ExternalInterface.call('webcam.debug', "error", "No file name specified.");
					return false;
				}

			} else {
				ExternalInterface.call('webcam.debug', "error", "Unsupported storage mode.");
			}

			buffer = null;
			return true;
		}
		return false;
	}

	private static function _stream():Void {

		buffer.draw(_root.video);

		if (null != stream) {
			clearInterval(stream);
		}


		for (var i = 0; i < 240; ++i) {

			var row = "";
			for (var j=0; j < 320; ++j) {
				row+= buffer.getPixel(j, i);
				row+= ";";
			}
			ExternalInterface.call("webcam.onSave", row);
		}

		stream = setInterval(_stream, 10);
	}
}
