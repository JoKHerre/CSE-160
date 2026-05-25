// World.js
// Jonathan Herrera
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;

    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1.0)));

    // v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
    }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform vec3 u_lightPos;
  varying vec4 v_VertPos;
  uniform vec3 u_cameraPos;
  uniform bool u_lightOn;

  uniform vec3 u_spotlightPosition;
  uniform vec3 u_spotlightDirection;
  uniform vec3 u_spotlightColor;
  uniform float u_spotlightCutoff;

  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -3) { 
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);
    } else if (u_whichTexture == -2) {
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

    vec3 baseColor = vec3(gl_FragColor);

    // vec3 lightVector = vec3(v_VertPos) - u_lightPos;
    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);

    // RED/GREEN VISUALIZATION
    // if (r < 1.0) {
    //   gl_FragColor = vec4(1,0,0,1);
    // } else if (r < 2.0) {
    //   gl_FragColor = vec4(0,1,0,1);
    // }

    // LIGHT FALLOFF VISUALIZATION
    // gl_FragColor = vec4(vec3(gl_FragColor) / (r*r), 1);

    // N DOT L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);


    // gl_FragColor = gl_FragColor * nDotL;
    // gl_FragColor.a = 1.0;

    // Reflection
    vec3 R = reflect(-L, N);

    // Eye
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    // Specular
    float specular = pow(max(dot(E,R), 0.0), 64.0) * 0.8;

    // vec3 diffuse = vec3(gl_FragColor * nDotL * 0.7);
    // vec3 diffuse = vec3(1.0,1.0,0.9) * vec3(gl_FragColor * nDotL * 0.7);
    vec3 diffuse = vec3(1.0,1.0,0.9) * baseColor * nDotL * 0.7;

    // vec3 ambient = vec3(gl_FragColor * 0.3);
    vec3 ambient = baseColor * 0.3;

    if (u_lightOn) {
      if (u_whichTexture == 0) {
        gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
      } else {
        gl_FragColor = vec4(diffuse + ambient, 1.0);  
      }
    }

    // Direction from fragment TO spotlight
    vec3 spotDir = normalize(u_spotlightPosition - vec3(v_VertPos));

    // Compare against spotlight direction
    float theta = dot(spotDir, normalize(-u_spotlightDirection));

    // Soft edge for spotlight cone
    float epsilon = 0.05;
    float intensity = smoothstep(u_spotlightCutoff, u_spotlightCutoff + epsilon, theta);

    // Spotlight diffuse
    float spotDiffuseStrength = max(dot(N, spotDir), 0.0);

    // vec3 spotDiffuse = intensity * spotDiffuseStrength * u_spotlightColor * vec3(gl_FragColor);
    vec3 spotDiffuse = intensity * spotDiffuseStrength * u_spotlightColor * baseColor;

    // Spotlight specular
    vec3 spotReflect = reflect(-spotDir, N);

    float spotSpecular = pow(max(dot(E, spotReflect), 0.0), 32.0);

    vec3 spotSpec = intensity * spotSpecular * u_spotlightColor * 0.6;

    // Add spotlight contribution
    if (u_lightOn) {
      gl_FragColor.rgb += spotDiffuse + spotSpec;
    }

    // // SPOTLIGHT
    // // vec3 spotLightVector = vec3(v_VertPos) - u_spotlightPosition;
    // vec3 spotLightVector = u_spotlightPosition - vec3(v_VertPos);
    // vec3 spotlightDir = normalize(spotlightVector);
    // float theta = dot(spotlightDir, normalize(-u_spotlightDirection));

    // if (u_lightOn && theta > u_spotlightCutoff) {
    //   float spotDiffuseStrength = max(dot(N, normalize(-spotlightVector)), 0.0);
    //   vec3 spotDiffuse = u_spotlightColor * vec3(gl_FragColor) * spotDiffuseStrength;
    //   gl_FragColor.rgb += spotDiffuse;
    // }

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
let bunny;
let g_normalOn = true;
let g_lightOn = true;
let g_lightPos = [0, 1, -2];

let u_spotlightPosition;
let u_spotlightDirection;
let u_spotlightColor;
let u_spotlightCutoff;

let u_whichTexture;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_lightPos;

