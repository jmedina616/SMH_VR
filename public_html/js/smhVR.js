// Parameters
// ----------------------------------------------
var WORLD_FACTOR = 1.0;
var USE_RIFT=false;
var OculusRift = {
    // Parameters from the Oculus Rift DK1
    //    hResolution: 1280,
    //    vResolution: 800,
    //    hScreenSize: 0.14976,
    //    vScreenSize: 0.0936,
    //    interpupillaryDistance: 0.064,
    //    lensSeparationDistance: 0.064,
    //    eyeToScreenDistance: 0.041,
    //    distortionK : [1.0, 0.22, 0.24, 0.0],
    //    chromaAbParameter: [ 0.996, -0.004, 1.014, 0.0]
    
    // Parameters from the Oculus Rift DK2
    hResolution: 1920, // <--
    vResolution: 1080, // <--
    hScreenSize: 0.12576, // <--
    vScreenSize: 0.07074, // <--
    interpupillaryDistance: 0.0635, // <--
    lensSeparationDistance: 0.0635, // <--
    eyeToScreenDistance: 0.041,
    distortionK : [1.0, 0.22, 0.24, 0.0],
    chromaAbParameter: [ 0.996, -0.004, 1.014, 0.0]
};

//VIDEO RENDERING

var videoImage, videoImageContext, videoTexture, videoMaterial;
var renderer;
var effect;

// Globals
// ----------------------------------------------
var WIDTH, HEIGHT;
var camera;
var scene;
var deviceO = false;
var mesh;
var controls;
var geometry;
var VIEW_INCREMENT = 2;
var lon = 0, lat = 0, phi = 0, theta = 0, distance = 500;
var onPointerDownPointerX, onPointerDownPointerY, onPointerDownLon, onPointerDownLat;
var isUserInteracting = false;

var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();

