/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
const WIN_Z = 0;  // default graphics window z coord in world space
const WIN_LEFT = 0; const WIN_RIGHT = 1;  // default left and right x coords in world space
const WIN_BOTTOM = 0; const WIN_TOP = 1;  // default top and bottom y coords in world space
const INPUT_TRIANGLES_URL = "https://ncsucgclass.github.io/prog3/triangles.json"; // triangles file loc
const INPUT_ELLIPSOIDS_URL = "https://ncsucgclass.github.io/prog3/ellipsoids.json"; // ellipsoids file loc
var Eye = new vec4.fromValues(0.5,0.5,-0.5,1.0); // default eye position in world space

/* input globals */
var inputTriangles; // the triangles read in from json
var numTriangleSets = 0; // the number of sets of triangles
var triSetSizes = []; // the number of triangles in each set

/* webgl globals */
var gl = null; // the all powerful gl object. It's all here folks!
var vertexBuffers = []; // this contains vertex coordinates in triples, organized by tri set
var triangleBuffers = []; // this contains indices into vertexBuffers in triples, organized by tri set
var vertexPositionAttrib; // where to put position for vertex shader
var modelMatrixULoc; // where to put the model matrix for vertex shader

var bgColor = 0;
var FSIZE = 4;
var EllipsoidBuffer = [];
var ElpNormBuffer = [];
var inputEllipsoids;
var vtxNum = [];
var view;
var projection;
var ambient;
var diffuse;
var specular;
var Norm;
var Light;
var Half;
var n;
var Cx;
var Cy;
var Cz;
var a;
var b;
var c;
var vertexBuffer_oneArray;
var numTriVtx = 0;
var TriNormBuffer = [];
var TriMatrix;
var eye = [0.5, 0.5, -0.5];
var light = [-0.5, 1.5, -0.5];
var Model;
var V = mat4.create();
var P = mat4.create();
mat4.lookAt(V, vec3.fromValues(0.5, 0.5, -0.5), vec3.fromValues(0.5, 0.5, 0), vec3.fromValues(0, 1, 0));
mat4.perspective(P, Math.PI/2, 1, 0.5, 1.5);
var identity = mat4.create();
var currentModel = [-1, 0];// currentModel[0]=0:triangle, currentModel[0]=1:ellipsoid, currentModel[1]:which set
// currentModel[0][0]=0:triangle, currentModel[0][0]=1:ellipsoid, currentModel[0][1]:which set, currentModel[1]:hightlight, currentModel[2]:rotation, currentModel[3]:translation
var currentModelV2 = [[-1, 0], mat4.create(), mat4.create(), mat4.create()];
var currentModelV3 = [[-1, 0], [], []];
var translationModel = vec3.fromValues(0, 0, 0);
var rotationRad = 0;
var rotationAxis = vec3.fromValues(1, 0, 0);
//center to scaling
var centerTri = [];
var centerElp = [];
//rotationModel
var rotationXModel = [[1, 0 , 0], 0];
var rotationYModel = [[0, 1 , 0], 0];
var rotationZModel = [[0, 0 , 1], 0];
//highlightmodel
var hl = 1.2;
var dhl = 0.833;
var highlight = [mat4.fromScaling(mat4.create(), vec3.fromValues(1.2, 1.2, 1.2)), mat4.fromScaling(mat4.create(), vec3.fromValues(0.833, 0.833, 0.833)), identity];
var highlightModel = highlight[2];



// ASSIGNMENT HELPER FUNCTIONS

// Vector class
class Vector {
    constructor(x=0,y=0,z=0) {
        this.set(x,y,z);
    } // end constructor

    // sets the components of a vector
    set(x,y,z) {
        try {
            if ((typeof(x) !== "number") || (typeof(y) !== "number") || (typeof(z) !== "number"))
                throw "vector component not a number";
            else
                this.x = x; this.y = y; this.z = z;
        } // end try

        catch(e) {
            console.log(e);
        }
    } // end vector set

    // copy the passed vector into this one
    copy(v) {
        try {
            if (!(v instanceof Vector))
                throw "Vector.copy: non-vector parameter";
            else
                this.x = v.x; this.y = v.y; this.z = v.z;
        } // end try

        catch(e) {
            console.log(e);
        }
    }

    toConsole(prefix) {
        console.log(prefix+"["+this.x+","+this.y+","+this.z+"]");
    } // end to console

    // static dot method
    static dot(v1,v2) {
        try {
            if (!(v1 instanceof Vector) || !(v2 instanceof Vector))
                throw "Vector.dot: non-vector parameter";
            else
                return(v1.x*v2.x + v1.y*v2.y + v1.z*v2.z);
        } // end try

        catch(e) {
            console.log(e);
            return(NaN);
        }
    } // end dot static method

    // static add method
    static add(v1,v2) {
        try {
            if (!(v1 instanceof Vector) || !(v2 instanceof Vector))
                throw "Vector.add: non-vector parameter";
            else
                return(new Vector(v1.x+v2.x,v1.y+v2.y,v1.z+v2.z));
        } // end try

        catch(e) {
            console.log(e);
            return(new Vector(NaN,NaN,NaN));
        }
    } // end add static method

    // static subtract method, v1-v2
    static subtract(v1,v2) {
        try {
            if (!(v1 instanceof Vector) || !(v2 instanceof Vector))
                throw "Vector.subtract: non-vector parameter";
            else {
                var v = new Vector(v1.x-v2.x,v1.y-v2.y,v1.z-v2.z);
                //v.toConsole("Vector.subtract: ");
                return(v);
            }
        } // end try

        catch(e) {
            console.log(e);
            return(new Vector(NaN,NaN,NaN));
        }
    } // end subtract static method

    // static scale method
    static scale(c,v) {
        try {
            if (!(typeof(c) === "number") || !(v instanceof Vector)){
                //throw "Vector.scale: malformed parameter";
            }

            else
                return(new Vector(c*v.x,c*v.y,c*v.z));
        } // end try

        catch(e) {
            console.log(e);
            return(new Vector(NaN,NaN,NaN));
        }
    } // end scale static method

    // static normalize method
    static normalize(v) {
        try {
            if (!(v instanceof Vector))
                throw "Vector.normalize: parameter not a vector";
            else {
                var lenDenom = 1/Math.sqrt(Vector.dot(v,v));
                return(Vector.scale(lenDenom,v));
            }
        } // end try

        catch(e) {
            console.log(e);
            return(new Vector(NaN,NaN,NaN));
        }
    } // end scale static method

} // end Vector class

var viewer = new Vector(0.5, 0.5, -0.5);

