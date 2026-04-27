// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let g_isDragging = false;

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

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
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

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Globals related to UI elements
let g_globalAngleX = 0;
let g_globalAngleY = 0;
let g_leftWingAngle1 = 0;
let g_leftWingAngle2 = 0;
let g_leftWingAngle3 = 0;
let g_rightWingAngle1 = 0;
let g_rightWingAngle2 = 0;
let g_rightWingAngle3 = 0;

let g_leftLegAngle1 = 0;
let g_leftLegAngle2 = 0;
let g_leftLegAngle3 = 0;
let g_rightLegAngle1 = 0;
let g_rightLegAngle2 = 0;
let g_rightLegAngle3 = 0;

let g_leftLegOffsetY = 0;
let g_leftLegOffsetZ = 0;
let g_rightLegOffsetY = 0;
let g_rightLegOffsetZ = 0

let g_leftWingAnimation = true;
let g_rightWingAnimation = true;
let g_leftLegAnimation = true;
let g_rightLegAnimation = true;

let g_bodySway = 0;

let g_pokeAnimation = false;
let g_pokeStartTime = 0;


// Set up actions for the HTML UI elements
function addActionsforHtmlUI() {

  // Button Events
  document.getElementById('animationLeftWingOffButton').onclick = function() {g_leftWingAnimation = false;}
  document.getElementById('animationLeftWingOnButton').onclick = function() {g_leftWingAnimation = true;}

  document.getElementById('animationRightWingOffButton').onclick = function() {g_rightWingAnimation = false;}
  document.getElementById('animationRightWingOnButton').onclick = function() {g_rightWingAnimation = true;}

  document.getElementById('animationLeftLegOffButton').onclick = function() {g_leftLegAnimation = false;}
  document.getElementById('animationLeftLegOnButton').onclick = function() {g_leftLegAnimation = true;}

  document.getElementById('animationRightLegOffButton').onclick = function() {g_rightLegAnimation = false;}
  document.getElementById('animationRightLegOnButton').onclick = function() {g_rightLegAnimation = true;}

  // Joint Slider Events
    // Left Wing
  document.getElementById('leftWingJoint1').addEventListener('mousemove', function() {g_leftWingAngle1 = this.value; renderAllShapes(); });
  document.getElementById('leftWingJoint2').addEventListener('mousemove', function() {g_leftWingAngle2 = this.value; renderAllShapes(); });
  document.getElementById('leftWingJoint3').addEventListener('mousemove', function() {g_leftWingAngle3 = this.value; renderAllShapes(); });
    // Right Wing
  document.getElementById('rightWingJoint1').addEventListener('mousemove', function() {g_rightWingAngle1 = this.value; renderAllShapes(); });
  document.getElementById('rightWingJoint2').addEventListener('mousemove', function() {g_rightWingAngle2 = this.value; renderAllShapes(); });
  document.getElementById('rightWingJoint3').addEventListener('mousemove', function() {g_rightWingAngle3 = this.value; renderAllShapes(); });

    // Left Leg
  document.getElementById('leftLegJoint1').addEventListener('mousemove', function() {g_leftLegAngle1 = this.value; renderAllShapes(); });
  document.getElementById('leftLegJoint2').addEventListener('mousemove', function() {g_leftLegAngle2 = this.value; renderAllShapes(); });
  document.getElementById('leftLegJoint3').addEventListener('mousemove', function() {g_leftLegAngle3 = this.value; renderAllShapes(); });

    // Right Leg
  document.getElementById('rightLegJoint1').addEventListener('mousemove', function() {g_rightLegAngle1 = this.value; renderAllShapes(); });
  document.getElementById('rightLegJoint2').addEventListener('mousemove', function() {g_rightLegAngle2 = this.value; renderAllShapes(); });
  document.getElementById('rightLegJoint3').addEventListener('mousemove', function() {g_rightLegAngle3 = this.value; renderAllShapes(); });

  // Angle Slider Events
  document.getElementById('angleSlideX').addEventListener('mousemove', function() { g_globalAngleX = this.value; renderAllShapes(); });
  document.getElementById('angleSlideY').addEventListener('mousemove', function() { g_globalAngleY = this.value; renderAllShapes(); });
  
}

function main() {

  // Set up canvas and gl variables
  setupWebGL();   

  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsforHtmlUI();


  // Drag controls for camera
  canvas.onmousedown = function(ev) {
    if (ev.shiftKey) {
      g_pokeAnimation = true;
      g_pokeStartTime = g_seconds;
    }

    g_isDragging = true;
  };

  canvas.onmouseup = function(ev) {
    g_isDragging = false;
  }

  canvas.onmousemove = function(ev) {
    if (g_isDragging) {
      g_globalAngleX += ev.movementX * 0.3;
      g_globalAngleY += ev.movementY * 0.3;

      renderAllShapes();
    }
  }
  
  // Specify the color for clearing <canvas>
  gl.clearColor(0.2, 0.2, 0.2, 1.0);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);

  // Render
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

