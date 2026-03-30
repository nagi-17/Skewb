let selected_button="select";
let lastactive=document.getElementById("select");
let button=document.querySelectorAll(".draw-tools button");

const canvas=document.getElementById("drawing-board");
const ctx=canvas.getContext("2d");

let draw=false, typing=false, f_commit_text=null;
let prev_x, prev_y;
let arr=[], arr_temp=[], current_brush_points=[];

window.addEventListener("load", f_resize);
window.addEventListener("resize", f_resize);

function f_resize() {
    canvas.width=canvas.offsetWidth;
    canvas.height=canvas.offsetHeight;
    f_redraw();
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
    return {stroke_color:f_stroke_color(), stroke_width:f_stroke_width(), opacity:f_opacity(), stroke_style:f_stroke_style(), angle:0}
}

canvas.addEventListener("mousedown",f_draw);
canvas.addEventListener("mousemove",f_mouse_move);
canvas.addEventListener("mouseup",f_stop);
canvas.addEventListener("mouseleave",f_stop);

function f_draw_object(object){
    ctx.save();
    f_style(object);
    let box = f_select_box(object);
    if (box&&object.angle) {
        let cx=box.x+box.w/2;
        let cy=box.y+box.h/2;
        ctx.translate(cx, cy);
        ctx.rotate(object.angle);
        ctx.translate(-cx, -cy);
    }
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
    else if(object.type==="image")
    {
        ctx.drawImage(object.img, object.x, object.y, object.w, object.h);
    }
    else if(object.type==="text")
    {
        ctx.font=object.size+"px sans-serif";
        ctx.fillStyle=object.stroke_color;
        ctx.textBaseline="top";
        ctx.fillText(object.text, object.x, object.y);
    }
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
        f_draw_select_box(box, arr[selected_shape_index]);
    }
    localStorage.setItem("saved_canvas", JSON.stringify(arr,(key,val)=>key==="img"?val.src:val));
}

