A ```getUserMedia()``` shim with a Flash fallback. Currently works cross-browser (Chrome, Opera, Firefox etc) with more testing currently being done to establish IE compatibility. An image capture and data manipulation demo can be found in ```js/app.js``` as demonstrated in ```demo.html```. The actual shim can be found in ```js/getusermedia.js```.


##Credits
* getUserMedia() shim, demos: Addy Osmani
* Flash webcam access implementation: Robert Eisele
* Glasses positoning and filters for demo: Wes Bos

##Browsers

```getUserMedia()``` is natively supported in [Chrome Canary](http://tools.google.com/dlpage/chromesxs)(simply enable experimental MediaStream compatibility in chrome://flags/) and Opera.next ([Camera build](http://snapshot.opera.com/labs/camera/)). When using the shim, if support isn't detected you will be provided a Flash fallback. 

##Documentation

A stable version of the shim was only very recently completed but documentation will be added to the repo (or the wiki) shortly. 

##Spec references

* http://dev.w3.org/2011/webrtc/editor/getusermedia.html
* http://dev.w3.org/2011/webrtc/editor/webrtc.html (broader purpose)



