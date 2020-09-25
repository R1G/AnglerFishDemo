// webcam input stored here
const video = document.getElementById("video");

//image assets
let anglerfish_img, ocean_img;

//initial position and color
var expression_color = 'grey';
var position = {x:0, y:0};

// Constants for the player character
const meter = 100;
const playerSpeed = 2;

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

//starts stream to video element, used after models are loaded
function startVideo() {
    navigator.getUserMedia( 
        {video: {} }, 
        stream => (video.srcObject = stream),
        err => console.error(err)
    );
}

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
    }, 100);
})

function setup() {
    createCanvas(windowWidth, windowWidth);
    background('black');
}

// player class
let player = {
    x:100,       //Start Position coordinates
    y:100,
    color: [150,0,0],

    //Function used to update our player character in draw
    update() { 
        fill(this.color);
        circle(this.x,this.y,50);

        this.x += (position.x - this.x)/meter*playerSpeed;
        this.y += (position.y - this.y)/meter*playerSpeed;
        
        //uncomment to switch to mouse control
        //this.x += (mouseX - this.x)/meter*playerSpeed;
        //this.y += (mouseY - this.y)/meter*playerSpeed;

        //Dani:light beam!
        //expression_color is a combo of which expressions were detected
        noStroke();
        fill(expression_color);

        //beam originates on player and faces mouse position
        let angle = Math.atan2(mouseY-position.y, mouseX-position.x); 
        translate(this.x, this.y);
        rotate(angle);
        triangle(35, 0, 200, 50 , 200, -50);
    }
}

function draw() {
    background('black');
    player.update();
}

// each expression makes up a channel in the resulting color
function expressions_to_color(expressions) {
    var red = expressions.angry * angryWeight + 128;
    var blue = expressions.sad * sadWeight + 128;
    var green = expressions.happy * happyWeight + 128;

    return color(red, green, blue);
}

