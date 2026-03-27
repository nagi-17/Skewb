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
    if(selected_shape_index!==-1&&arr[selected_shape_index])
    {
        let box=f_select_box(arr[selected_shape_index]);
        f_draw_select_box(box);
    }
}

function f_draw(event_1) {
    prev_x=event_1.offsetX;
    prev_y=event_1.offsetY;
    if(selected_button==="select")
    {
        console.log("select button clicked");
        selected_shape_index=f_hit_test(prev_x, prev_y);
        if(selected_shape_index!==-1)
        {
            move_select=true;
        }
        f_redraw();
        return;
    }
    selected_shape_index=-1;
    draw=true;
    if(selected_button==="brush")
    {
        current_brush_points=[{x:prev_x, y:prev_y}];
    }
}

function f_mouse_move(event_2) {
    let curr_x=event_2.offsetX;
    let curr_y=event_2.offsetY;

    if(selected_button=="select"&&move_select===true&&selected_shape_index!=-1)
    {
        let dx=curr_x-prev_x;
        let dy=curr_y-prev_y;
        f_move_selected_object(arr[selected_shape_index], dx, dy);
        prev_x=curr_x;
        prev_y=curr_y;
        f_redraw();
    }
    if(!draw)
        return;
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
    else if(selected_button==="eraser"){
        let eraser_size=f_stroke_width()*2;
        let eraser_x=curr_x-(eraser_size/2);
        let eraser_y=curr_y-(eraser_size/2);
        arr=arr.filter(function(object){
            return f_erase_object(object, eraser_x, eraser_y, eraser_size)
        });
        f_redraw();
    }
}

function f_erase_object(object, eraser_x, eraser_y, eraser_size){
    if(object.type==="brush")
    {
        for (let i=0; i<object.points.length; i++)
        {
            if(eraser_intersect_point(eraser_x, eraser_y, object.points[i].x, object.points[i].y, eraser_size))
                return false;
        }
        return true;
    }
    else
        return true;
}

function eraser_intersect_point(left_x, left_y, check_x, check_y, size) {
    if (check_x>=left_x&&check_x<=(left_x+size)&&check_y>=left_y&&check_y<=(left_y+size))
        return true;
    else
        return false;
}

function f_stop(event_3) {
    if(move_select===true)
    {
        move_select=false;
    }

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

let selected_shape_index=-1;

function f_select_box(object) {
    let temp_space=6;
    if (object.type==="rectangle")
    {
        let min_x=Math.min(object.x, object.x+object.w);
        let min_y=Math.min(object.y, object.y+object.h);
        return { x:min_x-temp_space, y:min_y-temp_space, w:Math.abs(object.w)+temp_space*2, h: Math.abs(object.h)+temp_space*2};
    } 
    else if (object.type==="circle")
    {
        return { x:object.cx-object.radius-temp_space, y:object.cy-object.radius-temp_space, w:object.radius*2+temp_space*2, h:object.radius*2+temp_space*2};
    } 
    else if (object.type==="line")
    {
        let min_x=Math.min(object.x1, object.x2);
        let max_x=Math.max(object.x1, object.x2);
        let min_y=Math.min(object.y1, object.y2);
        let max_y=Math.max(object.y1, object.y2);
        return { x:min_x-temp_space, y:min_y-temp_space, w:max_x-min_x+temp_space*2, h:max_y-min_y+temp_space*2};
    } 
    else if (object.type==="triangle")
    {
        let min_x=Math.min(object.x1, object.x2, object.x3);
        let max_x=Math.max(object.x1, object.x2, object.x3);
        let min_y=Math.min(object.y1, object.y2, object.y3);
        let max_y=Math.max(object.y1, object.y2, object.y3);
        return { x:min_x-temp_space, y: min_y-temp_space, w:max_x-min_x+temp_space*2, h:max_y-min_y+temp_space*2};
    } 
    else if (object.type==="brush") {
        if (object.points.length===0) 
            return null;
        let min_x=object.points[0].x, max_x=object.points[0].x;
        let min_y=object.points[0].y, max_y=object.points[0].y;
        for (let i=1; i<object.points.length; i++) {
            if (object.points[i].x<min_x) 
                min_x=object.points[i].x;
            if (object.points[i].x>max_x) 
                max_x=object.points[i].x;
            if (object.points[i].y<min_y) 
                min_y=object.points[i].y;
            if (object.points[i].y>max_y) 
                max_y=object.points[i].y;
        }
        return {x:min_x-temp_space, y:min_y-temp_space, w:max_x-min_x+temp_space*2, h:max_y-min_y+temp_space*2};
    }
    return null;
}

function f_hit_test(mouse_x, mouse_y){
    for (let i=arr.length-1; i>=0; i--) 
    {
        let box=f_select_box(arr[i]);
        if (box&&mouse_x>=box.x&&mouse_x<=box.x+box.w&&mouse_y>=box.y&&mouse_y<=box.y+box.h) 
        {
            return i;
        }
    }
    return -1;
}

function f_draw_select_box(box) {
    if (!box) 
        return;
    ctx.save();
    ctx.strokeStyle="#00a8ff";
    ctx.lineWidth=1.5;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    ctx.restore();
}

let move_select=false;
function f_move_selected_object(object, dx, dy){
    if(object.type==="brush")
    {
        for(let i=0; i<object.points.length; i++)
        {
            object.points[i].x+=dx;
            object.points[i].y+=dy;
        }
    }
    else if(object.type==="rectangle")
    {
        object.x=object.x+dx;
        object.y+=dy;
    }
    else if(object.type==="circle")
    {
        object.cx+=dx;
        object.cy+=dy;
    }
    else if(object.type==="line")
    {
        object.x1+=dx;
        object.x2+=dx;
        object.y1+=dy;
        object.y2+=dy;
    }
    else if(object.type==="triangle")
    {
        object.x1+=dx;
        object.x2+=dx;
        object.x3+=dx;
        object.y1+=dy;
        object.y2+=dy;
        object.y3+=dy;
    }
}