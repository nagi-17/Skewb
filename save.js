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

window.addEventListener("keydown", function(event){
    if(typing) return;
    if(event.key==="Delete"||event.key==="Backspace")
    {
        if(selected_button==="select"&&selected_shape_index!==-1)
        {
            let rem=arr.splice(selected_shape_index, 1);
            arr_temp.push(rem[0]);
            selected_shape_index=-1;
            active_handle=-1;
            f_redraw();
        }
    }
    if(event.ctrlKey&&(event.key==="z"||event.key==="Z"))
    {
        f_undo();
    }
    if(event.ctrlKey&&(event.key==="y"||event.key==="Y"))
    {
        f_redo();
    }
    event.preventDefault();
})

document.getElementById("delete-button").addEventListener("click", function() {
    if (selected_button==="select"&&selected_shape_index!==-1)
    {
        let remove=arr.splice(selected_shape_index, 1);
        arr_temp.push(remove[0]);
        selected_shape_index=-1;
        active_handle=-1;
        f_redraw();
    }
});

if (localStorage.getItem("saved_canvas")) {
    arr=JSON.parse(localStorage.getItem("saved_canvas"));
    arr.forEach(object=>{
        if (object.type==="image")
        {
            let temp_url=object.img;
            object.img=new Image();
            object.img.src=temp_url;
            object.img.onload=f_redraw;
        }
    });    
    f_redraw();
}