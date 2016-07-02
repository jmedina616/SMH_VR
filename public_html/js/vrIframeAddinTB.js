//document.domain="http://localhost:8000/";

var HEAD_LOCATION;
var BG_IMAGE_NAME;
var BG_IMAGE;

var ALL_JS_LOADED = false;

var video_top_angle=0.0; //45;
var video_bottom_angle=180.0; //135;
var video_left_angle=0;
var video_right_angle=360;
var videoElement;
var canvasElement;
var targetElementForOSV;
var uaIndex=navigator.userAgent.search('Chrome/');
//if(uaIndex<0 || parseInt(navigator.userAgent.substring(uaIndex+7).split('.')[0])<35)
if(false)
{
}
else
{
    function loadjscssfiles(filenames, filetype, callback){
        callback=callback||function(){};
        filename=filenames[0];
        var actualCallback;
        if(filenames.length>1)
        {
            nextFilenames=filenames.slice(1);
            actualCallback=function(){
                console.log('loaded js ',filename, 'next: ', nextFilenames);
                loadjscssfiles(nextFilenames, filetype, callback)
            };
        } else actualCallback=callback;
        if (filetype=="js"){ //if filename is a external JavaScript file
            var headTag = document.getElementsByTagName("head")[0];
            var fileref=document.createElement('script');
            fileref.setAttribute("type","text/javascript");
            fileref.setAttribute("src", filename);
            fileref.onload = actualCallback;
            headTag.appendChild(fileref);
        }
        else if (filetype=="css"){ //if filename is an external CSS file
            var headTag = document.getElementsByTagName("head")[0];
            var fileref=document.createElement("link");
            fileref.setAttribute("rel", "stylesheet");
            fileref.setAttribute("type", "text/css");
            fileref.setAttribute("href", filename);
            fileref.onload = actualCallback;
            headTag.appendChild(fileref);
        }
        if (typeof fileref!="undefined"){
    }
    }
	
    function runIfNeeded(){
        if(ALL_JS_LOADED) return;
        ALL_JS_LOADED=true;
        startPanoWrapper();
    }
    loadjscssfiles(['http://mediaplatform.streamingmediahosting.com/html5/html5lib/v2.35//skins/kdark/css/smhVR.css'],'css', false);
    loadjscssfiles(['js/three.js', 'js/OrbitControls.js', "js/DeviceOrientationControls.js", "js/THREEx.KeyboardState.js", "js/Detector.js", 'js/smh_3d_tb.js'],'js', runIfNeeded); 			
	
    function setUpCanvas(){
        try{
            var videoElements = document.getElementsByTagName('video');
            if(videoElements.length==0) return;
            videoElement = videoElements[0];
            if(videoElement){
                videoElement.crossOrigin='Anonymous';
                if(videoElement.parentNode.getElementsByTagName('canvas').length==0){
                    videoElement.style.visibility="hidden";
                    canvasElement=document.createElement('canvas');
                    canvasElement.style.position="absolute";
                    canvasElement.style.left="0";
                    canvasElement.style.top="0";
                    canvasElement.style.width="100%";
                    canvasElement.style.height="100%";
                    canvasElement.style.margin="0";
                    canvasElement.style.padding="0";
                    canvasElement.style.zIndex="1000";
                    canvasElement.autofocus="true";
                    canvasElement.id='customRenderingCanvas';
                    videoElement.parentElement.insertBefore(canvasElement,videoElement);
                }
            }
        }
        catch (e)
        {
            var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
            .split('\n');
            console.log(stack);

            alert(e.message)
        }
    }
	
    function startPanoWrapper(){
        try{
            initSMHVR();
        }
        catch (e)
        {
            var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
            .split('\n');
            console.log(stack);

            alert(e.message)
        }
    }
		
    function vrButtonPlugin ( mwOutsideDelegate ) {
        "use strict";
        var mw=mwOutsideDelegate.delegateTarget;
        mw.PluginManager.add( 'smhVRBtn', mw.KBaseComponent.extend({

            defaultConfig: {
                "align": "right",
                "parent": "controlsContainer",
                "order": 51,
                "showTooltip": true,
                "displayImportance": "high"
            },

            offIconClass: 'smh-vr',
            onIconClass: 'smh-vr',

            enterFullscreenTxt: 'VR mode',
            exitFullscreenTxt: gM( 'mwe-embedplayer-player_closefullscreen' ),
			
            setup: function( embedPlayer ) {
                this.addBindings();
            },
            isSafeEnviornment: function(){
                return mw.getConfig( 'EmbedPlayer.EnableFullscreen' );
            },
            getComponent: function() {
                var _this = this;
                if( !this.$el ) {
                    this.$el = $( '<button />' )
                    .attr( 'title', this.enterFullscreenTxt )
                    .addClass( "btn " + this.offIconClass + this.getCssClass() )
                    .click( function() {
                        USE_RIFT=true;
                        _this.toggleFullscreen();
                    });
                }
                this.setAccessibility(this.$el,this.enterFullscreenTxt);
                return this.$el;
            },
            addBindings: function() {
                var _this = this;
                // Add double click binding
                this.bind('dblclick', function(){
                    _this.toggleFullscreen();
                });
                // Update fullscreen icon
                this.bind('onOpenFullScreen', function() {
                    _this.getComponent().removeClass( _this.offIconClass ).addClass( _this.onIconClass );
                    _this.updateTooltip( _this.exitFullscreenTxt );
                    _this.setAccessibility(_this.$el,_this.exitFullscreenTxt);
                
                });
                this.bind('onCloseFullScreen', function() {
                    _this.getComponent().removeClass( _this.onIconClass ).addClass( _this.offIconClass );
                    _this.updateTooltip( _this.enterFullscreenTxt );
                    _this.setAccessibility(_this.$el,_this.enterFullscreenTxt);
                    USE_RIFT=false;
                });
            },
            toggleFullscreen: function() {
                this.getPlayer().toggleFullscreen();
            }
        }));

    };

    ( function( mw, $ ) {
        "use strict";
        var callback = function(allmutations) {

            // Since allmutations is an array,
            // we can use JavaScript Array methods.
            allmutations.map( function(mr) {
                // Log the type of mutation
                var mt = 'Mutation type: ' + mr.type;
                // Log the node affected.
                mt += 'Mutation target: ' + mr.target;
                //console.log( mt );
                if(mr.target.tagName.toLowerCase()==='video')
                    setUpCanvas();
            });

        },
        mo = new MutationObserver(callback),
        options = {
            // Required, and observes additions
            // or deletion of child nodes
            'childList': true,
            // Observes the addition or deletion
            // of �grandchild� nodes
            'subtree': true
        }

        window.addEventListener("message", receiveMessage, false);

        function receiveMessage(event)
        {
            //if (event.origin !== "http://example.org:8080")
            //  return;
            var curResult=JSON.parse(event.data);
            if('metaData' in curResult)
            {
                video_top_angle=parseFloat(curResult.metaData.TopAngle);
                video_bottom_angle=parseFloat(curResult.metaData.BottomAngle);
                video_left_angle=parseFloat(curResult.metaData.LeftAngle);
                video_right_angle=parseFloat(curResult.metaData.RightAngle);
            } else if ('headTracking' in curResult)
{
                //console.log('head tracking: ', curResult.headTracking);
                HEAD_LOCATION=curResult.headTracking;
            }
        // ...
        }

        mo.observe(document.body, options);
	

        mw.addKalturaConfCheck(function( embedPlayer, callback ) {
            mw.log("ExternalResources:: IframeCustomPluginJs1:: CheckConfig");
            embedPlayer.setKDPAttribute("myCustomPlugin", "foo", "bar");
            targetElementForOSV=embedPlayer;
            embedPlayer.bindHelper("playerReady", setUpCanvas);
            // continue player build out
            callback();
        //embedPlayer.bindHelper("playerReady", setUpCanvas);
        //console.log('embedPlayer',embedPlayer);
        //embedPlayer.bindHelper("onplay", setUpCanvas);
        });
	
    //	nativeEmbedPlayerPid
    })( window.mw, jQuery );

    window.mw.kalturaPluginWrapper(vrButtonPlugin);

}