function f_draw(event_1) {
    if(typing&&f_commit_text)
    {
        f_commit_text(true);
    }
    prev_x=event_1.offsetX;
    prev_y=event_1.offsetY;
    if(selected_button==="select")
    {
        if(selected_shape_index!==-1&&arr[selected_shape_index])
        {
            let box=f_select_box(arr[selected_shape_index]);
            if(box!==null)
            {
                active_handle=f_hit_test_handles(prev_x, prev_y, box,arr[selected_shape_index]);
                if(active_handle!==-1)
                {
                    move_select=false;
                    return;
                }
            }
        }
        selected_shape_index=f_hit_test(prev_x, prev_y);
        if(selected_shape_index!==-1)
        {
            move_select=true;
            active_handle=-1;
        }
        else
        {
            move_select=false;
            active_handle=-1;
        }
        f_redraw();
        return;
    }
    selected_shape_index=-1;
    active_handle=-1;
    draw=true;
    if(selected_button==="brush")
    {
        current_brush_points=[{x:prev_x, y:prev_y}];
    }
    else if (selected_button==="image")
    {
        let img_x=prev_x;
        let img_y=prev_y;
        let img=new Image();
        img.crossOrigin="anonymous";
        img.src="https://picsum.photos/200/200?random="+Math.random();
        img.onload=function(){
            let object=Object.assign(temp(), {type:"image",img:img, x:img_x, y:img_y, w:img.width, h:img.height});
            arr.push(object);
            arr_temp=[];
            f_redraw();
        } 
    }
    else if(selected_button==="text")
    {
        let font_size_text=Math.max(16, parseInt(f_stroke_width())*3);
        let active_text={x: prev_x, y: prev_y, size: font_size_text, color: f_stroke_color(), val: ""};
        let temp_input=document.createElement("input");
        temp_input.type="text";
        temp_input.style.position="absolute";
        temp_input.style.opacity=0; 
        temp_input.style.pointerEvents="none";
        temp_input.style.zIndex=-1;
        document.body.appendChild(temp_input);
        setTimeout(function (){temp_input.focus();}, 0)
        function f_commit_text_internal(event) {
            if(event&&active_text.val.trim()) {
                let object=Object.assign(temp(), {type:"text", text:active_text.val.trim(), x:active_text.x, y:active_text.y, size:active_text.size});
                arr.push(object);
                arr_temp=[];
            }
            typing=false;
            f_commit_text=null;
            f_redraw();
            if (temp_input.parentNode)
                document.body.removeChild(temp_input);
        }
        temp_input.addEventListener("input", function() {
            active_text.val=temp_input.value;
            f_redraw_text_preview();
        });
        temp_input.addEventListener("keydown", function(event) {
            event.stopPropagation();
            if(event.key==="Enter"||event.key==="Escape") { 
                f_commit_text_internal(true); 
            }
        });
        temp_input.addEventListener("blur", function() {
            if(typing)
                f_commit_text_internal(true);
        });
        function f_redraw_text_preview() {
            f_redraw();
            ctx.save();
            ctx.font=active_text.size+"px sans-serif";
            ctx.fillStyle=active_text.color;
            ctx.textBaseline="top";
            ctx.fillText(active_text.val+"|", active_text.x, active_text.y);
            let m=ctx.measureText(active_text.val);
            ctx.strokeStyle="#00a8ff";
            ctx.lineWidth=1;
            ctx.setLineDash([4, 3]);
            ctx.strokeRect(active_text.x-3, active_text.y-3, m.width+16, active_text.size+6);
            ctx.restore();
        }
        f_commit_text=f_commit_text_internal;
        typing=true;
        f_redraw_text_preview();
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
    else if(selected_button==="select"&&active_handle!==-1&&selected_shape_index!==-1)
    {
        let dx=curr_x-prev_x;
        let dy=curr_y-prev_y;
        let object=arr[selected_shape_index];
        if (active_handle===4)
        {
            let box=f_select_box(object);
            let cx=box.x+box.w/2;
            let cy=box.y+box.h/2;
            object.angle=Math.atan2(curr_y-cy, curr_x-cx)+(Math.PI/2);
        }
        else
        {
            let angle=object.angle;
            let r_dx=dx*(Math.cos(angle))+dy*(Math.sin(angle))
            let r_dy=dy*(Math.cos(angle))-dx*(Math.sin(angle));
            f_resize_selected_object(arr[selected_shape_index], active_handle, r_dx, r_dy, curr_x, curr_y);
        }
        prev_x=curr_x;
        prev_y=curr_y; f_redraw();
        return;
    }
    if(!draw)
        return;
    if (selected_button==="brush") {
        current_brush_points.push({x:curr_x, y:curr_y});
        f_redraw();
        let shape=Object.assign(temp(), {type:"brush", points:current_brush_points});
        f_draw_object(shape);
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

function f_stop(event_3) {
    if(move_select===true)
    {
        move_select=false;
    }
    if(active_handle!==-1)
    {
        active_handle=-1;
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
        let min_x=Math.min(prev_x, curr_x);
        let min_y=Math.min(prev_y, curr_y);
        let w=Math.abs(curr_x-prev_x);
        let h=Math.abs(curr_y-prev_y);
        object=Object.assign(temp(), {type:"rectangle", x:min_x, y:min_y, w:w, h:h});
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

let selected_button_stroke_style="style-solid";
let lastactive_stroke_style=document.getElementById("style-solid");
let button_stroke_style=document.querySelectorAll(".style-buttons button");
let selected_shape_index=-1;

canvas.addEventListener("touchstart",f_touch_start,{passive:false});
canvas.addEventListener("touchmove",f_touch_move,{passive:false});
canvas.addEventListener("touchend",f_touch_end,{passive:false});

function f_get_touch(event)
{
    let rect=canvas.getBoundingClientRect();
    return {offsetX: event.touches[0].clientX-rect.left,offsetY: event.touches[0].clientY-rect.top};
}
function f_touch_start(e)
{
    if (selected_button!=="text")
    {
        e.preventDefault(); 
    }
    f_draw(f_get_touch(e));
}
function f_touch_move(e){e.preventDefault();f_mouse_move(f_get_touch(e));}
function f_touch_end(e){
    e.preventDefault();
    let fake_event=null;
    if(e.changedTouches&&e.changedTouches.length>0)
    {
        let rect=canvas.getBoundingClientRect();
        fake_event={
            offsetX: e.changedTouches[0].clientX-rect.left,
            offsetY: e.changedTouches[0].clientY-rect.top
        }
    }
    f_stop(fake_event);
}