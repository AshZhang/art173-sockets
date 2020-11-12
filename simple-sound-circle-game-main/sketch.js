const socket = io.connect();

socket.on('connect', () => {
    console.log('client connected')
});

let env, osc;
let myCircle;
let otherCircles = new Map();

function setup() {
    createCanvas(600, 600);

    env = new p5.Envelope(0.01, 0.7, 0.3, 0.0);
    osc = new p5.Oscillator('sine');
    osc.start();
    osc.amp(0);


    const myCircleOpts = {
        x: random(50, width - 50),
        y: random(50, height - 50),
        size: random(20, 40),
        col: [random(255), random(255), random(255)],
    }

    myCircle = new SoundCircle(socket.id, myCircleOpts.x, myCircleOpts.y, myCircleOpts.size, myCircleOpts.col);

    const data = {
        x: myCircle.pos.x,
        y: myCircle.pos.y,
        size: myCircle.size,
        col: myCircle.col,
        clicked: myCircle.clicked,
    }
    socket.emit('start', data);
    socket.on('heartbeat', (data) => {
        map = new Map(JSON.parse(data));
        map.forEach((circle, id) => {
            if(id != socket.id){
                otherCircles.set(id, circle);
                console.log(JSON.stringify(id));
            }
        });
    });
}

function draw() {
    background(120, 90, 200);

    myCircle.move();
    myCircle.checkEdges();
    myCircle.display();
    otherCircles.forEach((circle, id) => {
        displayCircle(circle);
    });

    const data = {
        x: myCircle.pos.x,
        y: myCircle.pos.y,
        size: myCircle.size,
        col: myCircle.col,
        clicked: myCircle.clicked,
    }
    socket.emit('update', data);
    console.log(otherCircles);
}


function mousePressed() {
    const playSound = myCircle.checkClick(mouseX, mouseY);
    if (playSound) {
        const freq = myCircle.size * 10;
        playSound(freq);
    }
}

function mouseReleased() {
    myCircle.clicked = false;
    myCircle.setSpeed(mouseX, mouseY);
}

function playSound(freq) {
    osc.freq(freq);
    env.play(osc);
}

function displayCircle(circle) {
    const { x, y, size, col, clicked } = circle;
    fill(col);
    stroke(220, 200, 220);
    const ellipseStroke = clicked ? 9 : 3;
    strokeWeight(ellipseStroke);
    ellipse(x, y, size);
}