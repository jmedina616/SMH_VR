console.log('TEEEEEEEEST');

var uaIndex=navigator.userAgent.search('Chrome/');
var KDP_ELEMENT;
var ON_PAGE_ADDIN;
var ENABLE_HEAD_TRACKING=true;

function gotoEntryId(newId)
{
    KALTURA_ENTRYID=newId;
    KDP_ELEMENT.sendNotification ('changeMedia', {
        'entryId':newId
    });
}

//if(uaIndex<0 || parseInt(navigator.userAgent.substring(uaIndex+7).split('.')[0])<35)
if(false)
{
    alert('Unsupported browser ('+navigator.userAgent+').\n'+
        'This plugin currently only supports the latest releases of Google Chrome.\n'+
        'Please upgrade to the latest Dev or Canary versions (at least version 35) of Google Chrome.\n'+
        'The panoramic addin has been disabled. You will see the panoramic source video streaming\n'+
        'in the unmodified Kaltura player');
}
else
{
    //Function from http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml
    var loadjscssfiles=function (filenames, filetype, callback){
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
            var fileref=document.createElement('script');
            fileref.setAttribute("type","text/javascript");
            fileref.setAttribute("src", filename);
            fileref.onload = actualCallback;
            document.head.appendChild(fileref);
        }
        else if (filetype=="css"){ //if filename is an external CSS file
            var fileref=document.createElement("link");
            fileref.setAttribute("rel", "stylesheet");
            fileref.setAttribute("type", "text/css");
            fileref.setAttribute("href", filename);
            fileref.onload = actualCallback;
            document.body.appendChild(fileref);
        }
        if (typeof fileref!="undefined")
        {
            document.getElementsByTagName("head")[0].appendChild(fileref);
            document.body.appendChild(fileref);
        }
    };
	

    function handleheadtrackrStatusEvent(event) {
    //console.log(event.status);
    }

    function handleFaceTrackingEvent(e){
    //console.log('face tracked: ', e.x, e.y, e.angle, e);
    }

    // requires headPosition : true in Tracker constructor
    function handleHeadTrackingEvent(e){
        //console.log('headtrackingEvent: ', e.x, e.y, e.z, e);
        iframe=document.body.getElementsByTagName('iframe')[0];
        iframe.contentWindow.postMessage(JSON.stringify({
            'headTracking':{
                'x':e.x,
                'y':e.y,
                'z':e.z
            }
        }), "*");
    }
 	
    (function(){
        // This is a generic onPage plugin you will want to subscribe to the ready event: 
        kWidget.addReadyCallback( function( playerId ){
            console.log('TEEEEESSTT');
            var kdp = document.getElementById( playerId );
            KDP_ELEMENT=kdp;
 
            // Here you can check player configuration ( if needed )
            // in this case we are checking if our plugin is enabled
            // For example you may have one uiConf defined onPage plugin resource
            // but turn off a given plugin on a particular with flashvars:
            // flashvars="&fooBar.plugin=false"
 
            // Also keep in mind you could have multiple players on a page. 
//            if( kdp.evaluate( '{streammersion.plugin}' ) ){
//                new panoOnPage( playerId );
//            }
        });
	
	
 
        // There are a few conventions for creating javascirpt pseudo classes 
        //  ( feel free use what you like )
        panoOnPage = function( playerId ){
            ON_PAGE_ADDIN= this.init( playerId );
            return ON_PAGE_ADDIN;
        };
        panoOnPage.prototype = {
            init:function( playerId ){
                this.playerId = playerId;
                this.kdp = document.getElementById( playerId );	
                this.iframe = this.kdp.getElementsByTagName('iframe')[0];
                //this.iframe.focus(); 
                this.addPlayerBindings();
                this.entryId=this.kdp.evaluate("{mediaProxy.entry.id}") || KALTURA_ENTRYID;
            },
            say:function(text){
                var msg = new SpeechSynthesisUtterance(text);
                videoSpeechEngine.abort();
                msg.onend = function(e) {
                //Within iframe use currentState;
                //videoSpeechEngine.start();
                //console.log('Finished in ' + event.elapsedTime + ' seconds.');
                };

                window.speechSynthesis.speak(msg);
            },
            startLoadSpeechCommands:function(){
                self=this;
                if(window.videoSpeechEngine)
                {
                    self.loadSpeechCommands();
                } else {
                    loadjscssfiles(['js/speechEngine.js'],'js', function(){
                        self.loadSpeechCommands()
                    });
                };
            },
            loadSpeechCommands:function(){
                var self=this;
                function buildSpeechCommand(pattern)
                {
                    return function()
                    {	
                        if('goto' in pattern)
                        {
                            gotoEntryId(pattern.goto);
                        }
                        if('say' in pattern)
                        {
                            self.say(pattern.say);
                        }
                    };
                };
                if (videoSpeechEngine) {
                    // Let's define our first command. First the text we expect, and then the function it should call
                    var commands = {
                        'show tps report': function() {
                            alert('Here is the tps report');
                        }
                    };
                    //for (var key in this.customDataList) {
                    //	 var val = this.customDataList[key];
                    //	console.log('metadata key: ',key, ', metadata value: ', val );
                    //};
                    regexCommands={};
                    if('SpeechPattern' in this.customDataList)
                    {
                        var speechPatterns=this.customDataList.SpeechPattern;
                        if (typeof speechPatterns == 'string' || speechPatterns instanceof String)
                            speechPatterns=JSON.parse(speechPatterns);

                        if( !('length' in speechPatterns))
                        {
                            speechPatterns=[speechPatterns];
                        }
                        for(var patternIndex in speechPatterns)
                        {
                            try{                                                                                        
                                var patternString=JSON.stringify(speechPatterns[patternIndex]);
                                var pattern=JSON.parse(patternString);
                                console.log('pattern:',pattern);
                                if('regex' in pattern)
                                {
                                    console.log('installing pattern for :',pattern.regex);
                                    regexCommands[pattern.regex]=buildSpeechCommand(pattern);
                                }
                            } catch(e)
{
                            }
                        }
                    }

                    // Add our commands to annyang
                    console.log('REGEX commands:',regexCommands);
                    videoSpeechEngine.removeCommands();
                    videoSpeechEngine.addRegexCommands(regexCommands);

                // Start listening. You can call this here, or attach this call to an event, button, etc.
                //alert(this.kdp.evaluate('{video.player.kdpState}'));
                //videoSpeechEngine.start();
                }
            },
            metadataLoaded:function (){
                this.customDataList = this.kdp.evaluate('{mediaProxy.entryMetadata}');
                console.log('METADATA LOADED', this.customDataList);
			
                console.log('kdp: ',this.kdp);
                if(KALTURA_ENTRYID in metaDataOverride)
                {
                    this.customDataList=metaDataOverride[KALTURA_ENTRYID];
                    console.log('METADATA OVERRIDDEN', this.customDataList);
                }
                this.iframe.contentWindow.postMessage(JSON.stringify({
                    'metaData':this.customDataList
                }), "*");
                //console.log('loadjscssfiles: ', loadjscssfiles);
                var self=this;
                self.startLoadSpeechCommands();
            //$.each( customDataList, function( key, val ){
            //	console.log('metadata key: ',key, ', metadata value: ', val );
            //})
            },
            startSpeechRecognition:function(){
                videoSpeechEngine.start();
            },
            stopSpeechRecognition:function(){
                videoSpeechEngine.abort();
            },
            sayAfterwards:function() {
                if("SayAfterVideo" in this.customDataList)
                {
                    videoSpeechEngine.abort();
                    this.say(this.customDataList.SayAfterVideo);
                } else
{
            //videoSpeechEngine.start();
            }
            },
            addPlayerBindings:function(){
                try{
                    // you can get flashvar or plugin config via the evaluate calls: 
                    var myCustomFlashVar = this.kdp.evaluate('{configProxy.flashvars.myCustomFlashVar}');
                    // add local listeners ( notice we postfix panoOnPage so its easy to remove just our listeners):
                    var self=this
                    this.kdp.kBind( 'doPlay.panoOnPage', function(){
                        self.onPlay();
                    });
                    //this.kdp.kBind( 'doPlay.panoOnPage', this.onPlay );
                    ;
                    this.kdp.addJsListener( 'metadataReceived', function (){
                        self.metadataLoaded();
                    });
                    this.kdp.addJsListener( 'playerPlayEnd', function (){
                        self.sayAfterwards();
                    });
                    this.kdp.addJsListener( 'playerPaused', function (){
                        //self.startSpeechRecognition();
                        });
                    this.kdp.addJsListener( 'playerPlayed', function (){
                    //self.startSpeechRecognition();
                    });
                //alert('metadata length:'+this.kdp.evaluate('{mediaProxy.entryMetadata}').length )
                //this.metadataLoaded();
                // List of supported listeners across html5 and kdp is available here:
                // http://html5video.org/wiki/Kaltura_KDP_API_Compatibility
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
            },
            onPlay:function(){
                //            this.kdp.sendNotification('doSeek', 10);
                //            this.kdp.sendNotification( 'doPlay' );
                console.log( 'video ' + this.playerId + ' playing');
                // you can read the current time with:
                this.kdp.evaluate('{video.player.currentTime}');
            }
        }
    })();
}