let g_mazeSize = 16;
let g_maze = [
  [3,1,1,2,1,1,2,1,1,2,1,1,2,1,1,2],
  [1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,1],
  [1,0,0,2,0,0,3,0,2,0,0,1,0,2,0,1],
  [2,3,0,0,0,2,1,0,0,0,2,3,0,1,0,2],
  [1,0,0,1,0,0,0,0,1,0,0,0,0,1,0,1],
  [1,0,1,2,1,1,0,1,1,2,0,2,1,1,0,1],
  [2,0,0,0,0,1,0,0,0,1,0,0,0,1,0,2],
  [1,1,1,2,0,2,3,2,0,2,1,2,0,1,0,1],
  [1,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
  [2,0,0,1,1,2,0,2,1,1,0,2,1,1,0,2],
  [1,0,1,0,0,1,0,0,0,1,0,0,0,1,0,1],
  [1,0,1,2,0,2,1,1,0,2,1,2,0,1,0,1],
  [2,0,0,0,0,0,0,1,0,0,0,0,0,2,0,2],
  [1,1,1,2,1,2,0,2,1,1,1,2,0,2,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [2,1,1,2,1,1,2,1,1,2,1,1,2,1,1,2],
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

  // Get the storage location of a_Normal
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_lightPos
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  // Get the storage location of u_spotlightPosition
  u_spotlightPosition = gl.getUniformLocation(gl.program, 'u_spotlightPosition');
  if (!u_spotlightPosition) {
    console.log('Failed to get the storage location of u_spotlightPosition');
    return;
  }

  // Get the storage location of u_spotlightDirection
  u_spotlightDirection = gl.getUniformLocation(gl.program, 'u_spotlightDirection');
  if (!u_spotlightDirection) {
    console.log('Failed to get the storage location of u_spotlightDirection');
    return;
  }
  
  // Get the storage location of u_spotlightColor
  u_spotlightColor = gl.getUniformLocation(gl.program, 'u_spotlightColor');
  if (!u_spotlightColor) {
    console.log('Failed to get the storage location of u_spotlightColor');
    return;
  }

  // Get the storage location of u_spotlightCutoff
  u_spotlightCutoff = gl.getUniformLocation(gl.program, 'u_spotlightCutoff');
  if (!u_spotlightCutoff) {
    console.log('Failed to get the storage location of u_spotlightCutoff');
    return;
  }

  // Get the storage location of u_cameraPos
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }

  // Get the storage location of u_lightOn
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_NormalMatrix
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
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
  document.getElementById('normalOn').onclick = function() {g_normalOn = true;}
  document.getElementById('normalOff').onclick = function() {g_normalOn = false;}

  document.getElementById('lightOn').onclick = function() {g_lightOn = true;}
  document.getElementById('lightOff').onclick = function() {g_lightOn = false;}

  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) {if (ev.buttons === 1) { g_lightPos[0] = this.value/100; renderAllShapes(); }});
  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) {if (ev.buttons === 1) { g_lightPos[1] = this.value/100; renderAllShapes(); }});
  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) {if (ev.buttons === 1) { g_lightPos[2] = this.value/100; renderAllShapes(); }});

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
  bunny = new Model(gl, "../model/bunny.obj");
  bunny.color = [0.0, 0.0, 1.0, 1.0];
  bunny.textureNum = -2;
  
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();
  
  // Set up actions for the HTML UI elements
  addActionsforHtmlUI();
  
  initTextures();
  
  canvas.addEventListener("click", () => {
    canvas.requestPointerLock();
  });

  canvas.onmousemove = function(ev) {
    if (document.pointerLockElement === canvas) {
      g_camera.panRight(ev.movementX * 0.2);
      g_camera.lookUp(-ev.movementY * 0.2);
    }
  }

  // Left Clicking, Right Clicking
  canvas.onmousedown = function(ev) {

    if (ev.button === 0 && ev.ctrlKey) {
      g_pokeAnimation = true;
      g_pokeStartTime = g_seconds;
      return;
    }

    // Left click to delete
    if (ev.button === 0) {
      breakBlock();
    }

    // Right click to place
    if (ev.button === 2) {
      placeBlock();
    }
  }; 
  
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

  // Update Animation Angles
  updateAnimationAngles();
  updateAnimationLegs();

  // Draw everything
  renderScene();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

