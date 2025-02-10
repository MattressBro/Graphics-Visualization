"use strict";

// Declare global variables
var canvas;
var gl;
var shaderProgram;
var programInfo;
var buffers;

// Initialize WebGL context and shaders
function init() {
    // Get the canvas element
    canvas = document.getElementById('glcanvas');
    // Initialize the WebGL context
    gl = canvas.getContext('webgl');

    // If WebGL is not available, alert the user
    if (!gl) { alert("WebGL isn't available"); }

    // Vertex shader source code
    var vsSource = `
        attribute vec4 aVertexPosition;
        void main(void) {
            gl_Position = aVertexPosition;
        }
    `;

    // Fragment shader source code
    var fsSource = `
        precision mediump float;
        uniform vec4 uColor;
        void main(void) {
            gl_FragColor = uColor;
        }
    `;

    // Initialize the shader program
    shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        },
        uniformLocations: {
            color: gl.getUniformLocation(shaderProgram, 'uColor'),
        },
    };

    // Initialize the buffers
    buffers = initBuffers(gl);

    // Start rendering
    render();
}

// Initialize the shader program
function initShaderProgram(gl, vsSource, fsSource) {
    // Load and compile the vertex shader
    var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    // Load and compile the fragment shader
    var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // Check if the shader program was successfully created
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

// Load and compile a shader
function loadShader(gl, type, source) {
    // Create a new shader
    var shader = gl.createShader(type);
    // Set the shader source code
    gl.shaderSource(shader, source);
    // Compile the shader
    gl.compileShader(shader);

    // Check if the shader was successfully compiled
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// Initialize the buffers
function initBuffers(gl) {
    // Create a buffer for the vertex positions
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Define the positions of the vertices
    var positions = [
        0.4,  0.5,  0.0,
        -0.4,  0.5,  0.2,
        0.0, -0.5,  0.1,
        -0.5, -0.5,  0.1,
        0.5, -0.5,  0.1,
        0.0,  0.0,  0.1
    ];

    // Pass the positions to the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
    };
}

// Draw the scene
function drawScene(gl, programInfo, buffers) {
    // Clear the canvas
    gl.clearColor(0.0, 1.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // Clear the color and depth buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set up the vertex attributes
    var numComponents = 3;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);

    // Use the shader program
    gl.useProgram(programInfo.program);

    // Define the triangles to be drawn
    var triangles = [
        { offset: 0, color: [1.0, 0.0, 0.0, 1.0] },
        { offset: 3, color: [0.0, 0.0, 1.0, 1.0] }
    ];

    // Draw each triangle
    triangles.forEach(triangle => {
        gl.uniform4f(programInfo.uniformLocations.color, ...triangle.color);
        gl.drawArrays(gl.TRIANGLES, triangle.offset, 3);
    });
}

// Render the scene
function render() {
    drawScene(gl, programInfo, buffers);
    requestAnimationFrame(render);
}

// Initialize the application when the window loads
window.onload = init;
