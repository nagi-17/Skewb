let active_handle=-1;
let move_select=false;

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
    else if(object.type==="image")
    {
        let min_x=Math.min(object.x, object.x+object.w);
        let min_y=Math.min(object.y, object.y+object.h);
        return { x:min_x-temp_space, y:min_y-temp_space, w:Math.abs(object.w)+temp_space*2, h: Math.abs(object.h)+temp_space*2};
    }
    else if(object.type==="text")
    {
        ctx.font=object.size+"px sans-serif";
        let metrics=ctx.measureText(object.text);
        let w=metrics.width;
        let h=(metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent)||object.size;
        return { x:object.x-temp_space, y:object.y-temp_space, w:w+temp_space*2, h:h+temp_space*2}
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

function f_draw_select_box(box, object) {
    if (!box) 
        return;
    ctx.save();
    let cx=box.x+box.w/2;
    let cy=box.y+box.h/2;
    if (object&&object.angle)
    {
        ctx.translate(cx, cy);
        ctx.rotate(object.angle);
        ctx.translate(-cx, -cy);
    }
    ctx.strokeStyle="#00a8ff";
    ctx.lineWidth=1.5;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    ctx.beginPath();
    ctx.moveTo(cx, box.y);
    ctx.lineTo(cx, box.y-25);
    ctx.stroke();
    ctx.fillStyle="#ffffff";
    ctx.setLineDash([]);
    let size=8, half=size/2;
    let corners=[{x:box.x-half, y:box.y-half},{x:box.x+box.w-half, y:box.y-half},{x:box.x-half, y:box.y+box.h-half},{x:box.x+box.w-half, y:box.y+box.h-half}, {x:cx-half, y:box.y-25-half}];
    for(let i of corners)
    {
        if(i===4)
        {
            ctx.beginPath();
            ctx.arc(corners[i].x+half, corners[i].y+half, half, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
        }
        else
        {
            ctx.fillRect(i.x, i.y, size, size);
            ctx.strokeRect(i.x, i.y, size, size);
        }
    }
    ctx.restore();
}

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
    else if(object.type==="image")
    {
        object.x+=dx;
        object.y+=dy;
    }
    else if(object.type==="text")
    {
        object.x+=dx;
        object.y+=dy;
    }
}

function f_hit_test_handles(mouse_x, mouse_y, box, object)
{
    let size=8, half=size/2; let padding_space=4;
    let angle=0;
    let cx=box.x+box.w/2;
    let cy=box.y+box.h/2;
    if(object&&object.angle)
    {
        angle=object.angle;
    }
    let rotated_mouse_x=Math.cos(angle)*(mouse_x-cx)+Math.sin(angle)*(mouse_y-cy)+cx;
    let rotated_mouse_y=Math.cos(-angle)*(mouse_y-cy)+cy-Math.sin(angle)*(mouse_x-cx);
    let handles=[{x:box.x-half, y:box.y-half},{x:box.x+box.w-half, y:box.y-half},{x:box.x-half, y:box.y+box.h-half},{x:box.x+box.w-half, y:box.y+box.h-half},{x:cx-half, y:box.y-25-half}];
    for(let i=0; i<handles.length; i++)
    {
        let hx=handles[i].x;
        let hy=handles[i].y;
        if(rotated_mouse_x>=hx-padding_space&&rotated_mouse_x<=hx+size+padding_space&&rotated_mouse_y>=hy-padding_space&&rotated_mouse_y<=hy+size+padding_space)
        {
            return i;
        }
    }
    return -1;
}

function f_resize_selected_object(object, handle, dx, dy, mouse_x, mouse_y) {
    if(object.type==="brush")
    {
        if(object.points.length===0)
             return;
        
        let min_x=object.points[0].x, max_x=object.points[0].x;
        let min_y=object.points[0].y, max_y=object.points[0].y;
        for (let i=0; i<object.points.length; i++)
        {
            if(object.points[i].x<min_x)
                min_x=object.points[i].x;
            if(object.points[i].x>max_x)
                max_x=object.points[i].x;
            if(object.points[i].y<min_y)
                min_y=object.points[i].y;
            if(object.points[i].y>max_y)
                max_y=object.points[i].y;
        }
        let old_w=max_x-min_x, old_h=max_y-min_y;
        if(old_w===0)
            old_w=0.1;
        if(old_h===0)
            old_h=0.1;

        let scale_x=1, scale_y=1;
        let new_min_x=min_x, new_min_y=min_y;    

        if(handle===0)
        {
            new_min_x+=dx; 
            new_min_y+=dy;
            scale_x=(max_x-new_min_x)/old_w;
            scale_y=(max_y-new_min_y)/old_h;
        }
        else if(handle===1)
        {
            new_min_y+=dy;
            scale_x=(max_x+dx-min_x)/old_w;
            scale_y=(max_y-new_min_y)/old_h;
        }
        else if(handle===2)
        {
            new_min_x+=dx;
            scale_x=(max_x-new_min_x)/old_w;
            scale_y=(max_y+dy-min_y)/old_h;
        }
        else if(handle===3)
        {
            scale_x=(max_x+dx-min_x)/old_w;
            scale_y=(max_y+dy-min_y)/old_h;
        }
        for(let i=0; i<object.points.length; i++)
        {
            object.points[i].x=new_min_x+(object.points[i].x-min_x)*scale_x;
            object.points[i].y=new_min_y+(object.points[i].y-min_y)*scale_y;
        }
    }
    else if (object.type==="rectangle") {
        if (handle===0)
        {
            object.x+=dx;
            object.y+=dy; 
            object.w-= dx;
            object.h-=dy; 
        } 
        else if (handle===1)
        {
            object.y+=dy; 
            object.w+=dx;
            object.h-=dy; 
        }
        else if (handle===2)
        {
            object.x+=dx; 
            object.w-=dx;
            object.h+=dy; 
        }
        else if (handle===3)
        {
            object.w+=dx;
            object.h+=dy; 
        }
    }
    else if (object.type==="circle")
    {
        object.radius=Math.sqrt(Math.pow(mouse_x-object.cx,2)+Math.pow(mouse_y-object.cy,2));
    }
    else if (object.type==="line")
    {
        let dist1=Math.pow(mouse_x-object.x1,2)+Math.pow(mouse_y-object.y1,2);
        let dist2=Math.pow(mouse_x-object.x2,2)+Math.pow(mouse_y-object.y2,2);
        if (dist1<dist2)
        {
            object.x1=mouse_x;
            object.y1=mouse_y;
        }
        else
        {
            object.x2=mouse_x;
            object.y2=mouse_y;
        }
    }
    else if(object.type==="triangle")
    {
        let min_x=Math.min(object.x1, object.x2, object.x3);
        let max_x=Math.max(object.x1, object.x2, object.x3);
        let min_y=Math.min(object.y1, object.y2, object.y3);
        let max_y=Math.max(object.y1, object.y2, object.y3);
        let old_w=max_x-min_x;
        let old_h=max_y-min_y;
        if(old_w===0)
            old_w=0.1;
        if(old_h===0)
            old_h=0.1;
        let scale_x=1, scale_y=1;
        let new_min_x=min_x, new_min_y=min_y;
        if(handle===0)
        {
            new_min_x+=dx; 
            new_min_y+=dy;
            scale_x=(max_x-new_min_x)/old_w;
            scale_y=(max_y-new_min_y)/old_h;
        }
        else if(handle===1)
        {
            new_min_y+=dy;
            scale_x=(max_x+dx-min_x)/old_w;
            scale_y=(max_y-new_min_y)/old_h;
        }
        else if(handle===2)
        {
            new_min_x+=dx;
            scale_x=(max_x-new_min_x)/old_w;
            scale_y=(max_y+dy-min_y)/old_h;
        }
        else if(handle===3)
        {
            scale_x=(max_x+dx-min_x)/old_w;
            scale_y=(max_y+dy-min_y)/old_h;
        }
        object.x1=new_min_x+(object.x1-min_x)*scale_x;
        object.y1=new_min_y+(object.y1-min_y)*scale_y;
        object.x2=new_min_x+(object.x2-min_x)*scale_x;
        object.y2=new_min_y+(object.y2-min_y)*scale_y;
        object.x3=new_min_x+(object.x3-min_x)*scale_x;
        object.y3=new_min_y+(object.y3-min_y)*scale_y;
    }
    else if(object.type==="image")
    {
        if (handle===0)
        {
            object.x+=dx;
            object.y+=dy;
            object.w-=dx;
            object.h-=dy; 
        } 
        else if (handle===1)
        {
            object.y+=dy;
            object.w+=dx;
            object.h-=dy;
        } 
        else if (handle===2){
            object.x+=dx;
            object.w-=dx;
            object.h+=dy;
        } 
        else if (handle===3)
        {
            object.w+=dx;
            object.h+=dy;
        }
    }
    else if(object.type==="text")
    {
        if(handle===0)
        {
            object.x+=dx;
            object.y+=dy;
            object.size=Math.max(8, object.size-dy);
        }
        else if(handle===1)
        {
            object.y+=dy;
            object.size=Math.max(8, object.size-dy);
        }
        else if(handle===2)
        {
            object.x+=dx;
            object.size=Math.max(8, object.size+dy);
        }
        else if(handle===3)
        {
            object.size=Math.max(8, object.size+dy);
        }
    }
}