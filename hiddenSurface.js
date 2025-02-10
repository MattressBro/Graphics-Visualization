// Get WebGL context
const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    console.error('WebGL not supported');
}

// Vertex shader program
const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    varying lowp vec4 vColor;
    void main(void) {
        gl_Position = aVertexPosition;
        vColor = aVertexColor;
    }
`;

// Fragment shader program
const fsSource = `
    varying lowp vec4 vColor;
    void main(void) {
        gl_FragColor = vColor;
    }
`;

// Initialize shaders
const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
const programInfo = {
    program: shaderProgram,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
};

// Define the objects with their vertices and colors
const objects = [
    {
        vertices: [
            -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5,
            0.5, 0.5, -0.5,
            -0.5, 0.5, -0.5,
        ],
        color: [1.0, 0.0, 0.0, 1.0],
        depth: -0.5
    },
    {
        vertices: [
            -0.2, -0.2, -0.2,
            0.2, -0.2, -0.2,
            0.2, 0.2, -0.2,
            -0.2, 0.2, -0.2,
        ],
        color: [0.0, 1.0, 0.0, 1.0],
        depth: -0.2
    }
];

// Sort objects by depth
objects.sort((a, b) => a.depth - b.depth);

// Draw the scene
function drawScene(gl, programInfo, objects) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    objects.forEach(object => {
        const buffers = initBuffers(gl, object);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

        gl.useProgram(programInfo.program);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    });
}

// Initialize shaders
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}

// Load shader
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Initialize buffers
function initBuffers(gl, object) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.vertices), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.color), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        color: colorBuffer
    };
}

// Clear to black, fully opaque
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

// Draw the scene
drawScene(gl, programInfo, objects);