var g_shapesList = [];

function updateAnimationAngles() {

  g_lightPos[0] = Math.cos(g_seconds);

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
  if (g_normalOn) {sky.textureNum = -3};
  sky.color = [0.4, 0.5, 0.9, 1];
  sky.matrix.scale(-50,-50,-50);
  sky.matrix.translate(-.5,-.5,-.5);
  sky.renderFast();


  // Draw the floor
  var floor = new Cube();
  floor.color = [0.75, 0.75, 0.75, 1];
  floor.textureNum = 1;
  if (g_normalOn) {floor.textureNum = -3};
  floor.matrix.translate(0, -1, 0);
  floor.matrix.scale(32,0.01,32);
  floor.matrix.translate(-.5, 0,   -.5);
  floor.renderFast();

  var dirt = new Cube();
  dirt.color = [0.75, 0.75, 0.75, 1];
  dirt.textureNum = 2;
  if (g_normalOn) {dirt.textureNum = -3};
  dirt.matrix.translate(0, -0.99, 0);
  dirt.matrix.scale(16,0.01,16);
  dirt.matrix.translate(-.5, 0,   -.5);
  dirt.renderFast();

  // Draw Walls
  var wall = new Cube();
  wall.color = [0.75, 0.75, 0.75, 1];
  wall.textureNum = 3;
  if (g_normalOn) {wall.textureNum = -3};

  for (let i = 0; i < 3; i++) {   
    for (let x = 0; x < 32; x++) {
      for (let z = 0; z < 32; z++) {
        if (x == 0 || z == 0 || x == 31 || z == 31) {
          wall.matrix.setIdentity()
          wall.matrix.translate(x - 16, i-1, z - 16);
          wall.renderFast();
        }
      }
    }
  }

  // Draw Maze
  drawMaze();

  // Pass the light position to GLSL
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

  // Pass the camera position to GLSL
  gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
  
  // Pass the light status
  gl.uniform1i(u_lightOn, g_lightOn);

  // Pass the spotlight position
  gl.uniform3f(u_spotlightPosition, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);

  let spotlightDir = [g_camera.at.elements[0] - g_camera.eye.elements[0], g_camera.at.elements[1] - g_camera.eye.elements[1], g_camera.at.elements[2] - g_camera.eye.elements[2]];

  let len = Math.sqrt(spotlightDir[0] * spotlightDir[0] + spotlightDir[1] * spotlightDir[1] + spotlightDir[2] * spotlightDir[2]);

  spotlightDir[0] /= len;
  spotlightDir[1] /= len;
  spotlightDir[2] /= len;

  gl.uniform3f(u_spotlightDirection, spotlightDir[0], spotlightDir[1], spotlightDir[2]);

  gl.uniform3f(u_spotlightColor, 1.0, 1.0, 0.9);

  // gl.uniform1f(u_spotlightCutoff, Math.cos(20 * Math.PI / 180));
  gl.uniform1f(u_spotlightCutoff, Math.cos(Math.PI / 4));


  // Draw Light
  var light = new Cube();
  light.color = [2, 2, 0, 1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-0.1, -0.1, -0.1);
  light.matrix.translate(-0.5, -0.5, -0.5);
  light.renderFast();

  // Draw Sphere
  var sphere = new Sphere();
  sphere.color = [0.75, 0.75, 0.75, 1];
  sphere.textureNum = -2;
  if (g_normalOn) {sphere.textureNum = -3};
  sphere.matrix.translate(-1, -1.5, -1.5);
  sphere.render();

  renderAllShapes();

  if (g_normalOn) {
    bunny.textureNum = -3;
  } else {
    bunny.textureNum = -2;
  }
  bunny.matrix.setIdentity();
  bunny.matrix.setScale(0.5, 0.5, 0.5);
  bunny.matrix.rotate(240, 0, 1, 0);
  bunny.render(gl);

  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), "performance");
}