// get the JSON file from the passed URL
function getJSONFile(url,descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET",url,false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return JSON.parse(httpReq.response); 
        } // end if good params
    } // end try    
    
    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input json file

// set up the webGL environment
function setupWebGL() {

    // Get the canvas and context
    var canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
    gl = canvas.getContext("webgl"); // get a webgl object from it
    
    try {
      if (gl == null) {
        throw "unable to create gl context -- is your browser gl ready?";
      } else {
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
        gl.clearDepth(1.0); // use max when we clear the depth buffer
        gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
      }
    } // end try
    
    catch(e) {
      console.log(e);
    } // end catch
 
} // end setupWebGL

//read ellipsoids in, load them into webgl buffers
function loadEllipsoids(){
    inputEllipsoids = getJSONFile(INPUT_ELLIPSOIDS_URL, "ellipsoids")
    
    var deg = Math.PI/180;
    for (var numEllipsoid = 0; numEllipsoid < inputEllipsoids.length; numEllipsoid++){
        Cx = inputEllipsoids[numEllipsoid].x;
        Cy = inputEllipsoids[numEllipsoid].y;
        Cz = inputEllipsoids[numEllipsoid].z;
        centerElp[numEllipsoid] = [Cx, Cy, Cz];
        a = inputEllipsoids[numEllipsoid].a;
        b = inputEllipsoids[numEllipsoid].b;
        c = inputEllipsoids[numEllipsoid].c;
        vtxNum[numEllipsoid] = 0;
        inputEllipsoids[numEllipsoid].coordArray = []; // create a list of coords for this tri set
        inputEllipsoids[numEllipsoid].normArray = [];
        for (var alpha = 0; alpha <= 180; alpha+= 1){
            for(var beta = 0; beta < 360; beta+= 1){
                x = a * Math.sin(alpha*deg) * Math.cos(beta*deg) + Cx;
                y = b * Math.sin(alpha*deg) * Math.sin(beta*deg) + Cy;
                z = c * Math.cos(alpha*deg) + Cz;
                //push coord to array
                inputEllipsoids[numEllipsoid].coordArray.push(x, y, z);
                //push diffuse to array
                inputEllipsoids[numEllipsoid].coordArray.push(inputEllipsoids[numEllipsoid].diffuse[0], 
                                                              inputEllipsoids[numEllipsoid].diffuse[1],
                                                              inputEllipsoids[numEllipsoid].diffuse[2]);
                //push ambient to array
                inputEllipsoids[numEllipsoid].coordArray.push(inputEllipsoids[numEllipsoid].ambient[0], 
                                                              inputEllipsoids[numEllipsoid].ambient[1],
                                                              inputEllipsoids[numEllipsoid].ambient[2]);
                //push specular to array
                inputEllipsoids[numEllipsoid].coordArray.push(inputEllipsoids[numEllipsoid].specular[0], 
                                                              inputEllipsoids[numEllipsoid].specular[1],
                                                              inputEllipsoids[numEllipsoid].specular[2]);
                //push n to array
                inputEllipsoids[numEllipsoid].coordArray.push(inputEllipsoids[numEllipsoid].n);
                //push norm vector to array
                var normvec = Vector.normalize(new Vector(2*(x-Cx)/Math.pow(a, 2), 2*(y-Cy)/Math.pow(b, 2), 2*(z-Cz)/Math.pow(c, 2)));
                inputEllipsoids[numEllipsoid].normArray.push(normvec.x,
                                                             normvec.y,
                                                             normvec.z);
                //push Light vector to array
                var lightvec = Vector.normalize(new Vector(light[0] - x, light[1] - y, light[2] - z));
                inputEllipsoids[numEllipsoid].normArray.push(lightvec.x,
                                                             lightvec.y,
                                                             lightvec.z);
                //calculate V
                var Viewvec = Vector.normalize(new Vector(eye[0] - x, eye[1] - y, eye[2] - z));
                //push Half vector to array
                var Halfvec = Vector.normalize(Vector.add(lightvec, Viewvec));
                inputEllipsoids[numEllipsoid].normArray.push(Halfvec.x,
                                                             Halfvec.y,
                                                             Halfvec.z);
                vtxNum[numEllipsoid]++;
            }
        }
        //console.log('ELP coordArray', inputEllipsoids[numEllipsoid].coordArray);
        EllipsoidBuffer[numEllipsoid] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, EllipsoidBuffer[numEllipsoid]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(inputEllipsoids[numEllipsoid].coordArray), gl.STATIC_DRAW);
        ElpNormBuffer[numEllipsoid] = gl.createBuffer(); //DID NOT normalize!
        gl.bindBuffer(gl.ARRAY_BUFFER, ElpNormBuffer[numEllipsoid]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(inputEllipsoids[numEllipsoid].normArray), gl.STATIC_DRAW);
    }
    
}

