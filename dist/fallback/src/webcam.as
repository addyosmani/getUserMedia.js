/* JS-Webcam | 2013-FEB-09 | https://github.com/Digigizmo/JS-Webcam
* // Myles Jubb (@Digigizmo)
*
* Rewritten AS3 webcam forked from 
*   => https://github.com/sshilko/jQuery-AS3-Webcam
*
* ------------------------------------------------------------
*/

package {
	
	import flash.net.URLRequest;
	import flash.system.Security;
	import flash.system.SecurityPanel;
	import flash.external.ExternalInterface;
	import flash.display.Sprite;
	import flash.media.Camera;
	import flash.media.Video;
	import flash.media.Sound;
	import flash.display.BitmapData;
	import flash.events.*;
	import flash.utils.ByteArray;
	import flash.utils.Timer;
	import flash.utils.*;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;
	import flash.display.StageQuality;
	import flash.geom.Matrix;
	import flash.geom.Rectangle;
	import com.adobe.images.JPGEncoder;
	import Base64;
	
	public class webcam extends Sprite {
		
		private var settings:Object = {
			bandwidth    : 0,         // max bytes per second - zero prioritises quality
			quality      : 100,       // image & video quality [0-100]
			framerate    : 14,        // frames per second
			mirror       : false,     // flip video horizontally
			smoothing    : false,     // Boolean
			deblocking   : 0,         // Number
			wrapper      : 'webcam',  // JS wrapper name
			width 		 : 320,         // embedded object width
			height 		 : 240,         // embedded object height
			shutterSound : '',        // optional sound file to load
			mode         : "callback"
		}
		private static var interval = null;
		private static var stream = null;
	
		private var cam:Camera      = null; 
		private var cur:String      = '0';  // current cam id
		private var vid:Video       = null;
		private var img:BitmapData  = null;
		private var b64:String      = '';   // last saved image
		private var snd:Sound       = null;
		
		public function webcam():void {
			flash.system.Security.allowDomain("*");
			stage.scaleMode = StageScaleMode.EXACT_FIT;
			stage.quality   = StageQuality.BEST;
			stage.align     = ''; // centre
			settings        = merge(settings, this.loaderInfo.parameters);
			cam = Camera.getCamera();
			
			if(cam != null) {
				if(cam.muted) Security.showSettings(SecurityPanel.PRIVACY);
				if(ExternalInterface.available){
					loadCamera();
					/*var timer:Timer = new Timer(250);
					timer.addEventListener(TimerEvent.TIMER, clientReadyListener);
					timer.start();*/
					
					ExternalInterface.addCallback('capture'      ,	capture	);
					ExternalInterface.addCallback('save'         , save         );
					ExternalInterface.addCallback('play'         , playCam      );
					ExternalInterface.addCallback('pause'        , pauseCam     );
					ExternalInterface.addCallback('setCamera'    , setCamera    );
					ExternalInterface.addCallback('getCameraList', getCameras);
					ExternalInterface.addCallback('getResolution', getResolution);
					ExternalInterface.addCallback('chooseCamera' , chooseCamera );
					ExternalInterface.addCallback('stream'	   , starttimer   );
					if(settings.shutterSound!='')
						snd = new Sound(new URLRequest(settings.shutterSound));
				} else {
					
				}
			} else { 
				error('CAMNOTFOUND');
			}
		} 
		
		private function loadCamera(name:String = '0'):void {
			cam = Camera.getCamera(name);
			cam.addEventListener(StatusEvent.STATUS, cameraStatusListener);
			cam.setMode(stage.stageWidth, stage.stageHeight, settings.framerate);
			cam.setQuality(settings.bandwidth, settings.quality);
			vid = new Video(cam.width, cam.height);
			vid.smoothing = settings.smoothing;
			vid.deblocking = settings.deblocking;
			vid.attachCamera(cam);
			if(!!settings.mirror){
				vid.scaleX = -1;
				vid.x = vid.width + vid.x;
			}
			stage.addChild(vid);
			
		}
		
		private function cameraStatusListener(evt:StatusEvent):void {
			if(!cam.muted) triggerEvent('swfReady');
			else error('CAMDISABLED');
		}
		
		private function triggerEvent(func:String, param:Object = null):Boolean {
			return ExternalInterface.call(settings.wrapper + "." + func, param);
		}
		
		private function error(flag:String = '0'):Boolean {
			return triggerEvent('onError', {'flag':flag});
		}
		
		/*private function clientReadyListener(event:TimerEvent):void {
			if(!!triggerEvent('isClientReady')){
				Timer(event.target).stop();
				ExternalInterface.addCallback('capture'      ,	capture	);
				ExternalInterface.addCallback('save'         , save         );
				ExternalInterface.addCallback('play'         , playCam      );
				ExternalInterface.addCallback('pause'        , pauseCam     );
				ExternalInterface.addCallback('setCamera'    , setCamera    );
				ExternalInterface.addCallback('getCameraList'   , getCameras   );
				ExternalInterface.addCallback('getResolution', getResolution);
				ExternalInterface.addCallback('chooseCamera' , chooseCamera );
				ExternalInterface.addCallback('stream'	   , starttimer   );
			}
		}*/
		public function starttimer():void {
			var asdf:Timer = new Timer(2000);
			asdf.addEventListener(TimerEvent.TIMER, wstream);
			asdf.start();
			
		}
		public function getResolution():Object {
			return { 
				camera : { width: cam.width           , height: cam.height            },
				window : { width: settings.width	  , height: settings.height 	  },
				stage  : { width: stage.stageWidth    , height: stage.stageHeight     }
			};
		}
		
		public function getCameras():Array {
			return Camera.names;
		}
		
		public function setCamera(id:String):Boolean {
			pauseCam();
			loadCamera(id.toString());
			if(!!cam) cur = id.toString();
			return !!cam;
		}
		
		public function chooseCamera():Boolean {
			Security.showSettings(SecurityPanel.CAMERA);
			return true;
		}
		
		public function playCam():Boolean {
			return setCamera(cur);
		}
		
		public function pauseCam():Boolean {
			vid.attachCamera(null);
			return true;
		}
		
		public function capture(time:Number):Boolean {
			var resMode:String = 'window';
			var c:Object = getResolution()['camera'];
			var r:Object = getResolution()[resMode];
			var m:Matrix = new Matrix();
			var f:Number = !!settings.mirror ? -1 : 1;
			
			
			ExternalInterface.call('webcam.debug', "notify", "start of capture().");
			
			
			if (null != cam) {
				ExternalInterface.call('webcam.debug', "notify", "cam found");
				
				if (null != img) {
					ExternalInterface.call('webcam.debug', "notify", "img allready there");
					return false;
				}
				ExternalInterface.call('webcam.debug', "notify", r);
				img = new BitmapData(r.width, r.height);
				ExternalInterface.call('webcam.debug', "notify", "img created");
				//matrix transformation
				if(c.width!=r.width || c.height!=r.height){
					var imgT:BitmapData = new BitmapData(c.width, c.height);
					m.scale(f * r.width / c.width, r.height / c.height);       
				} else {
					m.scale(f * 1, 1);
				}
				if(!!settings.mirror) {
					m.translate(r.width, 0);
				}
				ExternalInterface.call('webcam.debug', "notify", "Capturing started.");
				
				if ("stream" == settings.mode) {
					wstream(m);
					return true;
				}
				
				if (!time) {
					time = -1;
				} else if (time > 10) {
					time = 10;
				}
				
				_capture(time + 1, m);
				
				return true;
			}
			else{
				ExternalInterface.call('webcam.debug', "notify", "cam not initialized");
			}
			return false;
		}
		
		private function _capture(time:Number, mtx):void {
			if (null != interval) {
				clearInterval(interval);
			}
			
			if (time == 0) {
				img.draw(vid, mtx); //doesnt find vid
				ExternalInterface.call('webcam.onCapture');
				ExternalInterface.call('webcam.debug', "notify", "Capturing finished.");
			} else {
				ExternalInterface.call('webcam.onTick', time - 1);
				interval = setInterval(_capture, 1000, time - 1);
			}
		}
		
		public function save(file:String):Boolean {
			if ("stream" == settings.mode) {
				return true;
				
			} else if (null != img) {
				
				if ("callback" == settings.mode) {
					ExternalInterface.call('webcam.debug', "notify", img.height);
					
					ExternalInterface.call('webcam.debug', "notify", img.width);
					
					for (var i = 0; i < img.height; ++i) {
						
						var pictrow = "";
						for(var j = 0; j < img.width; j++)
						{
							pictrow += img.getPixel(j, i);
							pictrow += ";";
						}
						triggerEvent("onSave", pictrow);
						
					}
					
				} else if ("save" == settings.mode) {
					
					if (file) {
						
						var e = new JPGEncoder(settings.quality);
						
						var sal = {};
						sal.sendAndLoad = XML.prototype.sendAndLoad;
						sal.contentType = "image/jpeg";
						sal.toString = function() {
							return e.encode(img);
						}
						
						var doc = new XML();
						doc.onLoad = function(success) {
							triggerEvent("onSave", "done");
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
				
				img = null;
				return true;
			}
			return false;
			
			/*
			if(resMode!='stage' && resMode!='window') resMode = 'camera';
			var c:Object = getResolution()['camera'];
			var r:Object = getResolution()[resMode];
			var m:Matrix = new Matrix();
			var f:Number = !!settings.mirror ? -1 : 1;
			img = new BitmapData(r.width, r.height);
			if(c.width!=r.width || c.height!=r.height){
				var imgT:BitmapData = new BitmapData(c.width, c.height);
				m.scale(f * r.width / c.width, r.height / c.height);       
			} else {
				m.scale(f * 1, 1);
			}
			if(!!settings.mirror) 
				m.translate(r.width, 0);
			img.draw(vid, m);
			if(snd!=null) snd.play();
			pauseCam();
			var byteArray:ByteArray = new JPGEncoder(settings.quality).encode(img);
			var string:String = 'data:image/jpeg;base64,' + Base64.encodeByteArray(byteArray);
			return b64 = string;
			*/
		}
		
		public function wstream(mtx):void{
			var pictrow:String = "";
			
			if (null != stream) {
				clearInterval(stream);
			}
			
			img.draw(vid, mtx);
			
			for(var i = 0; i < img.height; i++)
			{
				for(var j = 0; j < img.width; j++)
				{
					pictrow += img.getPixel(j, i);
					pictrow += ";";
				}
				triggerEvent('onSave', pictrow);
			}
			
			stream = setInterval(wstream, 10);
			/*for(var i = 0; i < img.height; i++)
			{
				color = img.getPixel(rowcount, i);
				picture += color + ";";
				if(i>img.width)
				{
					rowcount = i / img.width;
				}
			}*/
			/*
			for (var i = 0; i < r.height; ++i) {
				var row = "";
				for (var j=0; j < r.width; ++j) {
					row+= img.getPixel(j, i);
					row+= ";";
				}
				triggerEvent('onSave', row);
			}*/
		}
		
		public static function merge(base:Object, overwrite:Object):Object {
			for(var key:String in overwrite) 
				if(overwrite.hasOwnProperty(key)){
					// lazy data type fix
					if(!isNaN(overwrite[key])) base[key] = parseInt(overwrite[key]);
					else if(overwrite[key]==='true') base[key] = true;
					else if(overwrite[key]==='false') base[key] = false;
					else base[key] = overwrite[key];
				}
			return base;
		}
	}
}