function getBlockInFront() {
  let eye = g_camera.eye.elements;
  let at = g_camera.at.elements;

  let dx = at[0] - eye[0];
  let dy = at[1] - eye[1];
  let dz = at[2] - eye[2];

  let len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  dx /= len;
  dy /= len;
  dz /= len;
  
  for (let t = 0; t < 6; t += 0.1) {
    let worldX = Math.floor(eye[0] + dx * t + g_maze.length / 2);
    let worldY = Math.floor((eye[1] + dy * t) / 0.5);
    let worldZ = Math.floor(eye[2] + dz * t + g_maze.length / 2);
    
    if (worldX >= 0 && worldZ >= 0 && worldX < g_maze.length && worldZ < g_maze.length) {
      if (worldY < g_maze[worldX][worldZ]) {
        return { x: worldX, y: worldY, z: worldZ };
      }
    }
  }
  
  return null;
}

function placeBlock() {
  let block = getBlockInFront();

  if (!block) {
    return;
  }

  g_maze[block.x][block.z]++;
}

function breakBlock() {
  let block = getBlockInFront();

  if (!block) {
    return;
  }

  if (g_maze[block.x][block.z] > 0) {
    g_maze[block.x][block.z]--;
  }
}

function drawMaze() {
  let cube = new Cube();
  cube.textureNum = 4;
  if (g_normalOn) {cube.textureNum = -3};
  cube.color = [0.4, 0.3, 0.2, 1];
  
  for (let x = 0; x < g_maze.length; x++) {
    for (let z = 0; z < g_maze[0].length; z++) {
      let height = g_maze[x][z];
      
      for (let y = 0; y < g_maze[x][z]; y++) {
        cube.matrix.setIdentity();
        cube.matrix.translate ( x - g_maze.length / 2, y*0.5 -0.999, z - g_maze[x].length / 2 );
        cube.matrix.scale(1,0.5,1);

        cube.renderFast();
      }
    } 
  }
}

