"use strict";

var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var thetaLoc;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );


    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    thetaLoc = gl.getUniformLocation(program, "theta");

    //event listeners for buttons
    document.getElementById( "startButton" ).onclick = function () {
        //theta[axis] += 1.0;
        isAnimating = true;
        //render();
    };
    document.getElementById( "stopButton" ).onclick = function () {
        isAnimating = false;
        stopRender();
        
    };
    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
    };
    var speedInput = document.getElementById("speed");
    if (speedInput) {
        speedInput.oninput = function (event) {
            var speed = parseFloat(event.target.value);
            // Adjust the speed of rotation, mapping 50 to a speed of 1
            rotationSpeed = speed / 10;
        };
    } else {
        console.error('Element with id "speed" not found.');
    }

    render();
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d)
{
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];

    
    var vertexColors = [
        [ 0.5, 0.0, 0.5, 1.0 ],  // purple
        [ 0.0, 0.5, 0.5, 1.0 ],  // teal
        [ 0.5, 0.5, 0.0, 1.0 ],  // olive
        [ 0.5, 0.0, 0.0, 1.0 ],  // maroon
        [ 0.0, 0.5, 0.0, 1.0 ],  // dark green
        [ 0.0, 0.0, 0.5, 1.0 ],  // navy
        [ 0.7, 0.7, 0.7, 1.0 ]   // light grey
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[a]);

    }
}
var isAnimating = false;
var animationFrameId;
var rotationSpeed = 1.0;
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (isAnimating) {
        theta[axis] += rotationSpeed;
    }
    gl.uniform3fv(thetaLoc, theta);

    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);

    animationFrameId = requestAnimFrame(render);
}

function stopRender() {
    isAnimating = false;
    if (animationFrameId) {
        cancelAnimFrame(animationFrameId);
    }
}

document.getElementById("pauseButton").onclick = function () {
    isAnimating = !isAnimating;
    if (isAnimating) {
        render();
    }
};