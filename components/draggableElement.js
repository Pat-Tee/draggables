/*
This file, in the first line of code, injects it's stylesheet into the document head
Simply link this js script file in the HTML in order to use
Draggable elements are applied when initDrag() is called, such as onload() or at an onclick()
Arbitrary elements can be made draggable by having one outer <div> applying the dragDiv class, and one inner <div> applying the dragClick class.
box, header, and boxBody classes are included here as basic placeholder stylings
*/
document.getElementsByTagName("head")[0].outerHTML += "<link rel='stylesheet' type='text/css' href="+"'./components/draggableElement.css'/>"+"\n";

//===================== BEGIN CLASS DEFINITIONS
const controlWindowHTML = `<div id="controlWindow" style="z-index: 9;" class="dragDiv box">
                                <div class="dragClick header">Control Window</div>
                                <div class="boxBody">
                                <p id="windowCount">Number of windows: ZERO</p>
                                    <button onclick="newDragElement()">New Window</button>
                                    <button onclick="resetPage()">Reset</button>
                                    <button onclick="savePage()">Save</button>
                                    <button onclick="printHTML()">Log Document</button>
                                </div>
                            </div>`;

const defaultWindowHTML = `<div id="defaultWindow" class="dragDiv box">
                                <div class="dragClick header">TITLE<button onclick="removeDragElement()">x</button></div>
                                <div class="boxBody">
                                    <input id="inputText" style="text" placeholder="text input"/>
                                </div>
                            </div>`;

const printHTML = () => {console.log("printHTML:\n"); console.log(document.documentElement);}

class dragWindow {

    constructor(_title="Window", _html="") {

        this.box = {};
        this.title = _title;
        this.element = null;

        if (!_html)
            this.html = defaultWindowHTML;
        else this.html = _html;
    }
}

class dragWindows {

    constructor() {
        this.count = 0;
        this.controlWindow = false;
        this.indexCount = 0;
        this.window = [];
    }

    newWindow(_title="", _html="", reload=false) {
        this.window.push( new dragWindow(_title, _html) );
        this.count++;
        this.indexCount++;
        console.log("window "+(this.indexCount)+" added to windows class");
        return this.indexCount;
    }

    addWindow(_title="", _html="", reload=false) {
        this.window.push( new dragWindow(_title, _html) );
        this.count++;
        console.log("window "+(this.indexCount)+" added to windows class");
        return this.indexCount;
    }

    removeWindow(index) {

        let newList = [];
        for (let item in this.window) {
            if (item !== index) {
                newList.push(item);
            }
        }
        if (this.count > 0)
            this.count--;
        // console.log(document.getElementById("window"+index));
    }
};
//============ END CLASS DEFINITIONS

//============ BEGIN GLOBAL DECLARATIONS
var windows = new dragWindows;
//============ END GLOBAL DECLARATIONS

//============ BEGIN FUNCTION DEFINITIONS

function initDrag() { // This function should run once, always after the HTML has loaded, and then runDrag() will handle updating and processing

    loadPage();

    let draggables = document.getElementsByClassName("dragClick");
    // let tmpIndexCount = windows.indexCount;
    for (let i=0; i<draggables.length; i++) {
        let title = draggables[i].parentElement.getAttribute('id');
        title == null ? 
        draggables[i].parentElement.setAttribute('id', "Window"+i) : console.log("window id: "+title);
        
        windows.addWindow(title!=null ? title : "PLACEHOLDER", "", true);
    }
    runDrag();
}

function runDrag() {

    if (!windows.controlWindow) {
        windows.controlWindow = true;
        windows.addWindow("Control",controlWindowHTML, 0, 0);
        document.body.innerHTML += controlWindowHTML;
    }

    let draggables = document.getElementsByClassName("dragClick");

    if (draggables[0]) {
        for (let i=0; i < draggables.length; i++) {
            let ele = windows.window[i];
            dragElement(draggables[i]);
            ele.element = draggables[i];
            ele.box = draggables[i].getBoundingClientRect();
            for (let j=i+1; j< draggables.length; j++)  {
                checkCollision(ele.element, draggables[j]);
            }
        }
    } else console.log("No draggable windows.");
    document.getElementById("windowCount").innerHTML = `Number of windows: ${windows.count}`;
}

function checkCollision(ele1, ele2) {
    let tlCollision = false, brCollision = false;
    let ele1Box = ele1.parentElement.getBoundingClientRect(), ele2Box = ele2.parentElement.getBoundingClientRect();

    if ( (ele1Box.x > ele2Box.x && ele1Box.x < ele2Box.right) && (ele1Box.y > ele2Box.y && ele1Box.y < ele2Box.bottom) ) tlCollision = true; 
    if ( (ele1Box.right > ele2Box.x && ele1Box.right < ele2Box.right) && (ele1Box.bottom > ele2Box.y && ele1Box.bottom < ele2Box.bottom) ) brCollision = true;

    if (tlCollision || brCollision) {
        let newY = ele2Box.bottom+1;
        let newX = ele2Box.x;
        ele1.parentElement.style.left = newX+"px";
        ele1.parentElement.style.top = newY+"px";
        console.log("collision detected")

        return true;
    }

    return false;
};

function newDragElement() {
    windows.newWindow();
    let index = windows.window.length-1;
    windows.window[index].html = windows.window[index].html.replace("TITLE", `New Window ${windows.indexCount}`);
    document.body.innerHTML += windows.window[index].html;
    let newId = document.getElementById("defaultWindow");
    // newId.style.zIndex = windows.count+1; // need to prioritize z value, but this way will theoretically hit an integer upper value limit
    newId ? newId.id = "window"+windows.indexCount : console.log("could not locate defaultWindow id from newDragElement()")
    runDrag();
}

function removeDragElement(e) {
    e = e || window.event;

    let windowElem = e.target.parentElement.parentElement;
    let index = windowElem.id;

    document.getElementById(index).remove();
    // document.getElementById(index).parentNode.removeChild(windowElem);

    index = +index.replace("window", "");
    console.log(index)
    windows.removeWindow(index);
    runDrag();

}
function loadPage() {
    var savedPage = localStorage.getItem("mainBody");
    var savedWindows = localStorage.getItem("savedWindows");

    if (savedPage) {
        // document.body.innerHTML = "";
        let main = document.getElementsByTagName('body');
        main[0].innerHTML = savedPage;
        // document.body.innerHTML = savedPage;
        // document.documentElement = savedPage;
    }
    if (savedWindows) {
        let windowsData = JSON.parse(savedWindows);
        for (each in windowsData) {
            windows[each] = windowsData[each];
        }
        windows.count = 0;
    }
}

function savePage() {
    localStorage.setItem("mainBody", document.body.innerHTML );
    // localStorage.setItem("mainBody", document.documentElement);
    localStorage.setItem("savedWindows", JSON.stringify(windows) );
}

function resetPage() {
    localStorage.removeItem("mainBody");
    localStorage.removeItem("savedWindows");
    window.location.reload();
}

/*-------------------
//Basic Drag function
-------------------*/
function dragElement(ele) {

    var pos1=0, pos2=0,
        pos3=0, pos4=0;

    ele.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();

        
        ele.parentElement.style.zIndex = 2;
        console.log(ele.parentElement.style.zIndex)
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        ele.parentElement.style.top = ele.parentElement.offsetTop - pos2 + "px";
        ele.parentElement.style.left = ele.parentElement.offsetLeft - pos1 + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        runDrag();
    }

}

// basic drag function taken from: https://www.tutorialspoint.com/how-to-create-a-draggable-html-element-with-javascript-and-css