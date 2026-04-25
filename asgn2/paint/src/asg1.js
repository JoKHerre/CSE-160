// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_FragColor
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 10;

// Set up actions for the HTML UI elements
function addActionsforHtmlUI() {

  // Button Events (Shape Type)
  document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
  document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderAllShapes(); };
 
  document.getElementById('pointButton').onclick = function() { g_selectedType=POINT }; 
  document.getElementById('triButton').onclick = function() { g_selectedType=TRIANGLE };
  document.getElementById('circleButton').onclick = function() { g_selectedType=CIRCLE };
  
  // Color Slider Events
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });

  // Size Slider Event
  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });

  // Segment Slider Event
  document.getElementById('segmentSlide').addEventListener('mouseup', function() {g_selectedSegments = this.value; });

  // Draw Picture Event
  document.getElementById('drawPicture').onclick = function() {drawPicture();};
}

function main() {

  // Set up canvas and gl variables
  setupWebGL();   

  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsforHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  // canvas.onmousemove = click;
  canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) } } ;

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

function click(ev) {
  // Extract the event click and return it in WebGL coordinates
  let [x,y] = convertCoordinateEventsToGL(ev);

  // Create and store the new point
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
  }
  
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  point.segments = g_selectedSegments;
  g_shapesList.push(point);

  // Draw every shape
  renderAllShapes();
}

function convertCoordinateEventsToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return [x,y];
}

function renderAllShapes() {

  // Check the time at the start of this function
  var startTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {

    g_shapesList[i].render();
  }

  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot");
}

//  Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return
  }
  htmlElm.innerHTML = text;
}

function drawPicture() {
  g_shapesList = [];
  brown = [0.4, 0.25, 0.1, 1];
  leaf_green = [0.1, 0.6, 0.2, 1];
  blue = [0.5,0.8,1,1];
  orange = [1, 0.6, 0.1, 1];
  background = [0.1, 0.1, 0.15, 1];

  function addTri(v, c) {
    let t = new Triangle();
    t.vertices = v;
    t.color = c;
    g_shapesList.push(t);
  }

  // Background
  addTri([-1,-1, -1,1, 1,1], background);
  addTri([-1,-1, 1,1, 1,-1], background);

  // Letter J
  addTri([-0.43,0.2,  -0.5,0.2,  -0.63,0.4], blue);
  addTri([-0.5,0.2,  -0.57,0.2, -0.72,0.4], blue);

  addTri([-0.57,0.2, -0.428,0.2, -0.428,-0.4], blue);
  addTri([-0.57,0.2, -0.57,-0.4, -0.428,-0.4], blue);
  
  addTri([-0.64,-0.6, -0.85,-0.4, -0.428,-0.4], blue);
  addTri([-0.85,-0.2, -0.85,-0.4, -0.71,-0.4], blue);

  addTri([-0.714,-0.5, -0.714,-0.6, -0.78,-0.55], orange);
  addTri([-0.78,-0.55, -0.88,-0.61, -0.714,-0.6], orange);

  addTri([-0.57,-0.5, -0.57,-0.6, -0.5,-0.55], orange);
  addTri([-0.5,-0.55, -0.40,-0.61, -0.57,-0.6], orange);

  addTri([-0.428,0.1, -0.428,-0.1, -0.3,0], orange);

  addTri([-0.435,0,  -0.51,0, -0.51,0.1], [1,1,1,1]);
  addTri([-0.435,0,  -0.48,0, -0.48,0.06], [0,0,0,1]);


  // Letter H
  addTri([0,-0.8, -0.14,-0.8, 0,0.4], brown);
  addTri([-0.14,-0.8, -0.14,0.4, 0,0.4], brown);
  addTri([-0.28,0.2, -0.07,0.6, 0.14,0.2], leaf_green);

  addTri([0.428,-0.8, 0.57,-0.8, 0.57,0.2], brown);
  addTri([0.428,-0.8, 0.428,0.2, 0.57,0.2], brown);
  addTri([0.5,0.4, 0.65,0, 0.35,0 ], leaf_green);
  addTri([0.5,0.2, 0.65,-0.2, 0.35,-0.2], leaf_green);

  addTri([0,-0.4, 0.428,-0.4, 0.428,-0.28], brown);

  renderAllShapes();
}