//useless
function loadTriangles_oneArray(){
    var inputTriangles = getJSONFile(INPUT_TRIANGLES_URL,"triangles");
    var whichSetVert; // index of vertex in current triangle set
    var whichSetTri; // index of triangle in current triangle set
    var Array = [];
    var vtx = [];
    var TriNormArray = [];
    //coordArray with color
    //data
    for (var whichSet2=0; whichSet2<inputTriangles.length; whichSet2++) {
        //triangle
        for (whichSetTri=0; whichSetTri<inputTriangles[whichSet2].triangles.length; whichSetTri++){
            //vertex
            // set up the vertex coord array
            for (whichSetVert=0; whichSetVert<inputTriangles[whichSet2].triangles[whichSetTri].length;
                 whichSetVert++){
                var currentVertex2 = inputTriangles[whichSet2].triangles[whichSetTri][whichSetVert]
                Array = Array.concat(inputTriangles[whichSet2].vertices[currentVertex2]); //coord
                vtx.push(inputTriangles[whichSet2].vertices[currentVertex2]);
                numTriVtx++;
                Array = Array.concat(inputTriangles[whichSet2].material.diffuse); //diffuse
                Array = Array.concat(inputTriangles[whichSet2].material.ambient); //ambient
                Array = Array.concat(inputTriangles[whichSet2].material.specular); //specular
                Array = Array.concat(inputTriangles[whichSet2].material.n); //n
            }
        }
    } // end for each triangle set
    //norm array
    for (var i=0; i<numTriVtx; i=i+3){
        var V1 = vtx[i];
        var V2 = vtx[i+1];
        var V3 = vtx[i+2];
        var x = (V2[1]-V1[1])*(V3[2]-V1[2])-(V2[2]-V1[2])*(V3[1]-V1[1]);
        var y = (V2[2]-V1[2])*(V3[0]-V1[0])-(V2[0]-V1[0])*(V3[2]-V1[2]);
        var z = (V2[0]-V1[0])*(V3[1]-V1[1])-(V2[1]-V1[1])*(V3[0]-V1[0]);
        var lightvec1 = Vector.normalize(new Vector(light[0]-V1[0], light[1]-V1[1], light[2]-V1[2]));
        var lightvec2 = Vector.normalize(new Vector(light[0]-V2[0], light[1]-V2[1], light[2]-V2[2]));
        var lightvec3 = Vector.normalize(new Vector(light[0]-V3[0], light[1]-V3[1], light[2]-V3[2]));
        var viewvec1 = Vector.normalize(new Vector(eye[0]-V1[0], eye[1]-V1[1], eye[2]-V1[2]));
        var viewvec2 = Vector.normalize(new Vector(eye[0]-V2[0], eye[1]-V2[1], eye[2]-V2[2]));
        var viewvec3 = Vector.normalize(new Vector(eye[0]-V3[0], eye[1]-V3[1], eye[2]-V3[2]));
        var halfvec1 = Vector.normalize(Vector.add(lightvec1, viewvec1));
        var halfvec2 = Vector.normalize(Vector.add(lightvec2, viewvec2));
        var halfvec3 = Vector.normalize(Vector.add(lightvec3, viewvec3));
        TriNormArray.push(0, 0, -1);
        TriNormArray.push(lightvec1.x, lightvec1.y, lightvec1.z);
        TriNormArray.push(halfvec1.x, halfvec1.y, halfvec1.z);
        TriNormArray.push(0, 0, -1);
        TriNormArray.push(lightvec2.x, lightvec2.y, lightvec2.z);
        TriNormArray.push(halfvec2.x, halfvec2.y, halfvec2.z);
        TriNormArray.push(0, 0, -1);
        TriNormArray.push(lightvec3.x, lightvec3.y, lightvec3.z);
        TriNormArray.push(halfvec3.x, halfvec3.y, halfvec3.z);
        //push Light vector to array
        //push Half vector to array
        //do it for 3 vertices  
    }
    console.log(Array);
    // console.log(TriNormArray);
    // send the vertex coords to webGL
    vertexBuffer_oneArray = gl.createBuffer(); // init empty vertex coord buffer
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer_oneArray); // activate that buffer
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(Array),gl.STATIC_DRAW); // coords to that buffer
    //send norm array to webGL
    TriNormBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, TriNormBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(TriNormArray), gl.STATIC_DRAW);
}

// read triangles in, load them into webgl buffers
function loadTriangles() {
    inputTriangles = getJSONFile(INPUT_TRIANGLES_URL,"triangles");

    if (inputTriangles != String.null) { 
        var whichSetVert; // index of vertex in current triangle set
        var whichSetTri; // index of triangle in current triangle set
        var vtxToAdd; // vtx coords to add to the coord array
        var triToAdd; // tri indices to add to the index array
        var vtxcToAdd;
        var vtxaToAdd;
        var vtxsToAdd;
        var vtxnToAdd;
        var vtxNormToAdd;
        var vtxLightToAdd;
        var view;
        var vtxHalfToAdd;

        // for each set of tris in the input file
        numTriangleSets = inputTriangles.length;
        for (var whichSet=0; whichSet<numTriangleSets; whichSet++) {
            centerTri[whichSet] = [0, 0, 0];
            // set up the vertex coord array
            inputTriangles[whichSet].coordArray = []; // create a list of coords for this tri set
            inputTriangles[whichSet].normArray = []; // create a list of coords for this tri set
            for (whichSetVert=0; whichSetVert<inputTriangles[whichSet].vertices.length; whichSetVert++) {
                vtxToAdd = inputTriangles[whichSet].vertices[whichSetVert];
                vtxcToAdd = inputTriangles[whichSet].material.diffuse;
                vtxaToAdd = inputTriangles[whichSet].material.ambient;
                vtxsToAdd = inputTriangles[whichSet].material.specular;
                vtxnToAdd = inputTriangles[whichSet].material.n;
                vtxNormToAdd = inputTriangles[whichSet].normals[whichSetVert];
                vtxLightToAdd = Vector.normalize(new Vector(light[0]-vtxToAdd[0], light[1]-vtxToAdd[1], light[2]-vtxToAdd[2]));
                view = Vector.normalize(new Vector(eye[0]-vtxToAdd[0], eye[1]-vtxToAdd[1], eye[2]-vtxToAdd[2]));
                vtxHalfToAdd = Vector.normalize(Vector.add(vtxLightToAdd, view));
                //push coord array
                inputTriangles[whichSet].coordArray.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]); //push vtx
                inputTriangles[whichSet].coordArray.push(vtxcToAdd[0],vtxcToAdd[1],vtxcToAdd[2]); //push diffuse
                inputTriangles[whichSet].coordArray.push(vtxaToAdd[0],vtxaToAdd[1],vtxaToAdd[2]); //push ambient
                inputTriangles[whichSet].coordArray.push(vtxsToAdd[0],vtxsToAdd[1],vtxsToAdd[2]); //push specular
                inputTriangles[whichSet].coordArray.push(vtxnToAdd); //push n
                //push norm array
                inputTriangles[whichSet].normArray.push(vtxNormToAdd[0],vtxNormToAdd[1],vtxNormToAdd[2]); //push norm
                inputTriangles[whichSet].normArray.push(vtxLightToAdd.x,vtxLightToAdd.y,vtxLightToAdd.z); //push light
                inputTriangles[whichSet].normArray.push(vtxHalfToAdd.x,vtxHalfToAdd.y,vtxHalfToAdd.z); //push half
                //collect vertex info for center
                centerTri[whichSet][0] += vtxToAdd[0];
                centerTri[whichSet][1] += vtxToAdd[1];
                centerTri[whichSet][2] += vtxToAdd[2];
            } // end for vertices in set
            //calculate center
            centerTri[whichSet][0] = centerTri[whichSet][0]/3;
            centerTri[whichSet][1] = centerTri[whichSet][1]/3;
            centerTri[whichSet][2] = centerTri[whichSet][2]/3;

            // send the vertex coords to webGL
            //console.log('TRI normArray', inputTriangles[whichSet].normArray);
            vertexBuffers[whichSet] = gl.createBuffer(); // init empty vertex coord buffer for current set
            gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichSet]); // activate that buffer
            gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].coordArray),gl.STATIC_DRAW); // coords to that buffer

            //triangle norm array
            TriNormBuffer[whichSet] = gl.createBuffer(); //DID NOT normalize!
            gl.bindBuffer(gl.ARRAY_BUFFER, TriNormBuffer[whichSet]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(inputTriangles[whichSet].normArray), gl.STATIC_DRAW);
            
            // set up the triangle index array, adjusting indices across sets
            inputTriangles[whichSet].indexArray = []; // create a list of tri indices for this tri set
            triSetSizes[whichSet] = inputTriangles[whichSet].triangles.length;
            for (whichSetTri=0; whichSetTri<triSetSizes[whichSet]; whichSetTri++) {
                triToAdd = inputTriangles[whichSet].triangles[whichSetTri];
                inputTriangles[whichSet].indexArray.push(triToAdd[0],triToAdd[1],triToAdd[2]);
            } // end for triangles in set

            // send the triangle indices to webGL
            triangleBuffers[whichSet] = gl.createBuffer(); // init empty triangle index buffer for current tri set
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[whichSet]); // activate that buffer
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(inputTriangles[whichSet].indexArray),gl.STATIC_DRAW); // indices to that buffer
        } // end for each triangle set 
    } // end if triangles found
} // end load triangles

