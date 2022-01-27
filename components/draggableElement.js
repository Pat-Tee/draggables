/*
This file, in the first line of code, injects it's stylesheet into the document head
Simply link this js script file in the HTML in order to use
Draggable elements are applied when initDrag() is called, such as onload() or at an onclick()
Arbitrary elements can be made draggable by having one outer <div> applying the dragDiv class, and one inner <div> applying the dragClick class.
box, header, and boxBody classes are included here as basic placeholder stylings
*/

// I just spent waaay too much time chasing a bug that was adding a second body tag, one for the hardcoded HTML and one for the javascript HTML
// The issue was I had document.getElementsByTagName("head")[0].outerHTML for my stylesheet injection. Now I have it correct.

document.querySelector("head").innerHTML += "<link rel='stylesheet' type='text/css' href="+"'./components/draggableElement.css'/>"+"\n";

//===================== BEGIN CLASS DEFINITIONS
const controlWindowHTML = `<div id="controlWindow" style="z-index: 9;" class="dragDiv box">
                                <div class="dragClick header">Control Window</div>
                                <div class="boxBody">
                                <p id="windowCount">Number of windows: ZERO</p>
                                    <button onclick="newDragElement()">New Window</button>
                                    <button onclick="resetPage()">Reset</button>
                                    <button onclick="savePage()">Save</button>
                                    <button onclick="loadPage()">Load</button>
                                </div>
                            </div>`;

const defaultWindowHTML = `<div id="defaultWindow" class="dragDiv box">
                                <div class="dragClick header">TITLE<button onclick="removeDragElement()">x</button></div>
                                <div class="boxBody">
                                    <input id="inputText" style="text" placeholder="text input"/>
                                </div>
                            </div>`;

class dragWindow {

    constructor(_title="x", _html='' ) {
        this.title = _title;
        this.element = null;
        if (_html)
            this.html = _html;
        else
            this.html = defaultWindowHTML;
    }
}

class dragWindows {

    constructor() {
        this.controlWindow = false;
        this.count = 0;
        this.indexCount = 0;
        this.window = [];
    }

    newWindow(_title="", _html="") {
        this.window.push( new dragWindow(_title, _html) );
        this.count++;
        this.indexCount++;
        console.log("new window "+(this.indexCount)+" added to windows class");
        return this.indexCount;
    }

    addWindow(_title="", _html="") {
        this.window.push( new dragWindow(_title, _html) );
        this.count++;
        console.log("add window "+(this.indexCount)+" to windows class");
    }

    removeWindow(index) {
        let newList = [];
        for (let each in this.window) {
            if (each !== index) {
                newList.push(each);
            }
        }
        this.window = newList;
        if (this.count > 0)
            this.count--;
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
    for (let i=0; i<draggables.length; i++) {
        draggables[i].parentElement.id = "Window"+windows.indexCount;
        let title = draggables[i].parentElement.getAttribute('id');
        // newDragElement(title);
        windows.addWindow(title)
        // title == null ? 
        // draggables[i].parentElement.setAttribute('id', "Window"+i) : console.log("window id: "+title);
        // windows.addWindow(title!=null ? title : "PLACEHOLDER", "");
        console.log(title+" added")
    }
    runDrag();
}

function runDrag() {
    if (!windows.controlWindow) {
        windows.controlWindow = true;
        windows.addWindow("Control", controlWindowHTML);
        document.body.innerHTML += controlWindowHTML;
    }
    let draggables = document.getElementsByClassName("dragClick");
    if (draggables) {
        for (let i=0; i < draggables.length; i++) {
            // let ele = windows.window[i];
            dragElement(draggables[i]);
            // windows.window[i].element = draggables[i];
            // ele.box = draggables[i].getBoundingClientRect();
            for (let j=i+1; j< draggables.length; j++)  {
                checkCollision(draggables[i], draggables[j]);
            }
        }
    } else
        console.log("No draggable windows");
    let ele = document.getElementById("windowCount");
    ele? ele.innerHTML = `Number of windows: ${windows.count}` : console.log('No control window')
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
    let ele = document.getElementById("defaultWindow");
    // newId.style.zIndex = windows.count+1; // need to prioritize z value, but this way will theoretically hit an integer upper value limit
    ele ? ele.id = "window"+windows.indexCount : console.log("could not locate defaultWindow id from newDragElement()")
    windows.window.element = ele;
    runDrag();
}

function removeDragElement(e) {
    e = e || window.event;
    let windowElem = e.target.parentElement.parentElement;
    let index = windowElem.id;
    windowElem.remove();
    index = +index.replace("window", "");
    // console.log(index)
    windows.removeWindow(index);
    runDrag();
}

function loadPage() {

    var savedPage = localStorage.getItem("body");
    var savedWindows = localStorage.getItem("savedWindows");

    if (savedPage) {
        console.log("loading saved page: "+savedPage)
        document.body.innerHTML = savedPage;
    }
    if (savedWindows) {
        let windowsData = JSON.parse(savedWindows);
        for (each in windowsData) {
            windows[each] = windowsData[each];
            console.log(windows[each])
        }
        windows.count = windows.window.length;
    }
    console.log("windows loaded: "+ windows.count);
    if (windows.count > 0)
        return true;
    // runDrag();

}

function savePage() {
    localStorage.setItem("body", document.body.innerHTML );
    localStorage.setItem("savedWindows", JSON.stringify(windows) );
}

function resetPage() {
    // localStorage.removeItem("body");
    // localStorage.removeItem("savedWindows");
    localStorage.clear();
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
        // console.log(ele.parentElement.style.zIndex)
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