window.onload = function() {
    // Initialize WebGL context
    const canvas = document.getElementById("webglCanvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const gl = canvas.getContext("webgl");
    
    // Shader source code
    const vertexShaderSource = `
        attribute vec4 a_position;
        void main() {
            gl_Position = a_position;
        }
    `;
    
    const fragmentShaderSource = `
        precision mediump float;
        void main() {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);  // Red color
        }
    `;
    
    // Compile shaders and link program
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);
    
    gl.useProgram(program);
    
    // Define the triangle vertices for the Chaos Game
    const vertices = new Float32Array([
        -0.6, -0.6,
         0.6, -0.6,
         0.0,  0.6
    ]);
    
    // Create and bind the vertex buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    // Get the attribute location and enable it
    const aPosition = gl.getAttribLocation(program, "a_position");
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);
    
    // Generate the Sierpinski Gasket using the Chaos Game method
    let points = [];
    let currentPoint = [0.0, 0.0]; // Start at the center of the triangle
    
    const verticesArr = [
        [-0.6, -0.6], // Vertex 1
        [0.6, -0.6],  // Vertex 2
        [0.0, 0.6]    // Vertex 3
    ];
    
    const numPoints = 10000; // Number of points to generate
    
    for (let i = 0; i < numPoints; i++) {
        // Choose a random vertex
        const randomVertex = verticesArr[Math.floor(Math.random() * 3)];
        
        // Move halfway between the current point and the chosen vertex
        currentPoint = [
            (currentPoint[0] + randomVertex[0]) / 2,
            (currentPoint[1] + randomVertex[1]) / 2
        ];
        
        points.push(currentPoint[0], currentPoint[1]);
    }
    
    // Create a buffer for the points and draw them
    const pointsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Set the background color (black)
    gl.clear(gl.COLOR_BUFFER_BIT);      // Clear the canvas
    
    gl.drawArrays(gl.POINTS, 0, points.length / 2); // Draw the points as a series of points
    
    // Helper function to create a shader
    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("ERROR compiling shader!", gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    // Helper function to create a shader program
    function createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("ERROR linking program!", gl.getProgramInfoLog(program));
            return null;
        }
        
        return program;
    }
};