// Called by the browser repeatedly whenever its time
function tick() {
  // Print some debug information so we know we are running
  g_seconds = performance.now()/1000.0-g_startTime;
  console.log(g_seconds);

  // Update Animation Angles
  updateAnimationAngles();
  updateAnimationLegs();

  // Draw everything
  renderAllShapes();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
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

function updateAnimationAngles() {

  if (g_pokeAnimation) {
    let time = g_seconds - g_pokeStartTime;
    if (time > 1.5) {
      g_pokeAnimation = false;
    } else {
      g_leftWingAngle1  = 40 * Math.sin(time * 20) + 90;
      g_rightWingAngle1 = 40 * Math.cos(time * 20) + 270;
      
      g_leftWingAngle2  = 0;
      g_rightWingAngle2 = 0;

      g_leftWingAngle3  = 0;
      g_rightWingAngle3 = 0;

      g_bodySway = Math.sin(time * 20);
    }
  } else {    
    if (g_leftWingAnimation) {
      g_leftWingAngle1 = 5*Math.sin(2*g_seconds) + 145;
      g_leftWingAngle2 = 15*Math.sin(2*g_seconds);
      g_leftWingAngle3 = 15*Math.sin(2*g_seconds);
    }

    if (g_rightWingAnimation) {
      g_rightWingAngle1 = 5*Math.sin(2*g_seconds)+225;
      g_rightWingAngle2 = 15*Math.sin(2*g_seconds);
      g_rightWingAngle3 = Math.sin(2*g_seconds);
    }

    if (g_leftLegAnimation) {
      g_leftLegAngle1 = 5*Math.sin(2*g_seconds);
      g_leftLegAngle2 = 5*Math.sin(2*g_seconds);
      g_leftLegAngle3 = 5*Math.sin(2*g_seconds);
    }

    if (g_rightLegAnimation) {
      g_rightLegAngle1 = 5*Math.sin(2*g_seconds + Math.PI);
      g_rightLegAngle2 = 5 *Math.sin(2*g_seconds + Math.PI);
      g_rightLegAngle3 = 5 *Math.sin(2*g_seconds + Math.PI);
    }
  }
}

function updateAnimationLegs(Matrix4) {
  if (g_leftLegAnimation) {
    g_leftLegOffsetY = 0.02 * Math.max(0, Math.sin(2*g_seconds));
    g_leftLegOffsetZ = 0.01 * Math.sin(2*g_seconds);
  }

  if (g_rightLegAnimation) {
    g_rightLegOffsetY = 0.02 * Math.max(0, Math.sin(2*g_seconds + Math.PI));
    g_rightLegOffsetZ = 0.01 * Math.sin(2*g_seconds + Math.PI);
  }
}

function renderAllShapes() {

  // Check the time at the start of this function
  var startTime = performance.now();

  // Pass the matrix to a u_ModelMatrix attribute
  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalAngleX, 0,1,0);
  globalRotMat.rotate(g_globalAngleY, 1,0,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Color variables:
  let white = [0.9,0.9,0.9,1];
  let black = [0.1,0.1,0.1,1];

  // Body
  let lowerBody = new Cube();
  lowerBody.color = black;
  lowerBody.matrix.setTranslate(-0.25, -0.5, 0);
  if (g_pokeAnimation) {
    lowerBody.matrix.translate(0.275, 0.35, 0.2); 
    lowerBody.matrix.rotate(g_bodySway, 0,0,1);
    lowerBody.matrix.translate(-0.275, -0.35, -0.2);
  }
  let bodyLocationMat = new Matrix4(lowerBody.matrix);
  lowerBody.matrix.translate(0.025,0,0.025);
  lowerBody.matrix.scale(0.55,0.7,0.4);

  let lowerBodyWhite = new Cube();
  lowerBodyWhite.matrix = new Matrix4(lowerBody.matrix);
  lowerBodyWhite.color = white;
  lowerBodyWhite.matrix.scale(0.8,1.01,0.8);
  lowerBodyWhite.matrix.translate(0.1,-0.001,-0.001);
  lowerBodyWhite.render();
  lowerBody.render();
  
  let midBody = new Cube();
  midBody.color = black;
  midBody.matrix = new Matrix4(bodyLocationMat);
  midBody.matrix.translate(0.05,0.7,0.05);
  let midBodyLocationMat = new Matrix4(midBody.matrix);
  midBody.matrix.scale(0.5,0.15,0.35);
  midBody.render();

  let midBodyWhite = new Cube();
  midBodyWhite.matrix = new Matrix4(midBody.matrix);
  midBodyWhite.color = white;
  midBodyWhite.matrix.scale(0.8,1.01,0.8);
  midBodyWhite.matrix.translate(0.1,-0.001,-0.001);
  midBodyWhite.render();
  midBody.render();

  let upperBody = new Cube();
  upperBody.matrix = new Matrix4(midBodyLocationMat);
  upperBody.color = black;
  upperBody.matrix.translate(0.05, 0.15, 0.05);
  let upperBodyLocationMat = new Matrix4(upperBody.matrix);
  upperBody.matrix.scale(0.4,0.1,0.275)
  upperBody.render();

  let upperBodyWhite = new Cube();
  upperBodyWhite.matrix = new Matrix4(upperBody.matrix);
  upperBodyWhite.color = white;
  upperBodyWhite.matrix.scale(0.8,1.01,0.8);
  upperBodyWhite.matrix.translate(0.1,-0.001,-0.001);
  upperBodyWhite.render();
  upperBody.render();

  // Head
  let head = new Cube();
  head.color = black;
  head.matrix = new Matrix4(upperBodyLocationMat);
  head.matrix.translate(0.025, 0.1, 0.025);
  let headLocationMat = new Matrix4(head.matrix);
  head.matrix.scale(0.35,0.3,0.25);
  head.render();
  
  let upperBeak = new Cube();
  upperBeak.color = [1,0.6,0,1];
  upperBeak.matrix = new Matrix4(headLocationMat);
  upperBeak.matrix.translate(0.125, 0.1, -0.08);
  upperBeak.matrix.scale(0.1,0.08,0.1);
  upperBeak.matrix.rotate(45,45,0,1);
  upperBeak.render();

  let outerEyeRight = new Cube();
  outerEyeRight.color = [0,0,0,0];
  outerEyeRight.matrix = new Matrix4(headLocationMat);
  outerEyeRight.matrix.translate(0.025, 0.1, -0.01);
  let outerEyeRightLocationMat = new Matrix4(outerEyeRight.matrix);
  outerEyeRight.matrix.scale(0.08,0.1,0.025);
  outerEyeRight.render();

  let innerEyeRight = new Cube();
  innerEyeRight.color = [0,0,1,1];
  innerEyeRight.matrix = new Matrix4(outerEyeRightLocationMat);
  innerEyeRight.matrix.translate(0.015, 0, -0.01);
  innerEyeRight.matrix.scale(0.06,0.08,0.1);
  innerEyeRight.render();

  let outerEyeLeft = new Cube();
  outerEyeLeft.color = [0,0,0,0];
  outerEyeLeft.matrix = new Matrix4(headLocationMat);
  outerEyeLeft.matrix.translate(0.25, 0.1, -0.01);
  let outerEyeLeftLocationMat = new Matrix4(outerEyeLeft.matrix);
  outerEyeLeft.matrix.scale(0.08,0.1,0.025);
  outerEyeLeft.render();

  let innerEyeLeft = new Cube();
  innerEyeLeft.color = [0,0,1,1];
  innerEyeLeft.matrix = new Matrix4(outerEyeLeftLocationMat);
  innerEyeLeft.matrix.translate(0.015, 0, -0.01);
  innerEyeLeft.matrix.scale(0.06,0.08,0.1);
  innerEyeLeft.render();

  // left Wing
  let leftWing = new Cube();
  leftWing.color = black;
  leftWing.matrix = new Matrix4(midBodyLocationMat);
  leftWing.matrix.translate(0.1, 0.12, 0.1);
  leftWing.matrix.rotate(g_leftWingAngle1, 0,0,1);

  let wingMatrixLeft = new Matrix4(leftWing.matrix);
  leftWing.matrix.scale(0.05,0.3,0.2);
  leftWing.render();
  
  let leftWing2 = new Cube();
  leftWing2.color = black;
  leftWing2.matrix = new Matrix4(wingMatrixLeft);
  leftWing2.matrix.translate(0,0.3,0);
  leftWing2.matrix.rotate(g_leftWingAngle2, 0,0,1);

  let wingMatrixLeft2 = new Matrix4(leftWing2.matrix);
  leftWing2.matrix.scale(0.05,0.3,0.2);
  leftWing2.render();

  let leftWingTip = new Pyramid();
  leftWingTip.color = black;
  leftWingTip.matrix = new Matrix4(wingMatrixLeft2);
  leftWingTip.matrix.translate(0,0.3,0);
  leftWingTip.matrix.scale(0.05,0.2,0.2);
  leftWingTip.matrix.rotate(g_leftWingAngle3, 0,0,1);
  leftWingTip.render();

  // right Wing
  let rightWing = new Cube();
  rightWing.color = black;
  rightWing.matrix = new Matrix4(midBodyLocationMat);
  rightWing.matrix.translate(0.45, 0.14, 0.1);
  rightWing.matrix.rotate(g_rightWingAngle1, 0,0,1);

  let wingMatrixRight = new Matrix4(rightWing.matrix);
  rightWing.matrix.scale(0.05,0.3,0.2);
  rightWing.render();

  let rightWing2 = new Cube();
  rightWing2.color = black;
  rightWing2.matrix = new Matrix4(wingMatrixRight);
  rightWing2.matrix.translate(0,0.3,0);
  rightWing2.matrix.rotate(g_rightWingAngle2, 0,0,1);

  let wingMatrixRight2 = new Matrix4(rightWing2.matrix);
  rightWing2.matrix.scale(0.05,0.3,0.2);
  rightWing2.render();

  let rightWingTip = new Pyramid();
  rightWingTip.color = black;
  rightWingTip.matrix = new Matrix4(wingMatrixRight2);
  rightWingTip.matrix.translate(0,0.3,0);
  rightWingTip.matrix.rotate(g_rightWingAngle3, 0,0,1);
  rightWingTip.matrix.scale(0.05,0.2,0.2);
  rightWingTip.render();

  // Right Thigh
  let rightThigh = new Cube();
  rightThigh.color = [0.9,0.9,0.9,1];
  rightThigh.matrix = new Matrix4(bodyLocationMat);
  // rightThigh.matrix.setTranslate(-0.2, -0.6 + g_rightLegOffsetY, 0.1 + g_rightLegOffsetZ);
  rightThigh.matrix.translate(0.1, -0.1 + g_rightLegOffsetY, 0.1 + g_rightLegOffsetZ);

  rightThigh.matrix.rotate(g_rightLegAngle1, 1,0,0);

  let rightThighMatrix = new Matrix4(rightThigh.matrix);
  rightThigh.matrix.scale(0.175,0.15,0.2);
  rightThigh.render();

  // Right Calf
  let rightCalf = new Cube();
  rightCalf.color = [1,0.6,0,1];
  rightCalf.matrix = new Matrix4(rightThighMatrix);
  rightCalf.matrix.translate(0.035, -0.05, 0.05);
  rightCalf.matrix.rotate(g_rightLegAngle2,1,0,0);

  let rightCalfMatrix = new Matrix4(rightCalf.matrix);
  rightCalf.matrix.scale(0.1,0.15,0.1);
  rightCalf.render();

  // Right Foot
  let rightFoot = new Cube();
  rightFoot.color = [1,0.6,0,1];
  rightFoot.matrix = new Matrix4(rightCalfMatrix);
  rightFoot.matrix.translate(-0.05, -0.03, -0.2);
  rightFoot.matrix.scale(0.2,0.05,0.3);
  rightFoot.matrix.rotate(g_rightLegAngle3, 1,0,0);
  rightFoot.render();

  // Left Thigh
  let leftThigh = new Cube();
  leftThigh.color = [0.9,0.9,0.9,1];
  leftThigh.matrix = new Matrix4(bodyLocationMat);
  // leftThigh.matrix.translate(0.35, -0.1, 0.1);
  leftThigh.matrix.translate(0.35, -0.1 + g_leftLegOffsetY, 0.1 + g_leftLegOffsetZ);
  leftThigh.matrix.rotate(g_leftLegAngle1, 1, 0, 0);

  let leftThighMatrix = new Matrix4(leftThigh.matrix);
  leftThigh.matrix.scale(0.175,0.15,0.2);
  leftThigh.render();

  // Left Calf
  let leftCalf = new Cube();
  leftCalf.color = [1,0.6,0,1];
  leftCalf.matrix = new Matrix4(leftThighMatrix);
  leftCalf.matrix.translate(0.035, -0.05, 0.05);
  leftCalf.matrix.rotate(g_leftLegAngle2,1,0,0);

  let leftCalfMatrix = new Matrix4(leftCalf.matrix);
  leftCalf.matrix.scale(0.1,0.15,0.1);
  leftCalf.render();

  // Left Foot
  let leftFoot = new Cube();
  leftFoot.color = [1,0.6,0,1];
  leftFoot.matrix = new Matrix4(leftCalfMatrix);
  leftFoot.matrix.translate(-0.05, -0.03, -0.2);
  leftFoot.matrix.scale(0.2,0.05,0.3);
  leftFoot.matrix.rotate(g_leftLegAngle3,1,0,0);
  leftFoot.render();

  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot");
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