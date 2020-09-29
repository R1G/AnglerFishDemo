// webcam input stored here
const video = document.getElementById("video");

//Map Variables
var MapRects = [newWall(600,600,55,55),
                newWall(50, 50, 40, 70),
                newWall(300,300,100,90),
                newWall(100,150,20,100),
                ];

//image assets
let anglerfish_img, ocean_img;

//initial position and color
var expression_color = 'grey';
var position = {x:0, y:0};
var center;

// Constants for the player character
const meter = 100;
const playerSpeed = 1;

// Constants for expression weights
const happyWeight = 150;
const sadWeight = 200;
const angryWeight = 300;

//list of face-api models to load before using webcam input
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models")
]).then(startVideo);

const contraints = {
    video: true
};

function startVideo(){
    console.log(navigator.appName);
    navigator.mediaDevices.getUserMedia(
        {video : true}
    )
    .then(function(stream) {
        video.srcObject = stream;
    })
    .catch(function(err) {
        console.log("you done fucked up");
        console.log(err);
    });
}


// async function startVideo(){
//     let stream = null;
//     const mediaD = navigator.mediaDevices;
//     try {
//         stream = await navigator.mediaDevices.getUserMedia(
//             {video: true}
//         );
//         /* use the stream */
//       } catch(err) {
//           console.log(err);
//       }
//     video.srcObject = stream;
// }

//starts stream to video element, used after models are loaded
// function startVideo() {
//     Navigator.mediaDevices.getUserMedia( 
//         {video: {} }, 
//         stream => (video.srcObject = stream),
//         err => console.log("you bitch")
//     );
// }
	



video.addEventListener("playing", () => {
    // face-api detects faces every 100ms
    setInterval( async () => {
        var detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()) //get all faces in view
            .withFaceLandmarks()                                          //get 68 face landmarks
            .withFaceExpressions();                                       //get scores for every expression
            //possible expressions: neutral, happy, sad, angry, fearful

        //scale landmarks to match screen size 
        //TODO: make an accurate mapping from webcam space to screenspace
        detections = faceapi.resizeResults(detections, {width: windowWidth, height: windowHeight});

        //set position and color if at least 1 face is detected
        if(detections != null && detections[0] != null) {
            position.x = windowWidth - Math.round(detections[0].landmarks.positions[0]._x);
            position.y = Math.round(detections[0].landmarks.positions[0]._y);
            expression_color = expressions_to_color(detections[0].expressions);
        }
    }, 1);
})

function setup() {
    createCanvas(windowWidth, windowWidth);
    background('black');
    center = { x: windowWidth/2, y: windowHeight/2};
    player.x = center.x;
    player.y = center.y;
}

// player class
var player = {
    x: 0,       //Start Position coordinates
    y: 0,
    color: [150,0,0],

    size: 50,

    visual_range: 170,

    //Function used to update our player character in draw
    update() { 
        fill(this.color);
        circle(center.x, center.y, this.size);

        //MOUSE CONTROLS
        var xdiff = (mouseX - center.x);
        var ydiff = (mouseY - center.y);

        //CAMERA CONTROLS
        //var xdiff = (position.x - this.x);
        //var ydiff = (position.y - this.y);

        if(abs(ydiff) > this.size || abs(xdiff) > this.size) {
            this.x += xdiff/meter*playerSpeed;
            this.y += ydiff/meter*playerSpeed;
        }

        //Dani:light beam!
        //expression_color is a combo of which expressions were detected
        noStroke();
        fill(expression_color);

        //beam originates on player and faces mouse position
        let angle = Math.atan2(mouseY-(center.x - this.size/2)
                            , mouseX-(center.y - this.size/2));
        push();
        translate(center.x,center.y);
        rotate(angle);
        triangle(this.size/2, 0, this.size/2 + this.visual_range, 50 , this.size/2 + this.visual_range, -50);
        pop();
    }
}




function draw() {
    background('black');

    player.update();

    updateMap();
}

// each expression makes up a channel in the resulting color
function expressions_to_color(expressions) {
    var red = expressions.angry * angryWeight + 128;
    var blue = expressions.sad * sadWeight + 128;
    var green = expressions.happy * happyWeight + 128;

    return color(red, green, blue);
}

//Map Drawing functions
function updateMap() {
    push();
    translate(-player.x,-player.y);
    for( let i = 0; i < MapRects.length; i++) {
        MapRects[i].update();
    }
    pop();
}

//MapObject Generating Functions
function newWall(x, y, width, height) {
    var wall = {
        x: x,
        y: y,
        w: width,
        h: height,
        color: [0,150,0],

        update: function() {
            fill(this.color);
            rect(x,y,width,height);
        }
    }
    return wall;
}
