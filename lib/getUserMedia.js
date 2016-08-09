/*global navigator, document */
;(function (window, document) {
    "use strict";

    function isObject(that){
      return that !== null && typeof that === 'object'
    }

    window.getUserMedia = function (options, successCallback, errorCallback) {

        // Options are required
        if (options !== undefined) {

            // getUserMedia() feature detection
            navigator.getUserMedia_ = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

            if ( !! navigator.getUserMedia_) {


                // constructing a getUserMedia config-object and
                // an string (we will try both)
                var option_object = {};
                var option_string = '';
                var getUserMediaOptions, container, temp, video, ow, oh;

                if (options.video === true) {
                    option_object.video = true;
                    option_string = 'video';
                }
                if(isObject(options.video)) {
                  option_object.video = options.video;
                }
                if (options.audio === true) {
                    option_object.audio = true;
                    if (option_string !== '') {
                        option_string = option_string + ', ';
                    }
                    option_string = option_string + 'audio';
                }
                if(isObject(options.audio)) {
                  option_object.audio = options.audio;
                }

                container = document.getElementById(options.el);
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

                // first we try if getUserMedia supports the config object
                try {
                    // try object
                    navigator.getUserMedia_(option_object, successCallback, errorCallback);
                } catch (e) {
                    // option object fails
                    try {
                        // try string syntax
                        // if the config object failes, we try a config string
                        navigator.getUserMedia_(option_string, successCallback, errorCallback);
                    } catch (e2) {
                        // both failed
                        // neither object nor string works
                        return undefined;
                    }
                }
            } else {

                // Act as a plain getUserMedia shield if no fallback is required
                if (options.noFallback === undefined || options.noFallback === false) {

                    // Fallback to flash
                    var source, el, cam;

                    source = '<!--[if IE]>'+
                    '<object id="XwebcamXobjectX" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="' + options.width + '" height="' + options.height + '">'+
                    '<param name="movie" value="' + options.swffile + '" />'+
                    '<![endif]-->'+
                    '<!--[if !IE]>-->'+
                    '<object id="XwebcamXobjectX" type="application/x-shockwave-flash" data="' + options.swffile + '" width="' + options.width + '" height="' + options.height + '">'+
                    '<!--<![endif]-->'+
                    '<param name="FlashVars" value="mode=' + options.mode + '&amp;quality=' + options.quality + '" />'+
                    '<param name="allowScriptAccess" value="always" />'+
                    '</object>';
                    el = document.getElementById(options.el);
                    el.innerHTML = source;


                    (function register(run) {

                        cam = document.getElementById('XwebcamXobjectX');

                        if (cam.capture !== undefined) {

                            // Simple callback methods are not allowed
                            options.capture = function (x) {
                                try {
                                    return cam.capture(x);
                                } catch (e) {}
                            };
                            options.save = function (x) {
                                try {
                                    return cam.save(x);
                                } catch (e) {

                                }
                            };
                            options.setCamera = function (x) {
                                try {
                                    return cam.setCamera(x);
                                } catch (e) {}
                            };
                            options.getCameraList = function () {
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

            }
        }
    };

}(this, document));