// setup the webGL shaders
function setupShaders() {
    
    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
        precision mediump float;
        varying vec4 v_Color;
        void main(void) {
            gl_FragColor = v_Color; // all fragments are white
        }
    `;
    
    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
        attribute vec3 vertexPosition;
        attribute vec3 diffuse;
        attribute vec3 ambient;
        attribute vec3 specular;
        varying vec4 v_Color;
        uniform mat4 uModelMatrix; // the model matrix
        uniform mat4 view; // the view matrix
        uniform mat4 projection;
        // Apply lighting effect
        attribute highp vec3 Norm;
        attribute highp vec3 Half;
        attribute highp vec3 Light;
        attribute highp float n;
        // highp vec3 directionalLightColor = vec3(1, 1, 1); //white light
        // highp vec3 directionalVector = vec3(-0.5 ,1.5, -0.5);
        // highp vec3 Eye = vec3(0.5 ,0.5, -0.5);

        void main(void) {
            // position  
            gl_Position = projection * view * uModelMatrix * vec4(vertexPosition, 1.0);
            //color
            float NdotL = dot(Norm, Light);
            float NdotH = dot(Norm, Half);
            float maxNdotL = max(NdotL, 0.0);
            float maxNdotH = max(NdotH, 0.0);
            v_Color = vec4(ambient, 1.0) + vec4(diffuse * maxNdotL, 1.0) + vec4(specular * pow(maxNdotH, n), 1.0);
            
        }
    `;
    
    try {
        // console.log("fragment shader: "+fShaderCode);
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader,fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        // console.log("vertex shader: "+vShaderCode);
        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader,vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution
            
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);  
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);  
            gl.deleteShader(vShader);
        } else { // no compile errors
            var shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)
                vertexPositionAttrib = // get pointer to vertex shader input
                    gl.getAttribLocation(shaderProgram, "vertexPosition"); 
                modelMatrixULoc = gl.getUniformLocation(shaderProgram, "uModelMatrix"); // ptr to mmat
                view = gl.getUniformLocation(shaderProgram, "view"); // ptr to mmat
                projection = gl.getUniformLocation(shaderProgram, "projection"); // ptr to mmat

                gl.enableVertexAttribArray(vertexPositionAttrib); // input to shader from array
                //color
                diffuse = gl.getAttribLocation(shaderProgram, 'diffuse');
                gl.enableVertexAttribArray(diffuse);
                ambient = gl.getAttribLocation(shaderProgram, 'ambient');
                gl.enableVertexAttribArray(ambient);
                specular = gl.getAttribLocation(shaderProgram, 'specular');
                gl.enableVertexAttribArray(specular);

                //vectors
                Norm = gl.getAttribLocation(shaderProgram, 'Norm');
                gl.enableVertexAttribArray(Norm);
                Light = gl.getAttribLocation(shaderProgram, 'Light');
                gl.enableVertexAttribArray(Light);
                Half = gl.getAttribLocation(shaderProgram, 'Half');
                gl.enableVertexAttribArray(Half);
                n = gl.getAttribLocation(shaderProgram, 'n');
                gl.enableVertexAttribArray(n);
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end setup shaders

// render the loaded model
function renderTriangles() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
    
    //change background color
    // bgColor = (bgColor < 1) ? (bgColor + 0.001) : 0;
    // gl.clearColor(bgColor, 0, 0, 1.0);
    requestAnimationFrame(renderTriangles);

    
    for (var whichTriSet=0; whichTriSet<numTriangleSets; whichTriSet++) { 
        // define the modeling matrix 
        inputTriangles[whichTriSet].mMatrix = mat4.create(); // modeling mat for tri set


        // pass modeling matrix for set to shadeer
        gl.uniformMatrix4fv(modelMatrixULoc, false, inputTriangles[whichTriSet].mMatrix);

        // vertex buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichTriSet]); // activate
        gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,6*FSIZE,0); // feed
        gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 6*FSIZE, 3* FSIZE);

        // triangle buffer: activate and render
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffers[whichTriSet]); // activate
        gl.drawElements(gl.TRIANGLES,3*triSetSizes[whichTriSet],gl.UNSIGNED_SHORT,0); // render
    } // end for each tri set
} // end render triangles

//render triangles in 1 array
function renderTrianglesOneArray(){
    //render Triangles in ONE array
    // define the modeling matrix 
    TriMatrix = mat4.create(); // modeling mat for tri set
    //Model = keyEvent();
    //console.log(Model);
    //mat4.multiply(TriMatrix,Model,TriMatrix); // rotate 90 degs
    
    // pass modeling matrix for set to shadeer
    gl.uniformMatrix4fv(modelMatrixULoc, false, TriMatrix);
    gl.uniformMatrix4fv(view, false, V);
    gl.uniformMatrix4fv(projection, false, P);
    
    // vertex buffer: activate and feed into vertex shader
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer_oneArray); // activate
    gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,13*FSIZE,0); // vtx coord
    gl.vertexAttribPointer(diffuse, 3, gl.FLOAT, false, 13*FSIZE, 3* FSIZE); // diffuse
    gl.vertexAttribPointer(ambient, 3, gl.FLOAT, false, 13*FSIZE, 6* FSIZE); //ambient
    gl.vertexAttribPointer(specular, 3, gl.FLOAT, false, 13*FSIZE, 9* FSIZE); //specular
    gl.vertexAttribPointer(n, 1, gl.FLOAT, false, 13*FSIZE, 12* FSIZE);


    //norm buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, TriNormBuffer);
    gl.vertexAttribPointer(Norm, 3, gl.FLOAT, false, 9*FSIZE, 0);
    gl.vertexAttribPointer(Light, 3, gl.FLOAT, false, 9*FSIZE, 3*FSIZE);
    gl.vertexAttribPointer(Half, 3, gl.FLOAT, false, 9*FSIZE, 6*FSIZE);

    // triangle buffer: activate and render
    gl.drawArrays(gl.TRIANGLES,0, numTriVtx); // render
}//useless

