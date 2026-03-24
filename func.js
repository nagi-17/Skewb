let darkmode=localStorage.getItem("dark-mode");
const themetoggle=document.getElementById("theme");

function enabledarkmode() {
    document.body.classList.add("dark-mode");
    localStorage.setItem("dark-mode", "active");
}

function disabledarkmode() {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("dark-mode", null);
}

if (darkmode==="active") { enabledarkmode(); }

themetoggle.addEventListener("click", function () {
    darkmode=localStorage.getItem("dark-mode");
    darkmode!="active" ? enabledarkmode() : disabledarkmode();
});

let selected_button="select";
let lastactive=document.getElementById("select");
let button=document.querySelectorAll(".draw-tools");

for (let btn of button) {
    btn.addEventListener("click", f_active);
}

function f_active(event) {
    let buttonclick=event.target.id;
    if (lastactive) 
    { 
        lastactive.classList.remove("active"); 
    }
    document.getElementById(buttonclick).classList.add("active");
    lastactive=document.getElementById(buttonclick);
    selected_button=buttonclick;
}

const canvas=document.getElementById("drawing-board");
const ctx=canvas.getContext("2d");

function f_resize() {
    let imageData=ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width=canvas.offsetWidth;
    canvas.height=canvas.offsetHeight;
    ctx.putImageData(imageData, 0, 0);
}
window.addEventListener("load", f_resize);
window.addEventListener("resize", f_resize);

let draw=false;
let prev_x, prev_y, prev_canvas;
let arr=[];

function getStrokeColor() { return document.getElementById("stroke-color").value; }
function getStrokeWidth() { return document.getElementById("stroke-width").value; }
function getOpacity()     { return document.getElementById("opacity").value; }

function f_style() {
    ctx.strokeStyle=getStrokeColor();
    ctx.lineWidth=getStrokeWidth();
    ctx.globalAlpha=getOpacity();
    ctx.lineCap="round";
    ctx.lineJoin="round";
}

canvas.addEventListener("mousedown",f_draw);
canvas.addEventListener("mousemove",f_mouse_move);
canvas.addEventListener("mouseup",f_stop);
canvas.addEventListener("mouseleave",f_stop);

function f_draw(event_1) {
    draw=true;
    prev_x=event_1.offsetX;
    prev_y=event_1.offsetY;
    ctx.beginPath();
    prev_canvas=ctx.getImageData(0, 0, canvas.width, canvas.height);
    f_style();
}

function f_mouse_move(event_2) {
    if (!draw) return;

    let curr_x=event_2.offsetX;
    let curr_y=event_2.offsetY;

    if (selected_button==="brush") {
        ctx.lineTo(curr_x, curr_y);
        ctx.stroke();
    }

    else if (selected_button==="eraser") {
        let size=getStrokeWidth();
        ctx.globalAlpha=1;
        ctx.clearRect(curr_x-size/2, curr_y-size/2,size, size);
    }

    else if (selected_button==="line") {
        ctx.putImageData(prev_canvas, 0, 0);
        f_style();
        ctx.beginPath();
        ctx.moveTo(prev_x, prev_y);
        ctx.lineTo(curr_x, curr_y);
        ctx.stroke();
    }

    else if (selected_button==="rectangle") {
        ctx.putImageData(prev_canvas, 0, 0);
        f_style();
        ctx.beginPath();
        ctx.strokeRect(prev_x, prev_y, curr_x-prev_x, curr_y-prev_y);
    }

    else if (selected_button==="circle") {
        ctx.putImageData(prev_canvas, 0, 0);
        f_style();
        let radius=Math.sqrt(Math.pow(curr_x-prev_x, 2)+Math.pow(curr_y-prev_y,2));
        ctx.beginPath();
        ctx.arc(prev_x, prev_y, radius, 0, 2*Math.PI);
        ctx.stroke();
    }

    else if (selected_button==="triangle") {
        ctx.putImageData(prev_canvas, 0, 0);
        f_style();
        ctx.beginPath();
        ctx.moveTo(prev_x, prev_y);
        ctx.lineTo(curr_x, curr_y);
        ctx.lineTo(prev_x-(curr_x-prev_x),curr_y);
        ctx.closePath();
        ctx.stroke();
    }
}

function f_stop() {
    if (!draw) return;
    draw=false;
    arr.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
}

document.getElementById("undo").addEventListener("click", f_undo);
function f_undo() {
    if (arr.length>0) {
        arr.pop();
        if (arr.length>0) {
            ctx.putImageData(arr[arr.length-1],0,0);
        } 
        else 
        {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
}

document.getElementById("clear").addEventListener("click", f_clear);
function f_clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    arr = [];
}