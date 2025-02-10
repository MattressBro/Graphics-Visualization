"use strict";

var canvas;
var gl;
var numVertices = 36;
var pointsArray = [];
var colorsArray = [];

var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];

var vertexColors = [
    vec4(0.0, 0.0, 0.0, 1.0), // black
    vec4(1.0, 0.0, 0.0, 1.0), // red
    vec4(1.0, 1.0, 0.0, 1.0), // yellow
    vec4(0.0, 1.0, 0.0, 1.0), // green
    vec4(0.0, 0.0, 1.0, 1.0), // blue
    vec4(1.0, 0.0, 1.0, 1.0), // magenta
    vec4(0.0, 1.0, 1.0, 1.0), // cyan
    vec4(1.0, 1.0, 1.0, 1.0)  // white
];

var near = -1;
var far = 1;
var radius = 1;
var theta = 0.0;
var phi = 0.0;
var dr = 5.0 * Math.PI / 180.0;

var left = -1.0;
var right = 1.0;
var ytop = 1.0;
var bottom = -1.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

function quad(a, b, c, d) {
    pointsArray.push(vertices[a]);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices[b]);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices[c]);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices[a]);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices[c]);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices[d]);
    colorsArray.push(vertexColors[a]);
}

function colorCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorCube();

    var cBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var vBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    // Sliders for viewing parameters

    document.getElementById("depthSlider").onchange = function(event) {
        far = event.target.value / 2;
        near = -event.target.value / 2;
    };

    document.getElementById("radiusSlider").onchange = function(event) {
        radius = event.target.value;
    };

    document.getElementById("thetaSlider").onchange = function(event) {
        theta = event.target.value * Math.PI / 180.0;
    };

    document.getElementById("phiSlider").onchange = function(event) {
        phi = event.target.value * Math.PI / 180.0;
    };

    document.getElementById("heightSlider").onchange = function(event) {
        ytop = event.target.value / 2;
        bottom = -event.target.value / 2;
    };

    document.getElementById("widthSlider").onchange = function(event) {
        right = event.target.value / 2;
        left = -event.target.value / 2;
    };

    // Event listener for the isometric button
    document.getElementById("isometricButton").onclick = function() {
        // Set the camera angles for an isometric view (45 degrees for both theta and phi)
        document.getElementById("thetaSlider").value = 45;  // Set slider to 45 degrees for theta
        document.getElementById("phiSlider").value = 45;    // Set slider to 45 degrees for phi
        document.getElementById("radiusSlider").value = Math.sqrt(0.08); // Set radius to sqrt(2) for isometric view
        // Trigger the change event to update the camera position
        document.getElementById("thetaSlider").dispatchEvent(new Event('change'));
        document.getElementById("phiSlider").dispatchEvent(new Event('change'));
        document.getElementById("radiusSlider").dispatchEvent(new Event('change'));
        // Optionally, update the view immediately (if needed)
        render(); // Re-render to apply isometric view
    };

    document.getElementById("frontViewButton").onclick = function() {
        // Set the camera angles for a front view (theta = 0, phi = 0)
        document.getElementById("thetaSlider").value = 0;  // Set slider to 0 degrees for theta
        document.getElementById("phiSlider").value = 0;    // Set slider to 0 degrees for phi
        document.getElementById("radiusSlider").value = 1; // Set radius to 1 for front view
        // Trigger the change event to update the camera position
        document.getElementById("thetaSlider").dispatchEvent(new Event('change'));
        document.getElementById("phiSlider").dispatchEvent(new Event('change'));
        document.getElementById("radiusSlider").dispatchEvent(new Event('change'));
        // Optionally, update the view immediately (if needed)
        render(); // Re-render to apply front view
    };

    document.getElementById("sideViewButton").onclick = function() {
        // Set the camera angles for a side view (theta = 0, phi = 90 degrees)
        document.getElementById("thetaSlider").value = 0;  // Set slider to 0 degrees for theta
        document.getElementById("phiSlider").value = 90;   // Set slider to 90 degrees for phi
        document.getElementById("radiusSlider").value = 1; // Set radius to 1 for side view
        // Trigger the change event to update the camera position
        document.getElementById("thetaSlider").dispatchEvent(new Event('change'));
        document.getElementById("phiSlider").dispatchEvent(new Event('change'));
        document.getElementById("radiusSlider").dispatchEvent(new Event('change'));
        // Optionally, update the view immediately (if needed)
        render(); // Re-render to apply side view
    };
    document.getElementById("frontViewButton").click();
    render();
};

var render = function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    eye = vec3(radius * Math.sin(phi), radius * Math.sin(theta), radius * Math.cos(phi));
    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    requestAnimFrame(render);
};
