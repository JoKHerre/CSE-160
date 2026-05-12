// World.js
// Jonathan Herrera

var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;

  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if (u_whichTexture == 3) {
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    } else if (u_whichTexture == 4) {
      gl_FragColor = texture2D(u_Sampler4, v_UV);
    } else {
      gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);
    }
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;

let g_mouseDown = false;
let g_camera;

let u_whichTexture;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;

let g_mazeSize = 16;
let g_maze = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,1],
  [1,0,0,1,0,0,1,0,1,0,0,1,0,1,0,1],
  [1,1,0,0,0,1,1,0,0,0,1,1,0,1,0,1],
  [1,0,0,1,0,0,0,0,1,0,0,0,0,1,0,1],
  [1,0,1,1,1,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
  [1,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1],
  [1,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,0,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,1,0,0,1,0,0,0,1,0,0,0,1,0,1],
  [1,0,1,1,0,1,1,1,0,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1],
  [1,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
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

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
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

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }

  // Get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }

  // Get the storage location of u_Sampler2
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return;
  }

  // Get the storage location of u_Sampler3
  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return;
  }

  // Get the storage location of u_Sampler4
  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  if (!u_Sampler4) {
    console.log('Failed to get the storage location of u_Sampler4');
    return;
  }

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
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
  // document.getElementById('animationLeftWingOffButton').onclick = function() {g_leftWingAnimation = false;}
  // document.getElementById('animationLeftWingOnButton').onclick = function() {g_leftWingAnimation = true;}

  // document.getElementById('animationRightWingOffButton').onclick = function() {g_rightWingAnimation = false;}
  // document.getElementById('animationRightWingOnButton').onclick = function() {g_rightWingAnimation = true;}

  // document.getElementById('animationLeftLegOffButton').onclick = function() {g_leftLegAnimation = false;}
  // document.getElementById('animationLeftLegOnButton').onclick = function() {g_leftLegAnimation = true;}

  // document.getElementById('animationRightLegOffButton').onclick = function() {g_rightLegAnimation = false;}
  // document.getElementById('animationRightLegOnButton').onclick = function() {g_rightLegAnimation = true;}

  // // Joint Slider Events
  //   // Left Wing
  // document.getElementById('leftWingJoint1').addEventListener('mousemove', function() {g_leftWingAngle1 = this.value; renderAllShapes(); });
  // document.getElementById('leftWingJoint2').addEventListener('mousemove', function() {g_leftWingAngle2 = this.value; renderAllShapes(); });
  // document.getElementById('leftWingJoint3').addEventListener('mousemove', function() {g_leftWingAngle3 = this.value; renderAllShapes(); });
  //   // Right Wing
  // document.getElementById('rightWingJoint1').addEventListener('mousemove', function() {g_rightWingAngle1 = this.value; renderAllShapes(); });
  // document.getElementById('rightWingJoint2').addEventListener('mousemove', function() {g_rightWingAngle2 = this.value; renderAllShapes(); });
  // document.getElementById('rightWingJoint3').addEventListener('mousemove', function() {g_rightWingAngle3 = this.value; renderAllShapes(); });

  //   // Left Leg
  // document.getElementById('leftLegJoint1').addEventListener('mousemove', function() {g_leftLegAngle1 = this.value; renderAllShapes(); });
  // document.getElementById('leftLegJoint2').addEventListener('mousemove', function() {g_leftLegAngle2 = this.value; renderAllShapes(); });
  // document.getElementById('leftLegJoint3').addEventListener('mousemove', function() {g_leftLegAngle3 = this.value; renderAllShapes(); });

  //   // Right Leg
  // document.getElementById('rightLegJoint1').addEventListener('mousemove', function() {g_rightLegAngle1 = this.value; renderAllShapes(); });
  // document.getElementById('rightLegJoint2').addEventListener('mousemove', function() {g_rightLegAngle2 = this.value; renderAllShapes(); });
  // document.getElementById('rightLegJoint3').addEventListener('mousemove', function() {g_rightLegAngle3 = this.value; renderAllShapes(); });

  // // Angle Slider Events
  // document.getElementById('angleSlideX').addEventListener('mousemove', function() { g_globalAngleX = this.value; renderAllShapes(); });
  // document.getElementById('angleSlideY').addEventListener('mousemove', function() { g_globalAngleY = this.value; renderAllShapes(); });
  
}

