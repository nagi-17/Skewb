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
    canvas.width=canvas.offsetWidth;
    canvas.height=canvas.offsetHeight;
    f_redraw();
}
window.addEventListener("load", f_resize);
window.addEventListener("resize", f_resize);

let draw=false;
let prev_x, prev_y;
let arr=[], arr_temp=[], current_brush_points=[];

function f_stroke_color() { return document.getElementById("stroke-color").value; }
function f_stroke_width() { return document.getElementById("stroke-width").value; }
function f_opacity()     { return document.getElementById("opacity").value; }
function f_stroke_style(){
    if (document.getElementById("style-dashed")&&document.getElementById("style-dashed").classList.contains("active")) 
        return "style-dashed";
    else if (document.getElementById("style-dotted")&&document.getElementById("style-dotted").classList.contains("active")) 
        return "style-dotted";
    else
        return "solid";
}

function f_style(object) {
    ctx.strokeStyle=object.stroke_color;
    ctx.lineWidth=object.stroke_width;
    ctx.globalAlpha=object.opacity;
    ctx.lineCap="round";
    ctx.lineJoin="round";
    if (object.stroke_style==="style-dashed") {
        ctx.setLineDash([object.stroke_width*3, object.stroke_width*2]);
    } else if (object.stroke_style==="style-dotted") {
        ctx.setLineDash([object.stroke_width/5, object.stroke_width*2]);
    } else {
        ctx.setLineDash([]);
    }
}

function temp(){
    return {stroke_color:f_stroke_color(), stroke_width:f_stroke_width(), opacity:f_opacity(), stroke_style:f_stroke_style()}
}

canvas.addEventListener("mousedown",f_draw);
canvas.addEventListener("mousemove",f_mouse_move);
canvas.addEventListener("mouseup",f_stop);
canvas.addEventListener("mouseleave",f_stop);

function f_draw_object(object){
    ctx.save();
    f_style(object);
    ctx.beginPath();
    if (object.type==="brush")
    {
        if(object.points.length===0)
        {
            ctx.restore();
            return;
        }
        ctx.moveTo(object.points[0].x, object.points[0].y);
        for(let i=0; i<object.points.length; i++)
        {
            ctx.lineTo(object.points[i].x, object.points[i].y);
        }
        ctx.stroke();
    }
    else if(object.type==="line")
    {
        //console.log("Line");
        ctx.moveTo(object.x1, object.y1);
        ctx.lineTo(object.x2, object.y2);
        ctx.stroke();
    }
    else if(object.type==="rectangle")
    {
        ctx.strokeRect(object.x, object.y, object.w, object.h);
    }
    else if (object.type==="circle")
    {
        ctx.arc(object.cx, object.cy, object.radius, 0, 2*Math.PI);
        ctx.stroke();
    }
    else if (object.type==="triangle")
    {
        ctx.moveTo(object.x1, object.y1);
        ctx.lineTo(object.x2, object.y2);
        ctx.lineTo(object.x3, object.y3);
        ctx.closePath();
        ctx.stroke();
    }
    console.log("Restore");
    ctx.restore();
}

function f_redraw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha=1;
    ctx.setLineDash([]);
    for (let i=0; i<arr.length; i++)
    {
        f_draw_object(arr[i]);
    }
}

function f_draw(event_1) {
    draw=true;
    prev_x=event_1.offsetX;
    prev_y=event_1.offsetY;
    if(selected_button==="brush")
    {
        current_brush_points=[{x:prev_x, y:prev_y}];
    }
}