// render the loaded ellipsoids model
function renderEllipsoids() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
    

    requestAnimationFrame(renderEllipsoids);
    
    for (var whichElpSet=0; whichElpSet<inputEllipsoids.length; whichElpSet++) { 
        // define the modeling matrix 
        inputEllipsoids[whichElpSet].mMatrix = mat4.create(); // modeling mat for tri set


        // pass modeling matrix for set to shadeer
        gl.uniformMatrix4fv(modelMatrixULoc, false, inputEllipsoids[whichElpSet].mMatrix);

        // vertex buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER,EllipsoidBuffer[whichElpSet]); // activate
        gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,6*FSIZE,0); // feed
        gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 6*FSIZE, 3* FSIZE);

        
        gl.drawArrays(gl.TRIANGLE_FAN, 0, vtxNum[whichElpSet]); // render
    } // end for each tri set
} // end render triangles

//render all
function renderAll(){
    var selection;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
    gl.viewport(0, 0, 512, 512);
    

    //render Triangles
    for (var whichTriSet=0; whichTriSet<numTriangleSets; whichTriSet++) { 
        // define the modeling matrix 
        inputTriangles[whichTriSet].mMatrix = mat4.create(); // modeling mat for tri set
        
        //find the highlight model 
        if (currentModel[0]==0 && currentModel[1]==whichTriSet) {
            //highlight
            mat4.multiply(inputTriangles[whichTriSet].mMatrix,
                          mat4.fromScaling(mat4.create(), vec3.fromValues(1.2, 1.2, 1.2)),
                          inputTriangles[whichTriSet].mMatrix);
            //rotate
            mat4.multiply(inputTriangles[whichTriSet].mMatrix,
                          mat4.fromRotation(mat4.create(), rotationRad, rotationAxis),
                          inputTriangles[whichTriSet].mMatrix);
            //translate
            mat4.multiply(inputTriangles[whichTriSet].mMatrix,
                          mat4.fromTranslation(mat4.create(), translationModel),
                          inputTriangles[whichTriSet].mMatrix);
        }

        //dehighlight model
        if (currentModel[0] == -1) {
            inputTriangles[whichTriSet].mMatrix = mat4.create();
        }

        // pass modeling matrix for set to shadeer
        gl.uniformMatrix4fv(modelMatrixULoc, false, inputTriangles[whichTriSet].mMatrix);
        gl.uniformMatrix4fv(view, false, V);
        gl.uniformMatrix4fv(projection, false, P);
        

        // vertex buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichTriSet]); // activate
        gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,13*FSIZE, 0); // vtx coord
        gl.vertexAttribPointer(diffuse, 3, gl.FLOAT, false, 13*FSIZE, 3* FSIZE); // diffuse
        gl.vertexAttribPointer(ambient, 3, gl.FLOAT, false, 13*FSIZE, 6* FSIZE); //ambient
        gl.vertexAttribPointer(specular, 3, gl.FLOAT, false, 13*FSIZE, 9* FSIZE); //specular
        gl.vertexAttribPointer(n, 1, gl.FLOAT, false, 13*FSIZE, 12* FSIZE);
    
    
        //norm buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, TriNormBuffer[whichTriSet]);
        gl.vertexAttribPointer(Norm, 3, gl.FLOAT, false, 9*FSIZE, 0);
        gl.vertexAttribPointer(Light, 3, gl.FLOAT, false, 9*FSIZE, 3*FSIZE);
        gl.vertexAttribPointer(Half, 3, gl.FLOAT, false, 9*FSIZE, 6*FSIZE);

        // triangle buffer: activate and render
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffers[whichTriSet]); // activate
        gl.drawElements(gl.TRIANGLES,3*triSetSizes[whichTriSet],gl.UNSIGNED_SHORT,0); // render
    } // end for each tri set

    //render Ellipsoids
    for (var whichElpSet=0; whichElpSet<inputEllipsoids.length; whichElpSet++) {
        
        // define the modeling matrix 
        inputEllipsoids[whichElpSet].mMatrix = mat4.create(); // modeling mat for tri set
        
        //find the highlight model 
        if (currentModel[0]==1 && currentModel[1]==whichElpSet) {
            //highlight
            mat4.multiply(inputEllipsoids[whichElpSet].mMatrix,
                          mat4.fromScaling(mat4.create(), vec3.fromValues(1.2, 1.2, 1.2)),
                          inputEllipsoids[whichElpSet].mMatrix);
            //rotate
            mat4.multiply(inputEllipsoids[whichElpSet].mMatrix,
                          mat4.fromRotation(mat4.create(), rotationRad, rotationAxis),
                          inputEllipsoids[whichElpSet].mMatrix);
            //translate
            mat4.multiply(inputEllipsoids[whichElpSet].mMatrix,
                          mat4.fromTranslation(mat4.create(), translationModel),
                          inputEllipsoids[whichElpSet].mMatrix);
        }

        //dehighlight model
        if (currentModel[0] == -1) {
            inputEllipsoids[whichElpSet].mMatrix = mat4.create();
        }

        // pass modeling matrix for set to shadeer
        
        gl.uniformMatrix4fv(modelMatrixULoc, false, inputEllipsoids[whichElpSet].mMatrix);
        gl.uniformMatrix4fv(view, false, V);
        gl.uniformMatrix4fv(projection, false, P);
        

        // vertex buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER,EllipsoidBuffer[whichElpSet]); // activate
        gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,13*FSIZE, 0); // vtx coord
        gl.vertexAttribPointer(diffuse, 3, gl.FLOAT, false, 13*FSIZE, 3* FSIZE); // diffuse
        gl.vertexAttribPointer(ambient, 3, gl.FLOAT, false, 13*FSIZE, 6* FSIZE); //ambient
        gl.vertexAttribPointer(specular, 3, gl.FLOAT, false, 13*FSIZE, 9* FSIZE); //specular
        gl.vertexAttribPointer(n, 1, gl.FLOAT, false, 13*FSIZE, 12* FSIZE);

        //norm buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, ElpNormBuffer[whichElpSet]);
        gl.vertexAttribPointer(Norm, 3, gl.FLOAT, false, 9*FSIZE, 0);
        gl.vertexAttribPointer(Light, 3, gl.FLOAT, false, 9*FSIZE, 3*FSIZE);
        gl.vertexAttribPointer(Half, 3, gl.FLOAT, false, 9*FSIZE, 6*FSIZE);

        
        gl.drawArrays(gl.TRIANGLE_FAN, 0, vtxNum[whichElpSet]); // render
    } // end for each tri set
    keyEvent();
    requestAnimationFrame(renderAll);
    
}//useless

