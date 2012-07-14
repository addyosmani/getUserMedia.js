/*globals document:true, localStorage:true, navigator: true*/

;(function( window, document ) {
    "use strict";

    window.getUserMedia = function( options, successCallback, errorCallback ) {

        // getUserMedia() feature detection
        navigator.getUserMedia_ = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

        // detect if {video: true} or "video" style options
        // by creating an iframe and blowing it up
        // style jacked from @kangax
        // taken here from @miketaylr: //gist.github.com/f2ac64ed7fc467ccdfe3
        var optionStyle = (function( win ) {

            var el = document.createElement( 'iframe' ),
                root = document.body || document.documentElement,
                string = true,
                object = true,
                nop = function() {},
                f;

            root.appendChild(el);

            try {
                // Try spec (object) syntax
                navigator.getUserMedia_({
                    video: true,
                    audio: true
                }, nop);

            } catch (e) {
                object = false;
                try {
                    // Try string syntax
                    navigator.getUserMedia_("video, audio", nop);
                } catch (e) { // Neither supported
                    string = false;
                }
            } finally { // Clean up
                root.removeChild(el);
                el = null;
            }

            return {
                string: string,
                object: object
            };

        }( window ));

        if ( !!navigator.getUserMedia_ ) {


            var getUserMediaOptions, container, temp, video, ow, oh;

            if ( !optionStyle.string && !optionStyle.object ) {
                return undefined;
            }

            if (optionStyle.string) {
                //canary latest
                    if( options.video && options.audio && optionStyle.object ){
                        getUserMediaOptions = {};
                        getUserMediaOptions.audio = true;
                        getUserMediaOptions.video = true;
                    }
                    else if ( options.video && options.audio ) {
                        getUserMediaOptions = 'video, audio';
                    } else if ( options.video ) {
                        getUserMediaOptions = 'video';
                    } else if ( options.audio ) {
                        getUserMediaOptions = 'audio';
                    }
            } else if ( optionStyle.object ) {

                getUserMediaOptions = {};

                if ( options.video ) {
                    getUserMediaOptions.video = true;
                }
                if ( options.audio ) {
                    getUserMediaOptions.audio = true;
                }
            }

            

            container = document.getElementById( options.el );
            temp = document.createElement('video');

            // Fix for ratio
            ow = parseInt(container.offsetWidth, 10);
            oh = parseInt(container.offsetHeight, 10);

            if (options.width < ow && options.height < oh) {
                options.width = ow;
                options.height = oh;
            }

            // configure the interim video
            temp.width = options.width;
            temp.height = options.height;
            temp.autoplay = true;
            container.appendChild(temp);
            video = temp;

            // referenced for use in your applications
            options.videoEl = video;
            options.context = 'webrtc';

            navigator.getUserMedia_(getUserMediaOptions, successCallback, errorCallback);

        } else {
            // Fallback to flash
            var source, el, cam;

            source = '<object id="XwebcamXobjectX" type="application/x-shockwave-flash" data="' + options.swffile + '" width="' + options.width + '" height="' + options.height + '"><param name="movie" value="' + options.swffile + '" /><param name="FlashVars" value="mode=' + options.mode + '&amp;quality=' + options.quality + '" /><param name="allowScriptAccess" value="always" /></object>';
            el = document.getElementById(options.el);
            el.innerHTML = source;


            (function register(run) {

                cam = document.getElementById('XwebcamXobjectX');

                if (cam.capture !== undefined) {

                    // Simple callback methods are not allowed 
                    options.capture = function(x) {
                        try {
                            return cam.capture(x);
                        } catch (e) {}
                    };
                    options.save = function(x) {
                        try {
                            return cam.save(x);
                        } catch (e) {

                        }
                    };
                    options.setCamera = function(x) {
                        try {
                            return cam.setCamera(x);
                        } catch (e) {}
                    };
                    options.getCameraList = function() {
                        try {
                            return cam.getCameraList();
                        } catch (e) {}
                    };

                    // options.onLoad();
                    options.context = 'flash';
                    options.onLoad = successCallback;

                } else if (run === 0) {
                    // options.debug("error", "Flash movie not yet registered!");
                    errorCallback();
                } else {
                    // Flash interface not ready yet 
                    window.setTimeout(register, 1000 * (4 - run), run - 1);
                }
            }(3));

        }
    };

}(this, document));