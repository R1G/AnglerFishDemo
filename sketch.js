/*
    Constants for the player character
*/ 
const meter = 100;
const playerSpeed = 2;

function setup() {
    createCanvas(1280, 800);
    background('black');
}

let player = {
    x:100,       //Start Position coordinates
    y:100,
    color: [150,0,0],

    //Function used to update our player character in draw
    update() { 
        clear();
        fill(this.color);
        circle(this.x,this.y,50);

        //Give the player velocity towards a mouse
        if(mouseIsPressed && int(dist(x=100,y=100,mouseX,mouseY)) > 5) {
            this.x += ((mouseX-this.x)/meter)*playerSpeed;
            this.y += ((mouseY-this.y)/meter)*playerSpeed;
        }
    }
}



function draw() {
    player.update();
}
