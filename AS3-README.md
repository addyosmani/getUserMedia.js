# Action Script 3 Readme

Built with Adobe Flash Builder 4.5 for Eclipse.
Used Flex SDK 4.5 .

added a new function in getUserMedia.js which allows to send various parameters to actionscript3 

for this purpose you can add "fallbackmode" variable to the options. giving this variable the value "size" will send width and height to as3.
if you dont define a fallbackmode the webcamobject can be used just as before. 

fallback tested and working on IE9 and IE10. (additionally to FF, safari and chrome)