//keyboard event
function keyEvent(){
    document.addEventListener('keyup', function(e){
    let key = e.key;

    switch(key){
        //a-S: To implement these changes you will need to change the eye, lookAt and lookUp vectors used to form your viewing transform.
        case 'a': //a
            mat4.multiply(V, mat4.fromTranslation(mat4.create(),vec3.fromValues(-0.01, 0, 0)), V); // move back to center
            console.log('a pressed');
            break;
        case 'd': //d
            mat4.multiply(V, mat4.fromTranslation(mat4.create(),vec3.fromValues(0.01, 0, 0)), V); // move back to center
            console.log('d pressed');
            break;
        case 'w': //w
            mat4.multiply(V, mat4.fromTranslation(mat4.create(),vec3.fromValues(0, 0, 0.01)), V);
            console.log('w pressed');
            break;
        case 's': //s
            mat4.multiply(V, mat4.fromTranslation(mat4.create(),vec3.fromValues(0, 0, -0.01)), V);
            console.log('s pressed');
            break;
        case 'q': //q
            mat4.multiply(V, mat4.fromTranslation(mat4.create(),vec3.fromValues(0, -0.01, 0)), V);
            console.log('q pressed');
            break;
        case 'e': //e
            mat4.multiply(V, mat4.fromTranslation(mat4.create(),vec3.fromValues(0, 0.01, 0)), V);
            console.log('e pressed');
            break;
        case 'A': //A
            mat4.multiply(V, mat4.fromRotation(mat4.create(), -Math.PI/180, vec3.fromValues(0, 1, 0)), V);
            console.log('A pressed');
            break;
        case 'D': //D
            mat4.multiply(V, mat4.fromRotation(mat4.create(), Math.PI/180, vec3.fromValues(0, 1, 0)), V);
            console.log('D pressed');
            break;
        case 'W': //W
            mat4.multiply(V, mat4.fromRotation(mat4.create(), -Math.PI/180, vec3.fromValues(1, 0, 0)), V);
            console.log('W pressed');
            break;
        case 'S': //S
            mat4.multiply(V, mat4.fromRotation(mat4.create(), Math.PI/180, vec3.fromValues(1, 0, 0)), V);
            console.log('S pressed');
            break;
        case 'ArrowLeft': //left
            currentModel[0] = 0;
            currentModel[1]--;
            currentModel[1] = Math.abs(currentModel[1]%2);
            console.log('left pressed');
            break;
        case 'ArrowRight': //right
            currentModel[0] = 0;
            currentModel[1]++;
            currentModel[1] = Math.abs(currentModel[1]%2);
            console.log('right pressed');
            break;
        case 'ArrowUp': //up
            currentModel[0] = 1;
            currentModel[1]--;
            currentModel[1] = Math.abs(currentModel[1]%3);
            console.log('up pressed');
            break;
        case 'ArrowDown': //down
            currentModel[0] = 1;
            currentModel[1]++;
            currentModel[1] = Math.abs(currentModel[1]%3);
            console.log('down pressed');
            break;
        case ' ': //space
            currentModel[0] = -1;
            console.log('space pressed');
            break;
        case 'k': //k
            translationModel[0] += -0.01;
            console.log('k pressed');
            break;
        case ';': //;
            translationModel[0] += 0.01;
            console.log('; pressed');
            break;
        case 'o': //o
            translationModel[2] += 0.01;
            console.log('o pressed');
            break;
        case 'l': //l
            translationModel[2] += -0.01;
            console.log('I pressed');
            break;
        case 'i': //i
            translationModel[1] += 0.01;
            console.log('i pressed');
            break;
        case 'p': //p
            translationModel[1] += -0.01;
            console.log('p pressed');
            break;
        case 'K': //K
            rotationRad += Math.PI/180;
            rotationRad[1] = 1;
            console.log('K pressed');
            break;
        case ':': //:
            rotationRad += -Math.PI/180;
            rotationRad[1] = 1;
            console.log(': pressed');
            break;
        case 'O': //O
            rotationRad += Math.PI/180;
            rotationRad[0] = 1;
            console.log('O pressed');
            break;
        case 'L': //I
            rotationRad += -Math.PI/180;
            rotationRad[0] = 1;
            console.log('L pressed');
            break;
        case 'I': //I
            rotationRad += Math.PI/180;
            rotationRad[2] = 1;
            console.log('I pressed');
            break;
        case 'P': //P
            rotationRad += -Math.PI/180;
            rotationRad[2] = 1;
            console.log('P pressed');
            break;
        default:
            //requestAnimationFrame(renderAll);
            console.log('defult');
            break;
        
        }
        
    })
    //requestAnimationFrame(renderAll);
}//useless

//init currentModel
function initCurrentModel(){
    for(var i = 0; i < numTriangleSets; i++){
        currentModelV3[1][i] = [vec3.fromValues(1, 1, 1), 0, 0, 0, vec3.fromValues(0, 0, 0)];
    }
    for (var j = 0; j < inputEllipsoids.length; j++){
        currentModelV3[2][j] = [vec3.fromValues(1, 1, 1), 0, 0, 0, vec3.fromValues(0, 0, 0)];
    }
    return;
}