function initTextures() {
  loadTexture("../textures/sky.jpg", 0, u_Sampler0);
  loadTexture("../textures/grass.png", 1, u_Sampler1);
  loadTexture("../textures/dirt.png", 2, u_Sampler2);
  loadTexture("../textures/brick.png", 3, u_Sampler3);
  loadTexture("../textures/hedge.png", 4, u_Sampler4);

  return true;
}

function loadTexture(path, textureUnit, sampler) {
  var image = new Image();

  image.onload = function() {
    let texture = gl.createTexture();
    if (!texture) {
      console.log('Failed to create the texture object');
      return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  
    gl.activeTexture(gl.TEXTURE0 + textureUnit);
  
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  
    gl.uniform1i(sampler, textureUnit);
  
    console.log('finished loadTexture');
  };

  image.src = path;
}

function main() {
  // Set up canvas and gl variables
  setupWebGL();   

  g_camera = new Camera();
  
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();
  
  // Set up actions for the HTML UI elements
  addActionsforHtmlUI();
  
  initTextures();
  
  canvas.addEventListener("click", () => {
    canvas.requestPointerLock();
  });

  // Left Clicking, Right Clicking
  // canvas.onmousedown = function(ev) {
  //   let block = getBlockInFront();
    
  //   if (!inBounds(block.x, block.z)) {
  //     return;
  //   }

  //   // Left click to delete
  //   if (ev.button === 0) {
  //     g_map[block.x][block.z] = 0;
  //   }

  //   // Right click to place
  //   if (ev.button === 2) {
  //     g_map[block.x][block.z] = 1;
  //   }
  // };

  canvas.oncontextmenu = (ev) => ev.preventDefault();  

  canvas.onmousemove = function(ev) {
    g_camera.panRight(ev.movementX * 0.2);
    g_camera.lookUp(-ev.movementY * 0.2);
  }

  canvas.addEventListener("wheel", function(ev) {
    if (ev.deltaY < 0) {
      g_camera.zoomIn();
    } else {
      g_camera.zoomOut();
    }
  })

  document.onkeydown = keydown;

  // Specify the color for clearing <canvas>
  gl.clearColor(0.2, 0.2, 0.2, 1.0);
  
  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);

  // Render
  requestAnimationFrame(tick);
}