function initWebGL() {
    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
    
    scene = new THREE.Scene();                              
    renderer = new THREE.WebGLRenderer({
        'canvas':canvasElement,
        alpha: true, 
        antialias: false, 
        clearColor: 0xffffff, 
        clearAlpha: 1
    } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    
//    OculusRift.hResolution = WIDTH, OculusRift.vResolution = HEIGHT,
//
//    effect = new THREE.OculusRiftEffect( renderer, {
//        HMD:OculusRift, 
//        worldFactor:WORLD_FACTOR
//    } );
//    effect.setSize(WIDTH, HEIGHT );
    
    effect = new THREE.StereoEffect( renderer );
    effect.setSize(WIDTH, HEIGHT );
    
    camera = new THREE.PerspectiveCamera( 78, window.innerWidth / window.innerHeight, 1, 1000);
    camera.rotation.order = "YXZ";
    camera.target = new THREE.Vector3( 0, 0, 0 );
    camera.position.z = 0.1;
    
    geometry = new THREE.BoxGeometry(200, 200, 200);
    geometry.uvsNeedUpdate = true;
    geometry.dynamic = true;
    geometry.applyMatrix(new THREE.Matrix4().makeScale( 1, 1, 1 ));
    
    controls = new THREE.OrbitControls(camera, canvasElement);
    controls.enableDamping = true;
    controls.dampingFactor = 1;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.0;
        
    if(videoElement){
        videoTexture = new THREE.VideoTexture(videoElement);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBFormat;
        videoTexture.generateMipmaps = false;
    
        videoMaterial = new THREE.MeshBasicMaterial( {
            map: videoTexture, 
            overdraw: true, 
            side:THREE.DoubleSide
        } );
        
        var bottom = [        
        // top / right
        new THREE.Vector2(.33195, 0.00199),
        // top / 
        new THREE.Vector2(.3311, .4985),
        // left / bottom
        new THREE.Vector2(0.00109, .4978),
        // left / right
        new THREE.Vector2(0.00090, 0.00370)                   
        ];

        
        var center = [
        // left / bottom
        new THREE.Vector2(0.0015, .5025),
        // right / bottom
        new THREE.Vector2(.3317, .5025),
        // right / top
        new THREE.Vector2(.3317, .9978),
        // left / top
        new THREE.Vector2(0.0012, .9984)
        ];
        
        var left = [
        // left / bottom    
        new THREE.Vector2(.33459, 0.00365),
        // right / bottom
        new THREE.Vector2(.66409, 0.00318),
        //  right / top
        new THREE.Vector2(.66471, .49775),
        //  left / top
        new THREE.Vector2(.33479, .49775)
        ];  
        
        var right = [
        // left / bottom
        new THREE.Vector2(.6682, 0.0021),
        //  right / bottom
        new THREE.Vector2(.9985, 0.0032),  
        //  right / top
        new THREE.Vector2(.9992, .4978),
        //  left / top
        new THREE.Vector2(.669, .4978)                                  
        ];        

        var back = [
        // left / bottom
        new THREE.Vector2(.33610, .504359),
        //  right / bottom
        new THREE.Vector2(.66481, .503359),  
        // right / top
        new THREE.Vector2(.66453, .9978),
        // left / top
        new THREE.Vector2(.3358, .9961)                                  
        ];

        var top = [
        //  bottom / right
        new THREE.Vector2(.66775, .99685),
        //   bottom / left
        new THREE.Vector2(.6685, .5029),  
        //  top / left
        new THREE.Vector2(.9979, .5029),
        //  top / right
        new THREE.Vector2(.9979, .9962)                                  
        ];
        
        geometry.faceVertexUvs[0] = [];    
        geometry.faceVertexUvs[0][0] = [ right[2], right[1], right[3] ];
        geometry.faceVertexUvs[0][1] = [ right[1], right[0], right[3] ];               
        geometry.faceVertexUvs[0][2] = [ left[2], left[1], left[3] ];
        geometry.faceVertexUvs[0][3] = [ left[1], left[0], left[3] ];
        geometry.faceVertexUvs[0][4] = [ top[2], top[1], top[3] ];
        geometry.faceVertexUvs[0][5] = [ top[1], top[0], top[3] ];
        geometry.faceVertexUvs[0][6] = [ bottom[2], bottom[1], bottom[3] ];
        geometry.faceVertexUvs[0][7] = [ bottom[1], bottom[0], bottom[3] ];
        geometry.faceVertexUvs[0][8] = [ back[2], back[1], back[3] ];
        geometry.faceVertexUvs[0][9] = [ back[1], back[0], back[3] ];            
        geometry.faceVertexUvs[0][10] = [ center[2], center[1], center[3] ];
        geometry.faceVertexUvs[0][11] = [ center[1], center[0], center[3] ];
                
        mesh = new THREE.Mesh(geometry, videoMaterial );
        mesh.position.x = 0;
        mesh.position.y = 0;
        mesh.position.z = 1;
                
        lat = Math.max( - 85, Math.min( 85, lat ) );
        phi = THREE.Math.degToRad( 90 - lat );
        theta = THREE.Math.degToRad( lon );
                                                       
        scene.add( mesh );
        
        function setOrientationControls(e) {
            if (!e.alpha) {
                return;
            }
            
            deviceO = true;
            controls.enabled = false;
            controls = new THREE.DeviceOrientationControls(camera);
            controls.connect();
            controls.update();

            //element.addEventListener('click', fullscreen, false);
            window.removeEventListener('deviceorientation', setOrientationControls, true);
        }
                
        window.addEventListener('deviceorientation', setOrientationControls, true);
        window.addEventListener( 'mousedown', onDocumentMouseDown, false );
        window.addEventListener( 'mousemove', onDocumentMouseMove, false );
        window.addEventListener( 'mouseup', onDocumentMouseUp, false );
        window.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
        window.addEventListener( 'MozMousePixelScroll', onDocumentMouseWheel, false);
        
    }

}

function animate() {
    render();
    requestAnimationFrame( animate );
    update(clock.getDelta());       
}
function render() {
    if(renderer.domElement!=canvasElement) // || !videoImage || videoImage.width==0 || videoImage.height==0)
        initWebGL();
    else
    {
        if(USE_RIFT){
            effect.render( scene, camera );
        } else {
            renderer.render(scene, camera); 
        }          
    }
}
function update(dt) {
   
    if(keyboard.pressed("d")){
        camera.setRotateY( camera.getRotateY() - VIEW_INCREMENT );      
    }
    if(keyboard.pressed("a")){
        camera.setRotateY( camera.getRotateY() + VIEW_INCREMENT );
    }
    if(keyboard.pressed("w")){
        if ( camera.getRotateX() < 90 ){ // restrict so they cannot look overhead
            camera.setRotateX( camera.getRotateX() + VIEW_INCREMENT );
        }
    }
    if(keyboard.pressed("s")){
        if ( camera.getRotateX() > -90 ){ // restrict so they cannot look under feet
            camera.setRotateX( camera.getRotateX() - VIEW_INCREMENT );
        }
    }
    if(deviceO){
        controls.update(dt);
    }
}
THREE.PerspectiveCamera.prototype.setRotateX = function( deg ){
    if ( typeof( deg ) == 'number' && parseInt( deg ) == deg ){
        camera.rotation.x = deg * ( Math.PI / 180 );
    }
};
THREE.PerspectiveCamera.prototype.setRotateY = function( deg ){
    if ( typeof( deg ) == 'number' && parseInt( deg ) == deg ){
        camera.rotation.y = deg * ( Math.PI / 180 );
    }
};
THREE.PerspectiveCamera.prototype.setRotateZ = function( deg ){
    if ( typeof( deg ) == 'number' && parseInt( deg ) == deg ){
        camera.rotation.z = deg * ( Math.PI / 180 );
    }
};
THREE.PerspectiveCamera.prototype.getRotateX = function(){
    return Math.round( camera.rotation.x * ( 180 / Math.PI ) );
};
THREE.PerspectiveCamera.prototype.getRotateY = function(){
    return Math.round( camera.rotation.y * ( 180 / Math.PI ) );
};
THREE.PerspectiveCamera.prototype.getRotateZ = function(){
    return Math.round( camera.rotation.z * ( 180 / Math.PI ) );
};

function initGui(){
    window.addEventListener( 'resize', resize, false );
}

function onDocumentMouseDown( event ) {
    var iframe = parent.document.getElementsByTagName('iframe')[0];
    iframe.focus(); 
    event.preventDefault();

    isUserInteracting = true;

    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;

    onPointerDownLon = lon;
    onPointerDownLat = lat;

}
    
function onDocumentMouseMove( event ) {

    if ( isUserInteracting === true ) {

        lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
        lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;

    }

}

function onDocumentMouseUp( event ) {

    isUserInteracting = false;

}
    
function onDocumentMouseWheel( event ) {

    // WebKit

    if ( event.wheelDeltaY ) {

        distance -= event.wheelDeltaY * 0.05;

    // Opera / Explorer 9

    } else if ( event.wheelDelta ) {

        distance -= event.wheelDelta * 0.05;

    // Firefox

    } else if ( event.detail ) {

        distance += event.detail * 1.0;

    }

}

function resize() {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

//    OculusRift.hResolution = WIDTH,
//    OculusRift.vResolution = HEIGHT,
//    effect.setHMD(OculusRift);
    
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
    renderer.setSize( WIDTH, HEIGHT );
    render();
}

function initSMHVR() {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

    initWebGL();
    animate();
    initGui();
};