function renderWithKey(){
    var selection;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
    gl.viewport(0, 0, 512, 512);
    
    //render Triangles
    for (var whichTriSet=0; whichTriSet<numTriangleSets; whichTriSet++) { 
        // define the modeling matrix 
        inputTriangles[whichTriSet].mMatrix = mat4.create(); // modeling mat for tri set
        
        //find the highlight model 
        if (currentModelV3[0][0]==1 && currentModelV3[0][1]==whichTriSet) {
            //highlight
            mat4.multiply(inputTriangles[whichTriSet].mMatrix,
                          mat4.fromTranslation(mat4.create(), vec3.negate(vec3.create(), centerTri[whichTriSet])),
                          inputTriangles[whichTriSet].mMatrix);//translate to origin
            mat4.multiply(inputTriangles[whichTriSet].mMatrix,
                          mat4.fromScaling(mat4.create(), currentModelV3[1][whichTriSet][0]),
                          inputTriangles[whichTriSet].mMatrix);//scale
            mat4.multiply(inputTriangles[whichTriSet].mMatrix,
                          mat4.fromTranslation(mat4.create(), centerTri[whichTriSet]),
                          inputTriangles[whichTriSet].mMatrix);//translate back
            }
            //rotate
            mat4.multiply(inputTriangles[whichTriSet].mMatrix,
                          mat4.fromRotation(mat4.create(), currentModelV3[1][whichTriSet][1], [1, 0, 0]),
                          inputTriangles[whichTriSet].mMatrix);//x
            mat4.multiply(inputTriangles[whichTriSet].mMatrix,
                          mat4.fromRotation(mat4.create(), currentModelV3[1][whichTriSet][2], [0, 1, 0]),
                          inputTriangles[whichTriSet].mMatrix);//y
            mat4.multiply(inputTriangles[whichTriSet].mMatrix,
                          mat4.fromRotation(mat4.create(), currentModelV3[1][whichTriSet][3], [0, 0, 1]),
                          inputTriangles[whichTriSet].mMatrix);//z
            //translate
            mat4.multiply(inputTriangles[whichTriSet].mMatrix,
                          mat4.fromTranslation(mat4.create(), currentModelV3[1][whichTriSet][4]),
                          inputTriangles[whichTriSet].mMatrix);
        

        // pass modeling matrix for set to shadeer
        gl.uniformMatrix4fv(modelMatrixULoc, false, inputTriangles[whichTriSet].mMatrix);
        gl.uniformMatrix4fv(view, false, V);
        gl.uniformMatrix4fv(projection, false, P);
        
        // vertex buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichTriSet]); // activate
        gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,13*FSIZE, 0); // vtx coord
        gl.vertexAttribPointer(diffuse, 3, gl.FLOAT, false, 13*FSIZE, 3* FSIZE); // diffuse
        gl.vertexAttribPointer(ambient, 3, gl.FLOAT, false, 13*FSIZE, 6* FSIZE); //ambient
        gl.vertexAttribPointer(specular, 3, gl.FLOAT, false, 13*FSIZE, 9* FSIZE); //specular
        gl.vertexAttribPointer(n, 1, gl.FLOAT, false, 13*FSIZE, 12* FSIZE);
    
        //norm buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, TriNormBuffer[whichTriSet]);
        gl.vertexAttribPointer(Norm, 3, gl.FLOAT, false, 9*FSIZE, 0);
        gl.vertexAttribPointer(Light, 3, gl.FLOAT, false, 9*FSIZE, 3*FSIZE);
        gl.vertexAttribPointer(Half, 3, gl.FLOAT, false, 9*FSIZE, 6*FSIZE);

        // triangle buffer: activate and render
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffers[whichTriSet]); // activate
        gl.drawElements(gl.TRIANGLES,3*triSetSizes[whichTriSet],gl.UNSIGNED_SHORT,0); // render
    } // end for each tri set

    //render Ellipsoids
    for (var whichElpSet=0; whichElpSet<inputEllipsoids.length; whichElpSet++) {
        
        // define the modeling matrix 
        inputEllipsoids[whichElpSet].mMatrix = mat4.create(); // modeling mat for tri set
        
        //find the highlight model 
        if (currentModelV3[0][0]==2 && currentModelV3[0][1]==whichElpSet) {
            //highlight
            mat4.multiply(inputEllipsoids[whichElpSet].mMatrix,
                          mat4.fromTranslation(mat4.create(), vec3.negate(vec3.create(), centerElp[whichElpSet])),
                          inputEllipsoids[whichElpSet].mMatrix);//translate to origin
            mat4.multiply(inputEllipsoids[whichElpSet].mMatrix,
                          mat4.fromScaling(mat4.create(), currentModelV3[2][whichElpSet][0]),
                          inputEllipsoids[whichElpSet].mMatrix);//scale
            mat4.multiply(inputEllipsoids[whichElpSet].mMatrix,
                          mat4.fromTranslation(mat4.create(), centerElp[whichElpSet]),
                          inputEllipsoids[whichElpSet].mMatrix);//translate back
            }
            //rotate
            mat4.multiply(inputEllipsoids[whichElpSet].mMatrix,
                          mat4.fromRotation(mat4.create(), currentModelV3[2][whichElpSet][1], [1, 0, 0]),
                          inputEllipsoids[whichElpSet].mMatrix);//x
            mat4.multiply(inputEllipsoids[whichElpSet].mMatrix,
                          mat4.fromRotation(mat4.create(), currentModelV3[2][whichElpSet][2], [0, 1, 0]),
                          inputEllipsoids[whichElpSet].mMatrix);//y
            mat4.multiply(inputEllipsoids[whichElpSet].mMatrix,
                          mat4.fromRotation(mat4.create(), currentModelV3[2][whichElpSet][3], [0, 0, 1]),
                          inputEllipsoids[whichElpSet].mMatrix);//z
            //translate
            mat4.multiply(inputEllipsoids[whichElpSet].mMatrix,
                          mat4.fromTranslation(mat4.create(), currentModelV3[2][whichElpSet][4]),
                          inputEllipsoids[whichElpSet].mMatrix);
        



        // pass modeling matrix for set to shadeer
        gl.uniformMatrix4fv(modelMatrixULoc, false, inputEllipsoids[whichElpSet].mMatrix);
        gl.uniformMatrix4fv(view, false, V);
        gl.uniformMatrix4fv(projection, false, P);
        
        // vertex buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER,EllipsoidBuffer[whichElpSet]); // activate
        gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,13*FSIZE, 0); // vtx coord
        gl.vertexAttribPointer(diffuse, 3, gl.FLOAT, false, 13*FSIZE, 3* FSIZE); // diffuse
        gl.vertexAttribPointer(ambient, 3, gl.FLOAT, false, 13*FSIZE, 6* FSIZE); //ambient
        gl.vertexAttribPointer(specular, 3, gl.FLOAT, false, 13*FSIZE, 9* FSIZE); //specular
        gl.vertexAttribPointer(n, 1, gl.FLOAT, false, 13*FSIZE, 12* FSIZE);

        //norm buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, ElpNormBuffer[whichElpSet]);
        gl.vertexAttribPointer(Norm, 3, gl.FLOAT, false, 9*FSIZE, 0);
        gl.vertexAttribPointer(Light, 3, gl.FLOAT, false, 9*FSIZE, 3*FSIZE);
        gl.vertexAttribPointer(Half, 3, gl.FLOAT, false, 9*FSIZE, 6*FSIZE);

        
        gl.drawArrays(gl.TRIANGLE_FAN, 0, vtxNum[whichElpSet]); // render
    } // end for each tri set
}