function keydown(ev) {
  // W or up arrow
  if (ev.keyCode == 38 || ev.keyCode == 87) {
    g_camera.moveForward();
  }
  // A or left arrow
  if (ev.keyCode == 37 || ev.keyCode == 65) {
    g_camera.moveLeft();
  }

  // S or down arrow
  if (ev.keyCode == 40 || ev.keyCode == 83) {
    g_camera.moveBackward();
  } 

  // D or right arrow
  if (ev.keyCode == 39 || ev.keyCode == 68) {
    g_camera.moveRight();
  }

  // Q
  if (ev.keyCode == 81) {
    g_camera.panLeft(10);
  } 

  // E
  if (ev.keyCode == 69) {
    g_camera.panRight(10);
  }

  // I
  if (ev.keyCode == 75) {
    g_camera.lookDown(10);
  } 

  // K
  if (ev.keyCode == 73) {
    g_camera.lookUp(10);
  }

  // Space
  if (ev.keyCode == 32) {
    g_camera.moveUp();
  }

  // Shift
  if (ev.keyCode == 16) {
    g_camera.moveDown();
  }

  renderScene();
  console.log(ev.keyCode);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

// Called by the browser repeatedly whenever its time
function tick() {
  g_seconds = performance.now()/1000.0-g_startTime;
  //console.log(g_seconds);

  // Update Animation Angles
  updateAnimationAngles();
  updateAnimationLegs();

  // Draw everything
  renderScene();
  // renderAllShapes();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

var g_shapesList = [];

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

function updateAnimationLegs() {
  if (g_leftLegAnimation) {
    g_leftLegOffsetY = 0.02 * Math.max(0, Math.sin(2*g_seconds));
    g_leftLegOffsetZ = 0.01 * Math.sin(2*g_seconds);
  }

  if (g_rightLegAnimation) {
    g_rightLegOffsetY = 0.02 * Math.max(0, Math.sin(2*g_seconds + Math.PI));
    g_rightLegOffsetZ = 0.01 * Math.sin(2*g_seconds + Math.PI);
  }
}


function renderScene() {
  // Check the time at the start of this function
  var startTime = performance.now();

  // Pass the projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(g_camera.fov, canvas.width/canvas.height, .1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Pass the view matrix
  var viewMat = new Matrix4();

  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0],  g_camera.at.elements[1],  g_camera.at.elements[2],
    g_camera.up.elements[0],  g_camera.up.elements[1],  g_camera.up.elements[2]);

  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalAngleX, 0,1,0);
  globalRotMat.rotate(g_globalAngleY, 1,0,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw the sky
  var sky = new Cube();
  sky.textureNum = -2;
  sky.color = [0.4, 0.5, 0.9, 1];
  sky.matrix.scale(50,50,50);
  sky.matrix.translate(-.5,-.5,-.5);
  sky.renderFast();


  // Draw the floor
  var floor = new Cube();
  floor.color = [0.75, 0.75, 0.75, 1];
  floor.textureNum = 1;
  floor.matrix.translate(0, -1, 0);
  floor.matrix.scale(32,0.01,32);
  floor.matrix.translate(-.5, 0,   -.5);
  floor.renderFast();

  // Draw Walls
  var wall = new Cube();
  wall.color = [0.75, 0.75, 0.75, 1];
  wall.textureNum = 3;
  wall.matrix.translate(-16, -1, -16);
  for (let i = 0; i < 3; i++) {   
    for (let x = 0; x < 32; x++) {
      for (let y = 0; y < 32; y++) {
        if (x == 0 || y == 0 || x == 31 || y == 31) {
          wall.renderFast();
        }
        wall.matrix.translate(0,0,1);
      }
      wall.matrix.translate(1,0,-32);
    }
    wall.matrix.translate(-32,1,0);
  }

  // Draw Maze
  drawMaze();

  // renderAllShapes();

  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), "performance");
}

function inBounds(x, z) {
  return (x >= 0) && (x < g_map.length) && (z >= 0) && (z < g_map[0].length);
}

function getBlockInFront() {
  let dir = new Vector3([
    g_camera.at.elements[0] - g_camera.eye.elements[0],
    0,
    g_camera.at.elements[2] - g_camera.eye.elements[2]
  ]);

  dir.normalize();

  let dist = 1.5;

  let tx = g_camera.eye.elements[0] + dir.elements[0] * dist;
  let tz = g_camera.eye.elements[2] + dir.elements[2] * dist;

  let x = Math.floor(tx + MAP_OFFSET);
  let z = Math.floor(tz + MAP_OFFSET);

  return { x, z };
}

function drawMaze() {
  let cube = new Cube();
  cube.textureNum = 4;
  cube.color = [0.4, 0.3, 0.2, 1];
  cube.matrix.translate(-8, -1, -8);
  cube.matrix.scale(1,0.5,1);

  for (let x = 0; x < g_maze.length; x++) {
    for (let y = 0; y < g_maze[0].length; y++) {
      if (g_maze[x][y] == 1) {
        cube.renderFast();
      }
      cube.matrix.translate(0,0,1);
    } 
    cube.matrix.translate(1,0,-16);
  }
}

