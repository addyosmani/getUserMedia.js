/*
  This is a drop-in replacement for jQuery's document.ready/$(function(){}) should
  you wish to use a cross-browser DOMReady solution without opting for a library.

  usage:
  $(function(){
     // your code
  });

  Parts: jQuery project, Diego Perini, Lucent M.
  This version: Addy Osmani
*/

(function( window ) {

        // Define a local copy of $
        var $ = function( callback ){
                readyBound = false;
                $.isReady = false;
                if( typeof callback == 'function' ){
                    DOMReadyCallback = callback;
                }
                bindReady();
        },

                // Use the correct document accordingly with window argument (sandbox)
                document = window.document,

                readyBound = false,

                DOMReadyCallback = function(){},

                // The ready event handler
                DOMContentLoaded;

        // Is the DOM ready to be used? Set to true once it occurs.
        $.isReady = false;

                // Handle when the DOM is ready
        var DOMReady = function() {
                // Make sure that the DOM is not already loaded
                if ( !$.isReady ) {
                        // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
                        if ( !document.body ) {
                                setTimeout( DOMReady, 13 );
                                return;
                        }

                        // Remember that the DOM is ready
                        $.isReady = true;

                        // If there are functions bound, to execute
                                DOMReadyCallback();
                        // Execute all of them
                }
        }// /ready()

        var bindReady = function() {
                if ( readyBound ) {
                        return;
                }

                readyBound = true;

                // Catch cases where $ is called after the
                // browser event has already occurred.
                if ( document.readyState === "complete" ) {
                        DOMReady();
                }

                // Mozilla, Opera and webkit nightlies currently support this event
                if ( document.addEventListener ) {
                        // Use the handy event callback
                        document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

                        // A fallback to window.onload, that will always work
                        window.addEventListener( "load", DOMContentLoaded, false );

                // If IE event model is used
                }
                else if ( document.attachEvent ) {
                        // ensure firing before onload,
                        // maybe late but safe also for iframes
                        document.attachEvent("onreadystatechange", DOMContentLoaded);

                        // A fallback to window.onload, that will always work
                        window.attachEvent( "onload", DOMContentLoaded );

                        // If IE and not a frame
                        // continually check to see if the document is ready
                        var toplevel = false;

                        try {
                                toplevel = window.frameElement == null;
                        } catch(e) {}

                        if ( document.documentElement.doScroll && toplevel ) {
                                doScrollCheck();
                        }
                }
        };// /bindReady()

        // The DOM ready check for Internet Explorer
        var doScrollCheck = function() {
                if ( $.isReady ) {
                        return;
                }

                try {
                        // If IE is used, use the trick by Diego Perini
                        // http://javascript.nwbox.com/IEContentLoaded/
                        document.documentElement.doScroll("left");
                } catch( error ) {
                        setTimeout( doScrollCheck, 1 );
                        return;
                }
                // and execute any waiting functions
                DOMReady();
        }// /doScrollCheck()

        // Cleanup functions for the document ready method
        if ( document.addEventListener ) {
                DOMContentLoaded = function() {
                        document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
                        DOMReady();
                };

        }
        else if ( document.attachEvent ) {
                DOMContentLoaded = function() {
                        // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
                        if ( document.readyState === "complete" ) {
                                document.detachEvent( "onreadystatechange", DOMContentLoaded );
                                DOMReady();
                        }
                };
        }// /if()

        // Expose $ to the global object
        window.$ = $;
})(window);
