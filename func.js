{
let darkmode=localStorage.getItem("dark-mode")
const themetoggle = document.getElementById("theme-toggle")

function enabledarkmode() {
    document.body.classList.add("dark-mode")
    localStorage.setItem("dark-mode", "active")
}

function disabledarkmode() {
    document.body.classList.remove("dark-mode")
    localStorage.setItem("dark-mode", null)
}

if (darkmode === "active") enabledarkmode()

themetoggle.addEventListener("click", ()=>{
    darkmode = localStorage.getItem("dark-mode")
    darkmode!="active" ? enabledarkmode() : disabledarkmode()
})
}