function f_mouse_move(event_2) {
    if (!draw) return;

    let curr_x=event_2.offsetX;
    let curr_y=event_2.offsetY;

    if (selected_button==="brush") {
        current_brush_points.push({x:curr_x, y:curr_y});
        let style=temp();
        ctx.save();
        f_style(style);
        ctx.beginPath();
        let temp_points=current_brush_points;
        let temp_length=temp_points.length;
        ctx.moveTo(temp_points[temp_length-2].x, temp_points[temp_length-2].y);
        ctx.lineTo(temp_points[temp_length-1].x, temp_points[temp_length-1].y);
        ctx.stroke();
        ctx.restore();
    }

    else if (selected_button==="line") {
        f_redraw();
        let shape=Object.assign(temp(), {type:"line", x1:prev_x, y1:prev_y, x2:curr_x, y2:curr_y});
        f_draw_object(shape);
    }

    else if (selected_button==="rectangle") {
        f_redraw();
        let shape=Object.assign(temp(), {type:"rectangle", x:prev_x, y:prev_y, w:curr_x-prev_x, h:curr_y-prev_y});
        f_draw_object(shape);
    }

    else if (selected_button==="circle") {
        f_redraw();
        let r=Math.sqrt(Math.pow(curr_x-prev_x,2)+Math.pow(curr_y-prev_y,2));
        let shape=Object.assign(temp(), {type:"circle", cx:prev_x, cy:prev_y, radius:r});
        f_draw_object(shape);
    }

    else if (selected_button==="triangle") {
        f_redraw();
        let shape=Object.assign(temp(), {type:"triangle", x1:prev_x, y1:prev_y, x2:curr_x, y2:curr_y, x3:2*prev_x-curr_x, y3:curr_y});
        f_draw_object(shape);
    }
}

function f_stop(event_3) {
    if (!draw) return;
    draw=false;
    let curr_x = (event_3 && event_3.offsetX !== undefined) ? event_3.offsetX : prev_x;
    let curr_y = (event_3 && event_3.offsetY !== undefined) ? event_3.offsetY : prev_y;
    let object=null;
    if (selected_button==="brush")
    {
        if(current_brush_points.length>1)
        {
            object=Object.assign(temp(), {type:"brush", points:current_brush_points.slice()});
        }
        current_brush_points=[];
    }
    else if (selected_button==="line")
    {
        object=Object.assign(temp(), {type:"line", x1:prev_x, y1:prev_y, x2:curr_x, y2:curr_y});
    }
    else if (selected_button==="rectangle")
    {
        object=Object.assign(temp(), {type:"rectangle", x:prev_x, y:prev_y, w:curr_x-prev_x, h:curr_y-prev_y});
    }
    else if (selected_button==="circle")
    {
        let r=Math.sqrt(Math.pow(curr_x-prev_x,2)+Math.pow(curr_y-prev_y,2));
        object=Object.assign(temp(), {type:"circle", cx:prev_x, cy:prev_y, radius:r});
    }
    else if (selected_button==="triangle")
    {
        object=Object.assign(temp(), {type:"triangle", x1:prev_x, y1:prev_y, x2:curr_x, y2:curr_y, x3:2*prev_x-curr_x, y3:curr_y});
    }

    if(object)
    {
        arr.push(object);
        arr_temp=[];
        f_redraw();
    }
}

document.getElementById("undo").addEventListener("click", f_undo);
function f_undo() {
    if (arr.length>0) {
        arr_temp.push(arr.pop());
        f_redraw();
    }
}

document.getElementById("clear").addEventListener("click", f_clear);
function f_clear() {
    arr = [];
    arr_temp=[];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

document.getElementById("redo").addEventListener("click", f_redo);
function f_redo(){
    if(arr_temp.length>0)
    {
        arr.push(arr_temp.pop());
        f_redraw();
    }
}

let selected_button_stroke_style="style-solid";
let lastactive_stroke_style=document.getElementById("style-solid");
let button_stroke_style=document.querySelectorAll(".style-buttons");

for (let btn of button_stroke_style) {
    btn.addEventListener("click", f_active_stroke_style);
}

function f_active_stroke_style(event) {
    let buttonclick_stroke_style=event.target.id;
    if (lastactive_stroke_style) 
    { 
        lastactive_stroke_style.classList.remove("active"); 
    }
    document.getElementById(buttonclick_stroke_style).classList.add("active");
    lastactive_stroke_style=document.getElementById(buttonclick_stroke_style);
}