// Draws shapes for penguin
function renderAllShapes() {
  // Color variables:
  let white = [0.9,0.9,0.9,1];
  let black = [0.1,0.1,0.1,1];

  // Body
  let lowerBody = new Cube();
  lowerBody.color = black;
  lowerBody.textureNum = -2;   
  if (g_normalOn) {lowerBody.textureNum = -3}
  lowerBody.matrix.setTranslate(-6.6, -0.85, -5.5);
  lowerBody.matrix.rotate(-90, 0,1,0);
  lowerBody.matrix.scale(0.5,0.5,0.5);
  if (g_pokeAnimation) {
    lowerBody.matrix.translate(0.275, 0.35, 0.2); 
    lowerBody.matrix.rotate(g_bodySway, 0,0,1);
    lowerBody.matrix.translate(-0.275, -0.35, -0.2);
  }
  let bodyLocationMat = new Matrix4(lowerBody.matrix);
  lowerBody.matrix.translate(0.025,0,0.025);
  lowerBody.matrix.scale(0.55,0.7,0.4);
  lowerBody.normalMatrix.setInverseOf(lowerBody.matrix).transpose();
  lowerBody.renderFast();

  let lowerBodyWhite = new Cube();
  lowerBodyWhite.matrix = new Matrix4(lowerBody.matrix);
  lowerBodyWhite.color = white;
  lowerBodyWhite.textureNum = -2;
  if (g_normalOn) {lowerBodyWhite.textureNum = -3}
  lowerBodyWhite.matrix.scale(0.8,1.01,0.8);
  lowerBodyWhite.matrix.translate(0.1,-0.001,-0.001);
  lowerBodyWhite.normalMatrix.setInverseOf(lowerBodyWhite.matrix).transpose();
  lowerBodyWhite.renderFast();
  
  let midBody = new Cube();
  midBody.color = black;
  midBody.textureNum = -2;
  if (g_normalOn) {midBody.textureNum = -3}
  midBody.matrix = new Matrix4(bodyLocationMat);
  midBody.matrix.translate(0.05,0.7,0.05);
  let midBodyLocationMat = new Matrix4(midBody.matrix);
  midBody.matrix.scale(0.5,0.15,0.35);
  midBody.normalMatrix.setInverseOf(midBody.matrix).transpose();
  midBody.renderFast();

  let midBodyWhite = new Cube();
  midBodyWhite.matrix = new Matrix4(midBody.matrix);
  midBodyWhite.color = white;
  midBodyWhite.textureNum = -2;
  if (g_normalOn) {midBodyWhite.textureNum = -3}
  midBodyWhite.matrix.scale(0.8,1.01,0.8);
  midBodyWhite.matrix.translate(0.1,-0.001,-0.001);
  midBodyWhite.normalMatrix.setInverseOf(midBodyWhite.matrix).transpose();
  midBodyWhite.renderFast();

  let upperBody = new Cube();
  upperBody.matrix = new Matrix4(midBodyLocationMat);
  upperBody.color = black;
  upperBody.textureNum = -2;
  if (g_normalOn) {upperBody.textureNum = -3}
  upperBody.matrix.translate(0.05, 0.15, 0.05);
  let upperBodyLocationMat = new Matrix4(upperBody.matrix);
  upperBody.matrix.scale(0.4,0.1,0.275)
  upperBody.normalMatrix.setInverseOf(upperBody.matrix).transpose();
  upperBody.renderFast();

  let upperBodyWhite = new Cube();
  upperBodyWhite.matrix = new Matrix4(upperBody.matrix);
  upperBodyWhite.color = white;
  upperBodyWhite.textureNum = -2;
  if (g_normalOn) {upperBodyWhite.textureNum = -3}
  upperBodyWhite.matrix.scale(0.8,1.01,0.8);
  upperBodyWhite.matrix.translate(0.1,-0.001,-0.001);
  upperBodyWhite.normalMatrix.setInverseOf(upperBodyWhite.matrix).transpose();
  upperBodyWhite.renderFast();

  // Head
  let head = new Cube();
  head.color = black;
  head.textureNum = -2;
  if (g_normalOn) {head.textureNum = -3}
  head.matrix = new Matrix4(upperBodyLocationMat);
  head.matrix.translate(0.025, 0.1, 0.025);
  let headLocationMat = new Matrix4(head.matrix);
  head.matrix.scale(0.35,0.3,0.25);
  head.normalMatrix.setInverseOf(head.matrix).transpose();
  head.renderFast();
  
  let upperBeak = new Cube();
  upperBeak.color = [1,0.6,0,1];
  upperBeak.textureNum = -2;
  if (g_normalOn) {upperBeak.textureNum = -3}
  upperBeak.matrix = new Matrix4(headLocationMat);
  upperBeak.matrix.translate(0.125, 0.1, -0.08);
  upperBeak.matrix.scale(0.1,0.08,0.1);
  upperBeak.matrix.rotate(45,45,0,1);
  upperBeak.normalMatrix.setInverseOf(upperBeak.matrix).transpose();
  upperBeak.renderFast();

  let outerEyeRight = new Cube();
  outerEyeRight.color = [0,0,0,0];
  outerEyeRight.textureNum = -2;
  if (g_normalOn) {outerEyeRight.textureNum = -3}
  outerEyeRight.matrix = new Matrix4(headLocationMat);
  outerEyeRight.matrix.translate(0.025, 0.1, -0.01);
  let outerEyeRightLocationMat = new Matrix4(outerEyeRight.matrix);
  outerEyeRight.matrix.scale(0.08,0.1,0.025);
  outerEyeRight.normalMatrix.setInverseOf(outerEyeRight.matrix).transpose();
  outerEyeRight.renderFast();

  let innerEyeRight = new Cube();
  innerEyeRight.color = [0,0,1,1];
  innerEyeRight.textureNum = -2;
  if (g_normalOn) {innerEyeRight.textureNum = -3}
  innerEyeRight.matrix = new Matrix4(outerEyeRightLocationMat);
  innerEyeRight.matrix.translate(0.015, 0, -0.01);
  innerEyeRight.matrix.scale(0.06,0.08,0.1);
  innerEyeRight.normalMatrix.setInverseOf(innerEyeRight.matrix).transpose();
  innerEyeRight.renderFast();

  let outerEyeLeft = new Cube();
  outerEyeLeft.color = [0,0,0,0];
  outerEyeLeft.textureNum = -2;
  if (g_normalOn) {outerEyeLeft.textureNum = -3}
  outerEyeLeft.matrix = new Matrix4(headLocationMat);
  outerEyeLeft.matrix.translate(0.25, 0.1, -0.01);
  let outerEyeLeftLocationMat = new Matrix4(outerEyeLeft.matrix);
  outerEyeLeft.matrix.scale(0.08,0.1,0.025);
  outerEyeLeft.normalMatrix.setInverseOf(outerEyeLeft.matrix).transpose();
  outerEyeLeft.renderFast();

  let innerEyeLeft = new Cube();
  innerEyeLeft.color = [0,0,1,1];
  innerEyeLeft.textureNum = -2;
  if (g_normalOn) {innerEyeLeft.textureNum = -3}
  innerEyeLeft.matrix = new Matrix4(outerEyeLeftLocationMat);
  innerEyeLeft.matrix.translate(0.015, 0, -0.01);
  innerEyeLeft.matrix.scale(0.06,0.08,0.1);
  innerEyeLeft.normalMatrix.setInverseOf(innerEyeLeft.matrix).transpose();
  innerEyeLeft.renderFast();

  // left Wing
  let leftWing = new Cube();
  leftWing.color = black;
  leftWing.textureNum = -2;
  if (g_normalOn) {leftWing.textureNum = -3}
  leftWing.matrix = new Matrix4(midBodyLocationMat);
  leftWing.matrix.translate(0.1, 0.12, 0.1);
  leftWing.matrix.rotate(g_leftWingAngle1, 0,0,1);
  leftWing.normalMatrix.setInverseOf(leftWing.matrix).transpose();
  
  let wingMatrixLeft = new Matrix4(leftWing.matrix);
  leftWing.matrix.scale(0.05,0.3,0.2);
  leftWing.renderFast();
  
  let leftWing2 = new Cube();
  leftWing2.color = black;
  leftWing2.textureNum = -2;
  if (g_normalOn) {leftWing2.textureNum = -3}
  leftWing2.matrix = new Matrix4(wingMatrixLeft);
  leftWing2.matrix.translate(0,0.3,0);
  leftWing2.matrix.rotate(g_leftWingAngle2, 0,0,1);
  leftWing2.normalMatrix.setInverseOf(leftWing2.matrix).transpose();

  let wingMatrixLeft2 = new Matrix4(leftWing2.matrix);
  leftWing2.matrix.scale(0.05,0.3,0.2);
  leftWing2.renderFast();

  let leftWingTip = new Pyramid();
  leftWingTip.color = black;
  leftWingTip.textureNum = -2;
  if (g_normalOn) {leftWingTip.textureNum = -3}
  leftWingTip.matrix = new Matrix4(wingMatrixLeft2);
  leftWingTip.matrix.translate(0,0.3,0);
  leftWingTip.matrix.scale(0.05,0.2,0.2);
  leftWingTip.matrix.rotate(g_leftWingAngle3, 0,0,1);
  leftWingTip.render();

  // right Wing
  let rightWing = new Cube();
  rightWing.color = black;
  rightWing.textureNum = -2;
  if (g_normalOn) {rightWing.textureNum = -3}
  rightWing.matrix = new Matrix4(midBodyLocationMat);
  rightWing.matrix.translate(0.45, 0.14, 0.1);
  rightWing.matrix.rotate(g_rightWingAngle1, 0,0,1);
  rightWing.normalMatrix.setInverseOf(rightWing.matrix).transpose();

  let wingMatrixRight = new Matrix4(rightWing.matrix);
  rightWing.matrix.scale(0.05,0.3,0.2);
  rightWing.renderFast();

  let rightWing2 = new Cube();
  rightWing2.color = black;
  rightWing2.textureNum = -2;
  if (g_normalOn) {rightWing2.textureNum = -3}
  rightWing2.matrix = new Matrix4(wingMatrixRight);
  rightWing2.matrix.translate(0,0.3,0);
  rightWing2.matrix.rotate(g_rightWingAngle2, 0,0,1);
  rightWing2.normalMatrix.setInverseOf(rightWing2.matrix).transpose();

  let wingMatrixRight2 = new Matrix4(rightWing2.matrix);
  rightWing2.matrix.scale(0.05,0.3,0.2);
  rightWing2.renderFast();

  let rightWingTip = new Pyramid();
  rightWingTip.color = black;
  rightWingTip.textureNum = -2;
  if (g_normalOn) {rightWingTip.textureNum = -3}
  rightWingTip.matrix = new Matrix4(wingMatrixRight2);
  rightWingTip.matrix.translate(0,0.3,0);
  rightWingTip.matrix.rotate(g_rightWingAngle3, 0,0,1);
  rightWingTip.matrix.scale(0.05,0.2,0.2);
  rightWingTip.render();

  // Right Thigh
  let rightThigh = new Cube();
  rightThigh.color = [0.9,0.9,0.9,1];
  rightThigh.textureNum = -2;
  if (g_normalOn) {rightThigh.textureNum = -3}
  rightThigh.matrix = new Matrix4(bodyLocationMat);
  rightThigh.matrix.translate(0.1, -0.1 + g_rightLegOffsetY, 0.1 + g_rightLegOffsetZ);
  rightThigh.matrix.rotate(g_rightLegAngle1, 1,0,0);
  rightThigh.normalMatrix.setInverseOf(rightThigh.matrix).transpose();

  let rightThighMatrix = new Matrix4(rightThigh.matrix);
  rightThigh.matrix.scale(0.175,0.15,0.2);
  rightThigh.renderFast();

  // Right Calf
  let rightCalf = new Cube();
  rightCalf.color = [1,0.6,0,1];
  rightCalf.textureNum = -2;
  if (g_normalOn) {rightCalf.textureNum = -3}
  rightCalf.matrix = new Matrix4(rightThighMatrix);
  rightCalf.matrix.translate(0.035, -0.05, 0.05);
  rightCalf.matrix.rotate(g_rightLegAngle2,1,0,0);
  rightCalf.normalMatrix.setInverseOf(rightCalf.matrix).transpose();

  let rightCalfMatrix = new Matrix4(rightCalf.matrix);
  rightCalf.matrix.scale(0.1,0.15,0.1);
  rightCalf.renderFast();

  // Right Foot
  let rightFoot = new Cube();
  rightFoot.color = [1,0.6,0,1];
  rightFoot.textureNum = -2;
  if (g_normalOn) {rightFoot.textureNum = -3}
  rightFoot.matrix = new Matrix4(rightCalfMatrix);
  rightFoot.matrix.translate(-0.05, -0.03, -0.2);
  rightFoot.matrix.scale(0.2,0.05,0.3);
  rightFoot.matrix.rotate(g_rightLegAngle3, 1,0,0);
  rightFoot.normalMatrix.setInverseOf(rightFoot.matrix).transpose();
  rightFoot.renderFast();

  // Left Thigh
  let leftThigh = new Cube();
  leftThigh.color = [0.9,0.9,0.9,1];
  leftThigh.textureNum = -2;
  if (g_normalOn) {leftThigh.textureNum = -3}
  leftThigh.matrix = new Matrix4(bodyLocationMat);
  leftThigh.matrix.translate(0.35, -0.1 + g_leftLegOffsetY, 0.1 + g_leftLegOffsetZ);
  leftThigh.matrix.rotate(g_leftLegAngle1, 1, 0, 0);
  leftThigh.normalMatrix.setInverseOf(leftThigh.matrix).transpose();

  let leftThighMatrix = new Matrix4(leftThigh.matrix);
  leftThigh.matrix.scale(0.175,0.15,0.2);
  leftThigh.renderFast();

  // Left Calf
  let leftCalf = new Cube();
  leftCalf.color = [1,0.6,0,1];
  leftCalf.textureNum = -2;
  if (g_normalOn) {leftCalf.textureNum = -3}
  leftCalf.matrix = new Matrix4(leftThighMatrix);
  leftCalf.matrix.translate(0.035, -0.05, 0.05);
  leftCalf.matrix.rotate(g_leftLegAngle2,1,0,0);
  leftCalf.normalMatrix.setInverseOf(leftCalf.matrix).transpose();

  let leftCalfMatrix = new Matrix4(leftCalf.matrix);
  leftCalf.matrix.scale(0.1,0.15,0.1);
  leftCalf.renderFast();

  // Left Foot
  let leftFoot = new Cube();
  leftFoot.color = [1,0.6,0,1];
  leftFoot.textureNum = -2;
  if (g_normalOn) {leftFoot.textureNum = -3}
  leftFoot.matrix = new Matrix4(leftCalfMatrix);
  leftFoot.matrix.translate(-0.05, -0.03, -0.2);
  leftFoot.matrix.scale(0.2,0.05,0.3);
  leftFoot.matrix.rotate(g_leftLegAngle3,1,0,0);
  leftFoot.normalMatrix.setInverseOf(leftFoot.matrix).transpose();
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
