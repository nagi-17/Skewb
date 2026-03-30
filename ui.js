let darkmode=localStorage.getItem("dark-mode");
const themetoggle=document.getElementById("theme");

if (darkmode==="active") { enabledarkmode(); }
themetoggle.addEventListener("click", function () {
    darkmode=localStorage.getItem("dark-mode");
    darkmode!="active" ? enabledarkmode() : disabledarkmode();
});

for (let btn of button) {
    btn.addEventListener("click", f_active);
}

for (let btn of button_stroke_style) {
    btn.addEventListener("click", f_active_stroke_style);
}

function enabledarkmode() {
    document.body.classList.add("dark-mode");
    localStorage.setItem("dark-mode", "active");
}

function disabledarkmode() {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("dark-mode", null);
}

function f_active(event) {
    let buttonclick=event.currentTarget.id;
    if (lastactive) 
    { 
        lastactive.classList.remove("active"); 
    }
    document.getElementById(buttonclick).classList.add("active");
    lastactive=document.getElementById(buttonclick);
    selected_button=buttonclick;
    if (selected_button==="select" || selected_button==="eraser") {
        canvas.style.cursor="pointer";
    }
    else if (selected_button==="text") {
        canvas.style.cursor="text";
    }
    else {
        canvas.style.cursor = "crosshair";
    }
    f_hide_sidebar();
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

function f_stroke_color() { return document.getElementById("stroke-color").value; }
function f_stroke_width() { return document.getElementById("stroke-width").value; }
function f_opacity() { return document.getElementById("opacity").value; }
function f_stroke_style() {
    if (document.getElementById("style-dashed")&&document.getElementById("style-dashed").classList.contains("active")) 
        return "style-dashed";
    else if (document.getElementById("style-dotted")&&document.getElementById("style-dotted").classList.contains("active")) 
        return "style-dotted";
    else
        return "solid";
}

window.addEventListener("keydown", function(event){
    if(typing) return;
    if((event.key==="1"))
    {
        let select_btn=document.getElementById("select");    
        if (selected_button!=="select"&&select_btn) {
            if (lastactive) {
                lastactive.classList.remove("active");
            }
            select_btn.classList.add("active");
            lastactive=select_btn;
            selected_button="select";
            canvas.style.cursor="pointer";
        }
    }
    else if((event.key==="2"))
    {
        let select_btn=document.getElementById("brush");    
        if (selected_button!=="brush"&&select_btn) {
            if (lastactive) {
                lastactive.classList.remove("active");
            }
            select_btn.classList.add("active");
            lastactive=select_btn;
            selected_button="brush";
        }
    }
    else if((event.key==="3"))
    {
        let select_btn=document.getElementById("eraser");    
        if (selected_button!=="eraser"&&select_btn) {
            if (lastactive) {
                lastactive.classList.remove("active");
            }
            select_btn.classList.add("active");
            lastactive=select_btn;
            selected_button="eraser";
            canvas.style.cursor="pointer";
        }
    }
    else if((event.key==="4"))
    {
        let select_btn=document.getElementById("line");    
        if (selected_button!=="line"&&select_btn) {
            if (lastactive) {
                lastactive.classList.remove("active");
            }
            select_btn.classList.add("active");
            lastactive=select_btn;
            selected_button="line";
        }
    }
    else if((event.key==="5"))
    {
       let select_btn=document.getElementById("rectangle");    
        if (selected_button!=="rectangle"&&select_btn) {
            if (lastactive) {
                lastactive.classList.remove("active");
            }
            select_btn.classList.add("active");
            lastactive=select_btn;
            selected_button="rectangle";
        } 
    }
    else if((event.key==="6"))
    {
        let select_btn=document.getElementById("circle");    
        if (selected_button!=="circle"&&select_btn) {
            if (lastactive) {
                lastactive.classList.remove("active");
            }
            select_btn.classList.add("active");
            lastactive=select_btn;
            selected_button="circle";
        }
    }
    else if((event.key==="7"))
    {
        let select_btn=document.getElementById("triangle");    
        if (selected_button!=="triangle"&&select_btn) {
            if (lastactive) {
                lastactive.classList.remove("active");
            }
            select_btn.classList.add("active");
            lastactive=select_btn;
            selected_button="triangle";
        }
    }
    else if((event.key==="8"))
    {
        let select_btn=document.getElementById("text");    
        if (selected_button!=="text"&&select_btn) {
            if (lastactive) {
                lastactive.classList.remove("active");
            }
            select_btn.classList.add("active");
            lastactive=select_btn;
            selected_button="text";
        }
    }
    else if((event.key==="9"))
    {
        let select_btn=document.getElementById("image");    
        if (selected_button!=="image"&&select_btn) {
            if (lastactive) {
                lastactive.classList.remove("active");
            }
            select_btn.classList.add("active");
            lastactive=select_btn;
            selected_button="image";
        }
    }
    f_hide_sidebar();
})

document.getElementById("sidebar").addEventListener("click", function() {
    document.getElementById("properties-panel").classList.toggle("show");
});

function f_hide_sidebar() {
    let panel=document.getElementById("properties-panel");
    let sidebar=document.getElementById("sidebar");
    let stroke_color_label=document.querySelector('label[for="stroke-color"]');
    let stroke_width_label=document.querySelector('label[for="stroke-width"]');
    let stroke_style_label=document.querySelector('label[for="stroke-style"]');
    let style_buttons=document.querySelector('.style-buttons');

    if (selected_button==="image"||selected_button==="eraser")
    {
        panel.style.display="none";
        sidebar.style.display="none";

    }   
    else
    {
        panel.style.display="";
        sidebar.style.display="";
        if (selected_button==="text")
        {
            stroke_color_label.innerText="FONT COLOR";
            stroke_width_label.innerText="FONT SIZE:";
            stroke_style_label.style.display="none";
            style_buttons.style.display="none";
        }
        else
        {
            stroke_color_label.innerText="STROKE COLOR";
            stroke_width_label.innerText="STROKE WIDTH:";
            stroke_style_label.style.display=""; 
            style_buttons.style.display=""; 
        }
    }
}