//render with listener
function renderAllWithKey(){
    renderWithKey();
    var choice = 0;
    document.addEventListener('keyup', function(e){
        let key = e.key;
        
        switch(key){
            //a-S: To implement these changes you will need to change the eye, lookAt and lookUp vectors used to form your viewing transform.
            case 'a': //a
                mat4.multiply(V, mat4.fromTranslation(mat4.create(),vec3.fromValues(-0.01, 0, 0)), V); // move back to center
                console.log('a pressed');
                break;
            case 'd': //d
                mat4.multiply(V, mat4.fromTranslation(mat4.create(),vec3.fromValues(0.01, 0, 0)), V); // move back to center
                console.log('d pressed');
                break;
            case 'w': //w
                mat4.multiply(V, mat4.fromTranslation(mat4.create(),vec3.fromValues(0, 0, 0.01)), V);
                console.log('w pressed');
                break;
            case 's': //s
                mat4.multiply(V, mat4.fromTranslation(mat4.create(),vec3.fromValues(0, 0, -0.01)), V);
                console.log('s pressed');
                break;
            case 'q': //q
                mat4.multiply(V, mat4.fromTranslation(mat4.create(),vec3.fromValues(0, -0.01, 0)), V);
                console.log('q pressed');
                break;
            case 'e': //e
                mat4.multiply(V, mat4.fromTranslation(mat4.create(),vec3.fromValues(0, 0.01, 0)), V);
                console.log('e pressed');
                break;
            case 'A': //A
                mat4.multiply(V, mat4.fromRotation(mat4.create(), -Math.PI/180, vec3.fromValues(0, 1, 0)), V);
                console.log('A pressed');
                break;
            case 'D': //D
                mat4.multiply(V, mat4.fromRotation(mat4.create(), Math.PI/180, vec3.fromValues(0, 1, 0)), V);
                console.log('D pressed');
                break;
            case 'W': //W
                mat4.multiply(V, mat4.fromRotation(mat4.create(), -Math.PI/180, vec3.fromValues(1, 0, 0)), V);
                console.log('W pressed');
                break;
            case 'S': //S
                mat4.multiply(V, mat4.fromRotation(mat4.create(), Math.PI/180, vec3.fromValues(1, 0, 0)), V);
                console.log('S pressed');
                break;
            case 'ArrowLeft': //left
                currentModelV3[0][0] = 1;
                currentModelV3[0][1]--;
                currentModelV3[0][1] = Math.abs(currentModelV3[0][1]%2);
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][0][0] = 1.2;
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][0][1] = 1.2;
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][0][2] = 1.2;
                console.log('left pressed');
                break;
            case 'ArrowRight': //right
                currentModelV3[0][0] = 1;
                currentModelV3[0][1]++;
                currentModelV3[0][1] = Math.abs(currentModelV3[0][1]%2);
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][0][0] = 1.2;
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][0][1] = 1.2;
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][0][2] = 1.2;
                console.log('right pressed');
                break;
            case 'ArrowUp': //up
                currentModelV3[0][0] = 2;
                currentModelV3[0][1]++;
                currentModelV3[0][1] = Math.abs(currentModelV3[0][1]%3);
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][0][0] = 1.2;
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][0][1] = 1.2;
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][0][2] = 1.2;
                console.log('up pressed');
                break;
            case 'ArrowDown': //down
                currentModelV3[0][0] = 2;
                choice--;
                currentModelV3[0][1] = Math.abs(choice%3);
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][0][0] = 1.2;
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][0][1] = 1.2;
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][0][2] = 1.2;
                console.log('down pressed');
                break;
            case ' ': //space
                //currentModel = [-1, 0];
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][0][0] = 1;
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][0][1] = 1;
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][0][2] = 1;
                console.log('space pressed');
                break;
            case 'k': //k
                //currentModelV3[0][0]: which set
                //currentModelV3[0][1]: which obj
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][4][0] += -0.01; 
                translationModel[0] += -0.01;
                console.log('k pressed');
                break;
            case ';': //;
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][4][0] += 0.01;
                translationModel[0] += 0.01;
                console.log('; pressed');
                break;
            case 'o': //o
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][4][2] += 0.01;
                translationModel[2] += 0.01;
                console.log('o pressed');
                break;
            case 'l': //l
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][4][2] += -0.01;
                translationModel[2] += -0.01;
                console.log('I pressed');
                break;
            case 'i': //i
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][4][1] += 0.01;
                translationModel[1] += 0.01;
                console.log('i pressed');
                break;
            case 'p': //p
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][4][1] += -0.01;
                translationModel[1] += -0.01;
                console.log('p pressed');
                break;
            case 'K': //K
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][2] += Math.PI/180;
                rotationAxis = [0, 1, 0];
                console.log('K pressed');
                break;
            case ':': //:
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][2] += -Math.PI/180;
                rotationAxis = [0, 1, 0];
                console.log(': pressed');
                break;
            case 'O': //O
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][1] += Math.PI/180;
                rotationAxis = [1, 0, 0];
                console.log('O pressed');
                break;
            case 'L': //I
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][1] += -Math.PI/180;
                rotationAxis = [1, 0, 0];
                console.log('L pressed');
                break;
            case 'I': //I
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][3] += Math.PI/180;
                rotationAxis = [0, 0, 1];
                console.log('I pressed');
                break;
            case 'P': //P
                currentModelV3[currentModelV3[0][0]][currentModelV3[0][1]][3] += -Math.PI/180;
                rotationAxis = [0, 0, 1];
                console.log('P pressed');
                break;
            default:
                console.log('default');
                break;
            
            }
            renderWithKey();
        })
}





/* MAIN -- HERE is where execution begins after window load */

function main() {

  
  setupWebGL(); // set up the webGL environment
  loadTriangles(); // load in the triangles from tri file
  //loadTriangles_oneArray();
  loadEllipsoids(); //load in the ellipsoids from ellip file
  initCurrentModel();
  setupShaders(); // setup the webGL shaders
//   renderTriangles(); // draw the triangles using webGL
//   renderEllipsoids();
  //renderAll();
  renderAllWithKey();
  //keyEvent();
  
} // end main
