// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  var ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to blue
  ctx.fillRect(0, 0, canvas.width, canvas.height);        // Fill a rectangle with the color

  // Draw red vector
  var v1 = new Vector3([2.25, 2.25, 0]);
  drawVector(v1, "red");
}

function drawVector(v, color) {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  var centerX = canvas.width/2;
  var centerY = canvas.height/2;

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);

  ctx.lineTo(centerX + v.elements[0] * 20, centerY - v.elements[1] * 20);
  ctx.strokeStyle = color;
  ctx.stroke();
}

function handleDrawEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  ctx.fillStyle='black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var v1 = new Vector3([
    parseFloat(document.getElementById("v1x").value),
    parseFloat(document.getElementById("v1y").value),
    0
  ]);

  var v2 = new Vector3([
    parseFloat(document.getElementById("v2x").value),
    parseFloat(document.getElementById("v2y").value),
    0
  ]);

  drawVector(v1,"red");
  drawVector(v2, "blue");
}

function handleDrawOperationEvent() {
  handleDrawEvent();
  var op = document.getElementById("operations").value;
  var scalar = parseFloat(document.getElementById("scalar").value);

  var v1=new Vector3([
    parseFloat(v1x.value),
    parseFloat(v1y.value),
    0
  ]);

  var v2=new Vector3([
    parseFloat(v2x.value),
    parseFloat(v2y.value),
    0
  ]);

  if(op=="add") {
    let v3=new Vector3(v1.elements);
    v3.add(v2);
    drawVector(v3,"green");
  }

  if(op=="sub") {
    let v3=new Vector3(v1.elements);
    v3.sub(v2);
    drawVector(v3,"green");
  }

  if(op=="mul") {
    let v3=new Vector3(v1.elements);
    let v4=new Vector3(v2.elements);
    v3.mul(scalar);
    v4.mul(scalar);
    drawVector(v3,"green");
    drawVector(v4,"green");
  }

  if(op=="div") {
    let v3=new Vector3(v1.elements);
    let v4=new Vector3(v2.elements);
    v3.div(scalar);
    v4.div(scalar);
    drawVector(v3,"green");
    drawVector(v4,"green");
  }

  if(op=="mag") {
    console.log("v1 magnitude:",v1.magnitude());
    console.log("v2 magnitude:",v2.magnitude());
  }

  if(op=="norm") {
    v1.normalize();
    v2.normalize();
    drawVector(v1,"green");
    drawVector(v2,"green");
  }

  if (op=="angle") {
    console.log("Angle:", angleBetween(v1,v2));
  }

  if (op=="area") {
    console.log("Triangle area:", areaTriangle(v1,v2));
  }
}

function angleBetween(v1, v2) {
  let dot = Vector3.dot(v1, v2);
  let m1 = v1.magnitude();
  let m2 = v2.magnitude();
  let angle = Math.acos(dot/(m1*m2));
  return angle*180/Math.PI;
}

function areaTriangle(v1, v2) {
  let cross = Vector3.cross(v1, v2);
  let area = cross.magnitude()/2;
  return area;
}