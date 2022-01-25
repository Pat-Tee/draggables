/*
This file, in the first line of code, injects it's stylesheet into the document head
Simply link this js script file in the HTML in order to use
Draggable elements are applied when initDrag() is called, such as onload() or at an onclick()
Arbitrary elements can be made draggable by having one outer <div> applying the dragDiv class, and one inner <div> applying the dragClick class.
box, header, and boxBody classes are included here as basic placeholder stylings
*/
document.getElementsByTagName("head")[0].outerHTML += "<link rel='stylesheet' type='text/css' href="+"'./draggableElement.css'/>"+"\n";
/*
localStorage (not server-accessible, up to 5MB ? site-wide access)
value = getItem(key)
setItem(key, value)
removeItem(key)
clear()
*/
const _CONTROL_HTML_ = `<div id="dragControl" style="z-index: 9;" class="dragDiv box">
                                <div class="dragClick header">Control Window</div>
                                <div class="boxBody">
                                <p id="windowCount">Number of windows: zeroDraggables</p>
                                    <button id="newDraggable">New Window</button>
                                    <button id="resetDraggables">Reset</button>
                                    <button id="saveDraggables">Save</button>
                                    <button id="logDraggables">Log</button>
                                </div>
                            </div>`;

const _DEFAULT_HTML_ = `<div id="defaultDraggable" class="dragDiv box">
                                <div class="dragClick header">TITLE<button name="removeDraggable">x</button></div>
                                <div class="boxBody">
                                    <input id="inputText" style="text" placeholder="text input"/>
                                </div>
                            </div>`;

class draggable {
    #index = 0;
    constructor(title="title", html=_DEFAULT_HTML_) {
        this.title = title;
        this.html = html;
        this.element = null;
        this.#index++;
    }
    getIndex() {
        return this.#index;
    }
}

class draggables {

    constructor() {
        this.count = 0;
        this.list = [];
        this.showControl = true;
        }
    
    new(title, html) {
        
        this.list.push(new draggable(title, html) );

        let item = this.list[this.list.length-1];

        document.body.innerHTML += item.html;

        // if (!item.element) console.log("new item invalid");
        // else item.element.id = "draggable"+item.getIndex();
        // item.element.addEventListener("click", this.drag(ele.element))
        this.count++;
    }

    add(ele) {
        if (!ele || ele==null) {
            console.log("add failed, parameter invalid")
            return;
        }
        this.list.push(ele);
        document.body.innerHTML += this.list[this.count].html;
        this.count++;
    }

    remove(ele) {

        console.log("remove clicked by: ");
        console.log(ele)
        let newList = [];
        this.count = 0;
        for (each in this.list) {
            if (each != ele.id) {
                newList.push(each);
                this.count++;
            } else {
                document.getElementById(this.list[each].remove() )
            }
        }
        this.list = newList;   
        // document.getElementById(index).parentNode.removeChild(windowElem);
        this.update();
    }

    reset() {
        console.log("resetting")
        localStorage.clear();
        window.location.reload();
    }

    save() {
        localStorage.setItem("draggables", JSON.stringify(this) );
        localStorage.setItem("htmlBody", document.body.innerHTML);
    }

    load() {
        document.body.innerHTML = localStorage.getItem("htmlBody");
        return JSON.parse(localStorage.getItem("draggables") );
    }

    log() {
        console.log("document html: ")
        console.log(document.documentElement)
    }

    update() {
        for (let each in list) {
            this.drag(each)
        }
    }

    drag(ele) {
        console.log("dragging")
        var pos1=0, pos2=0,
            pos3=0, pos4=0;
        ele.onmousedown = dragMouseDown;
        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
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
        }
    }
}


var windows = new draggables;

function initDraggables(showControl = true) {
    windows.showControl = showControl;
    if (windows.showControl) {
        windows.new("CONTROL", _CONTROL_HTML_);
    }
    let ele = document.getElementById("newDraggable");
    if (ele) ele.addEventListener("click",windows.new);

    ele = document.getElementById("resetDraggables");
    if (ele) ele.addEventListener("click",windows.reset);

    ele = document.getElementById("saveDraggables");
    if (ele) ele.addEventListener("click",windows.save);

    ele = document.getElementById("logDraggables");
    if (ele) ele.addEventListener("click",windows.log);

    ele = document.querySelectorAll("[name='removeDraggable']");
    if (ele) {
        for(let i=0; i< ele.clientHeight; i++)
            ele[i].addEventListener('click', windows.remove);
    }
    else console.log("did not find elements by name 'removeDraggable'");
            /*evt => {
        console.log("event listener check for removeDraggable")
        if (!evt.target.matches('removeDraggable')) return;
        alert(evt.target.textContent); //e.g. "One"
    }*/

    // ele = document.querySelectorAll('.dragClick');
    // if (ele)
    //     for (let i=0; i< ele.clientHeight; i++)
    //         ele[i].addEventListener('click', drag )
}