// Draws shapes for penguin
function renderAllShapes() {
//   // Check the time at the start of this function
//   var startTime = performance.now();

//   // Pass the projection matrix
//   var projMat = new Matrix4();
//   projMat.setPerspective(50, 1*canvas.width/canvas.height, .1, 100);
//   gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

//   // Pass the view matrix
//   var viewMat = new Matrix4();
// //   viewMat.setLookAt(0,0,4, 0,0,-100, 0,1,0); // (eye, at, up)
// //   viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0], g_at[1], g_at[2], g_up[0], g_up[1], g_up[2]); // (eye, at, up)
  
//     // viewMat.setLookAt(
//         // g_camera.eye.x, g_camera.eye.y, g_camera.eye.z,
//         // g_camera.at.x, g_camera.at.y, g_camera.at.z,
//         // g_camera.up.x, g_camera.up.y, g_camera.up.z);
    
//     viewMat.setLookAt(
//         g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
//         g_camera.at.elements[0] ,  g_camera.at.elements[1],  g_camera.at.elements[2],
//         g_camera.up.elements[0] ,  g_camera.up.elements[1],  g_camera.up.elements[2]);

//     gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

//   // Pass the matrix to a u_ModelMatrix attribute
//   var globalRotMat = new Matrix4();
//   globalRotMat.rotate(g_globalAngleX, 0,1,0);
//   globalRotMat.rotate(g_globalAngleY, 1,0,0);
//   gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

//   // Clear <canvas>
//   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//   gl.clear(gl.COLOR_BUFFER_BIT);w

  // Color variables:
  let white = [0.9,0.9,0.9,1];
  let black = [0.1,0.1,0.1,1];

  // Body
  let lowerBody = new Cube();
  lowerBody.color = black;
  lowerBody.textureNum = -2;   
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
  lowerBodyWhite.renderFast();
  lowerBody.renderFast();
  
  let midBody = new Cube();
  midBody.color = black;
  midBody.matrix = new Matrix4(bodyLocationMat);
  midBody.matrix.translate(0.05,0.7,0.05);
  let midBodyLocationMat = new Matrix4(midBody.matrix);
  midBody.matrix.scale(0.5,0.15,0.35);
  midBody.renderFast();

  let midBodyWhite = new Cube();
  midBodyWhite.matrix = new Matrix4(midBody.matrix);
  midBodyWhite.color = white;
  midBodyWhite.matrix.scale(0.8,1.01,0.8);
  midBodyWhite.matrix.translate(0.1,-0.001,-0.001);
  midBodyWhite.renderFast();
  midBody.renderFast();

  let upperBody = new Cube();
  upperBody.matrix = new Matrix4(midBodyLocationMat);
  upperBody.color = black;
  upperBody.matrix.translate(0.05, 0.15, 0.05);
  let upperBodyLocationMat = new Matrix4(upperBody.matrix);
  upperBody.matrix.scale(0.4,0.1,0.275)
  upperBody.renderFast();

  let upperBodyWhite = new Cube();
  upperBodyWhite.matrix = new Matrix4(upperBody.matrix);
  upperBodyWhite.color = white;
  upperBodyWhite.matrix.scale(0.8,1.01,0.8);
  upperBodyWhite.matrix.translate(0.1,-0.001,-0.001);
  upperBodyWhite.renderFast();
  upperBody.renderFast();

  // Head
  let head = new Cube();
  head.color = black;
  head.matrix = new Matrix4(upperBodyLocationMat);
  head.matrix.translate(0.025, 0.1, 0.025);
  let headLocationMat = new Matrix4(head.matrix);
  head.matrix.scale(0.35,0.3,0.25);
  head.renderFast();
  
  let upperBeak = new Cube();
  upperBeak.color = [1,0.6,0,1];
  upperBeak.matrix = new Matrix4(headLocationMat);
  upperBeak.matrix.translate(0.125, 0.1, -0.08);
  upperBeak.matrix.scale(0.1,0.08,0.1);
  upperBeak.matrix.rotate(45,45,0,1);
  upperBeak.renderFast();

  let outerEyeRight = new Cube();
  outerEyeRight.color = [0,0,0,0];
  outerEyeRight.matrix = new Matrix4(headLocationMat);
  outerEyeRight.matrix.translate(0.025, 0.1, -0.01);
  let outerEyeRightLocationMat = new Matrix4(outerEyeRight.matrix);
  outerEyeRight.matrix.scale(0.08,0.1,0.025);
  outerEyeRight.renderFast();

  let innerEyeRight = new Cube();
  innerEyeRight.color = [0,0,1,1];
  innerEyeRight.matrix = new Matrix4(outerEyeRightLocationMat);
  innerEyeRight.matrix.translate(0.015, 0, -0.01);
  innerEyeRight.matrix.scale(0.06,0.08,0.1);
  innerEyeRight.renderFast();

  let outerEyeLeft = new Cube();
  outerEyeLeft.color = [0,0,0,0];
  outerEyeLeft.matrix = new Matrix4(headLocationMat);
  outerEyeLeft.matrix.translate(0.25, 0.1, -0.01);
  let outerEyeLeftLocationMat = new Matrix4(outerEyeLeft.matrix);
  outerEyeLeft.matrix.scale(0.08,0.1,0.025);
  outerEyeLeft.renderFast();

  let innerEyeLeft = new Cube();
  innerEyeLeft.color = [0,0,1,1];
  innerEyeLeft.matrix = new Matrix4(outerEyeLeftLocationMat);
  innerEyeLeft.matrix.translate(0.015, 0, -0.01);
  innerEyeLeft.matrix.scale(0.06,0.08,0.1);
  innerEyeLeft.renderFast();

  // left Wing
  let leftWing = new Cube();
  leftWing.color = black;
  leftWing.matrix = new Matrix4(midBodyLocationMat);
  leftWing.matrix.translate(0.1, 0.12, 0.1);
  leftWing.matrix.rotate(g_leftWingAngle1, 0,0,1);

  let wingMatrixLeft = new Matrix4(leftWing.matrix);
  leftWing.matrix.scale(0.05,0.3,0.2);
  leftWing.renderFast();
  
  let leftWing2 = new Cube();
  leftWing2.color = black;
  leftWing2.matrix = new Matrix4(wingMatrixLeft);
  leftWing2.matrix.translate(0,0.3,0);
  leftWing2.matrix.rotate(g_leftWingAngle2, 0,0,1);

  let wingMatrixLeft2 = new Matrix4(leftWing2.matrix);
  leftWing2.matrix.scale(0.05,0.3,0.2);
  leftWing2.renderFast();

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
  rightWing.renderFast();

  let rightWing2 = new Cube();
  rightWing2.color = black;
  rightWing2.matrix = new Matrix4(wingMatrixRight);
  rightWing2.matrix.translate(0,0.3,0);
  rightWing2.matrix.rotate(g_rightWingAngle2, 0,0,1);

  let wingMatrixRight2 = new Matrix4(rightWing2.matrix);
  rightWing2.matrix.scale(0.05,0.3,0.2);
  rightWing2.renderFast();

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
  rightThigh.renderFast();

  // Right Calf
  let rightCalf = new Cube();
  rightCalf.color = [1,0.6,0,1];
  rightCalf.matrix = new Matrix4(rightThighMatrix);
  rightCalf.matrix.translate(0.035, -0.05, 0.05);
  rightCalf.matrix.rotate(g_rightLegAngle2,1,0,0);

  let rightCalfMatrix = new Matrix4(rightCalf.matrix);
  rightCalf.matrix.scale(0.1,0.15,0.1);
  rightCalf.renderFast();

  // Right Foot
  let rightFoot = new Cube();
  rightFoot.color = [1,0.6,0,1];
  rightFoot.matrix = new Matrix4(rightCalfMatrix);
  rightFoot.matrix.translate(-0.05, -0.03, -0.2);
  rightFoot.matrix.scale(0.2,0.05,0.3);
  rightFoot.matrix.rotate(g_rightLegAngle3, 1,0,0);
  rightFoot.renderFast();

  // Left Thigh
  let leftThigh = new Cube();
  leftThigh.color = [0.9,0.9,0.9,1];
  leftThigh.matrix = new Matrix4(bodyLocationMat);
  // leftThigh.matrix.translate(0.35, -0.1, 0.1);
  leftThigh.matrix.translate(0.35, -0.1 + g_leftLegOffsetY, 0.1 + g_leftLegOffsetZ);
  leftThigh.matrix.rotate(g_leftLegAngle1, 1, 0, 0);

  let leftThighMatrix = new Matrix4(leftThigh.matrix);
  leftThigh.matrix.scale(0.175,0.15,0.2);
  leftThigh.renderFast();

  // Left Calf
  let leftCalf = new Cube();
  leftCalf.color = [1,0.6,0,1];
  leftCalf.matrix = new Matrix4(leftThighMatrix);
  leftCalf.matrix.translate(0.035, -0.05, 0.05);
  leftCalf.matrix.rotate(g_leftLegAngle2,1,0,0);

  let leftCalfMatrix = new Matrix4(leftCalf.matrix);
  leftCalf.matrix.scale(0.1,0.15,0.1);
  leftCalf.renderFast();

  // Left Foot
  let leftFoot = new Cube();
  leftFoot.color = [1,0.6,0,1];
  leftFoot.matrix = new Matrix4(leftCalfMatrix);
  leftFoot.matrix.translate(-0.05, -0.03, -0.2);
  leftFoot.matrix.scale(0.2,0.05,0.3);
  leftFoot.matrix.rotate(g_leftLegAngle3,1,0,0);
  leftFoot.renderFast();
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



// // Color variables:
//   let white = [0.9,0.9,0.9,1];
//   let black = [0.1,0.1,0.1,1];

//   // Body
//   let lowerBody = new Cube();
//   lowerBody.color = black;
//   lowerBody.textureNum = -2;   
//   lowerBody.matrix.setTranslate(-0.25, -0.5, 0);
//   if (g_pokeAnimation) {
//     lowerBody.matrix.translate(0.275, 0.35, 0.2); 
//     lowerBody.matrix.rotate(g_bodySway, 0,0,1);
//     lowerBody.matrix.translate(-0.275, -0.35, -0.2);
//   }
//   let bodyLocationMat = new Matrix4(lowerBody.matrix);
//   lowerBody.matrix.translate(0.025,0,0.025);
//   lowerBody.matrix.scale(0.55,0.7,0.4);

//   let lowerBodyWhite = new Cube();
//   lowerBodyWhite.matrix = new Matrix4(lowerBody.matrix);
//   lowerBodyWhite.color = white;
//   lowerBodyWhite.matrix.scale(0.8,1.01,0.8);
//   lowerBodyWhite.matrix.translate(0.1,-0.001,-0.001);
//   lowerBodyWhite.render();
//   lowerBody.render();
  
//   let midBody = new Cube();
//   midBody.color = black;
//   midBody.matrix = new Matrix4(bodyLocationMat);
//   midBody.matrix.translate(0.05,0.7,0.05);
//   let midBodyLocationMat = new Matrix4(midBody.matrix);
//   midBody.matrix.scale(0.5,0.15,0.35);
//   midBody.render();

//   let midBodyWhite = new Cube();
//   midBodyWhite.matrix = new Matrix4(midBody.matrix);
//   midBodyWhite.color = white;
//   midBodyWhite.matrix.scale(0.8,1.01,0.8);
//   midBodyWhite.matrix.translate(0.1,-0.001,-0.001);
//   midBodyWhite.render();
//   midBody.render();

//   let upperBody = new Cube();
//   upperBody.matrix = new Matrix4(midBodyLocationMat);
//   upperBody.color = black;
//   upperBody.matrix.translate(0.05, 0.15, 0.05);
//   let upperBodyLocationMat = new Matrix4(upperBody.matrix);
//   upperBody.matrix.scale(0.4,0.1,0.275)
//   upperBody.render();

//   let upperBodyWhite = new Cube();
//   upperBodyWhite.matrix = new Matrix4(upperBody.matrix);
//   upperBodyWhite.color = white;
//   upperBodyWhite.matrix.scale(0.8,1.01,0.8);
//   upperBodyWhite.matrix.translate(0.1,-0.001,-0.001);
//   upperBodyWhite.render();
//   upperBody.render();

//   // Head
//   let head = new Cube();
//   head.color = black;
//   head.matrix = new Matrix4(upperBodyLocationMat);
//   head.matrix.translate(0.025, 0.1, 0.025);
//   let headLocationMat = new Matrix4(head.matrix);
//   head.matrix.scale(0.35,0.3,0.25);
//   head.render();
  
//   let upperBeak = new Cube();
//   upperBeak.color = [1,0.6,0,1];
//   upperBeak.matrix = new Matrix4(headLocationMat);
//   upperBeak.matrix.translate(0.125, 0.1, -0.08);
//   upperBeak.matrix.scale(0.1,0.08,0.1);
//   upperBeak.matrix.rotate(45,45,0,1);
//   upperBeak.render();

//   let outerEyeRight = new Cube();
//   outerEyeRight.color = [0,0,0,0];
//   outerEyeRight.matrix = new Matrix4(headLocationMat);
//   outerEyeRight.matrix.translate(0.025, 0.1, -0.01);
//   let outerEyeRightLocationMat = new Matrix4(outerEyeRight.matrix);
//   outerEyeRight.matrix.scale(0.08,0.1,0.025);
//   outerEyeRight.render();

//   let innerEyeRight = new Cube();
//   innerEyeRight.color = [0,0,1,1];
//   innerEyeRight.matrix = new Matrix4(outerEyeRightLocationMat);
//   innerEyeRight.matrix.translate(0.015, 0, -0.01);
//   innerEyeRight.matrix.scale(0.06,0.08,0.1);
//   innerEyeRight.render();

//   let outerEyeLeft = new Cube();
//   outerEyeLeft.color = [0,0,0,0];
//   outerEyeLeft.matrix = new Matrix4(headLocationMat);
//   outerEyeLeft.matrix.translate(0.25, 0.1, -0.01);
//   let outerEyeLeftLocationMat = new Matrix4(outerEyeLeft.matrix);
//   outerEyeLeft.matrix.scale(0.08,0.1,0.025);
//   outerEyeLeft.render();

//   let innerEyeLeft = new Cube();
//   innerEyeLeft.color = [0,0,1,1];
//   innerEyeLeft.matrix = new Matrix4(outerEyeLeftLocationMat);
//   innerEyeLeft.matrix.translate(0.015, 0, -0.01);
//   innerEyeLeft.matrix.scale(0.06,0.08,0.1);
//   innerEyeLeft.render();

//   // left Wing
//   let leftWing = new Cube();
//   leftWing.color = black;
//   leftWing.matrix = new Matrix4(midBodyLocationMat);
//   leftWing.matrix.translate(0.1, 0.12, 0.1);
//   leftWing.matrix.rotate(g_leftWingAngle1, 0,0,1);

//   let wingMatrixLeft = new Matrix4(leftWing.matrix);
//   leftWing.matrix.scale(0.05,0.3,0.2);
//   leftWing.render();
  
//   let leftWing2 = new Cube();
//   leftWing2.color = black;
//   leftWing2.matrix = new Matrix4(wingMatrixLeft);
//   leftWing2.matrix.translate(0,0.3,0);
//   leftWing2.matrix.rotate(g_leftWingAngle2, 0,0,1);

//   let wingMatrixLeft2 = new Matrix4(leftWing2.matrix);
//   leftWing2.matrix.scale(0.05,0.3,0.2);
//   leftWing2.render();

//   let leftWingTip = new Pyramid();
//   leftWingTip.color = black;
//   leftWingTip.matrix = new Matrix4(wingMatrixLeft2);
//   leftWingTip.matrix.translate(0,0.3,0);
//   leftWingTip.matrix.scale(0.05,0.2,0.2);
//   leftWingTip.matrix.rotate(g_leftWingAngle3, 0,0,1);
//   leftWingTip.render();

//   // right Wing
//   let rightWing = new Cube();
//   rightWing.color = black;
//   rightWing.matrix = new Matrix4(midBodyLocationMat);
//   rightWing.matrix.translate(0.45, 0.14, 0.1);
//   rightWing.matrix.rotate(g_rightWingAngle1, 0,0,1);

//   let wingMatrixRight = new Matrix4(rightWing.matrix);
//   rightWing.matrix.scale(0.05,0.3,0.2);
//   rightWing.render();

//   let rightWing2 = new Cube();
//   rightWing2.color = black;
//   rightWing2.matrix = new Matrix4(wingMatrixRight);
//   rightWing2.matrix.translate(0,0.3,0);
//   rightWing2.matrix.rotate(g_rightWingAngle2, 0,0,1);

//   let wingMatrixRight2 = new Matrix4(rightWing2.matrix);
//   rightWing2.matrix.scale(0.05,0.3,0.2);
//   rightWing2.render();

//   let rightWingTip = new Pyramid();
//   rightWingTip.color = black;
//   rightWingTip.matrix = new Matrix4(wingMatrixRight2);
//   rightWingTip.matrix.translate(0,0.3,0);
//   rightWingTip.matrix.rotate(g_rightWingAngle3, 0,0,1);
//   rightWingTip.matrix.scale(0.05,0.2,0.2);
//   rightWingTip.render();

//   // Right Thigh
//   let rightThigh = new Cube();
//   rightThigh.color = [0.9,0.9,0.9,1];
//   rightThigh.matrix = new Matrix4(bodyLocationMat);
//   // rightThigh.matrix.setTranslate(-0.2, -0.6 + g_rightLegOffsetY, 0.1 + g_rightLegOffsetZ);
//   rightThigh.matrix.translate(0.1, -0.1 + g_rightLegOffsetY, 0.1 + g_rightLegOffsetZ);

//   rightThigh.matrix.rotate(g_rightLegAngle1, 1,0,0);

//   let rightThighMatrix = new Matrix4(rightThigh.matrix);
//   rightThigh.matrix.scale(0.175,0.15,0.2);
//   rightThigh.render();

//   // Right Calf
//   let rightCalf = new Cube();
//   rightCalf.color = [1,0.6,0,1];
//   rightCalf.matrix = new Matrix4(rightThighMatrix);
//   rightCalf.matrix.translate(0.035, -0.05, 0.05);
//   rightCalf.matrix.rotate(g_rightLegAngle2,1,0,0);

//   let rightCalfMatrix = new Matrix4(rightCalf.matrix);
//   rightCalf.matrix.scale(0.1,0.15,0.1);
//   rightCalf.render();

//   // Right Foot
//   let rightFoot = new Cube();
//   rightFoot.color = [1,0.6,0,1];
//   rightFoot.matrix = new Matrix4(rightCalfMatrix);
//   rightFoot.matrix.translate(-0.05, -0.03, -0.2);
//   rightFoot.matrix.scale(0.2,0.05,0.3);
//   rightFoot.matrix.rotate(g_rightLegAngle3, 1,0,0);
//   rightFoot.render();

//   // Left Thigh
//   let leftThigh = new Cube();
//   leftThigh.color = [0.9,0.9,0.9,1];
//   leftThigh.matrix = new Matrix4(bodyLocationMat);
//   // leftThigh.matrix.translate(0.35, -0.1, 0.1);
//   leftThigh.matrix.translate(0.35, -0.1 + g_leftLegOffsetY, 0.1 + g_leftLegOffsetZ);
//   leftThigh.matrix.rotate(g_leftLegAngle1, 1, 0, 0);

//   let leftThighMatrix = new Matrix4(leftThigh.matrix);
//   leftThigh.matrix.scale(0.175,0.15,0.2);
//   leftThigh.render();

//   // Left Calf
//   let leftCalf = new Cube();
//   leftCalf.color = [1,0.6,0,1];
//   leftCalf.matrix = new Matrix4(leftThighMatrix);
//   leftCalf.matrix.translate(0.035, -0.05, 0.05);
//   leftCalf.matrix.rotate(g_leftLegAngle2,1,0,0);

//   let leftCalfMatrix = new Matrix4(leftCalf.matrix);
//   leftCalf.matrix.scale(0.1,0.15,0.1);
//   leftCalf.render();

//   // Left Foot
//   let leftFoot = new Cube();
//   leftFoot.color = [1,0.6,0,1];
//   leftFoot.matrix = new Matrix4(leftCalfMatrix);
//   leftFoot.matrix.translate(-0.05, -0.03, -0.2);
//   leftFoot.matrix.scale(0.2,0.05,0.3);
//   leftFoot.matrix.rotate(g_leftLegAngle3,1,0,0);
//   leftFoot.render();