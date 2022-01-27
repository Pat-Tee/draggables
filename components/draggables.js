/*
This file, in the first line of code, injects it's stylesheet into the document head
Simply link this js script file in the HTML in order to use
Draggable elements are applied when initDrag() is called, such as onload() or at an onclick()
Arbitrary elements can be made draggable by having one outer <div> applying the dragDiv class, and one inner <div> applying the dragClick class.
box, header, and boxBody classes are included here as basic placeholder stylings
*/
document.querySelector("head").insertAdjacentHTML('beforeend', "<link rel='stylesheet' type='text/css' href="+"'./components/draggableElement.css'/>");

const _CONTROL_HTML_ = `<div name="Control" style="z-index: 9;" class="dragDiv box">
                                <div id="draggable0" class="dragClick header">Control Window</div>
                                <div class="boxBody">
                                    <p id="windowCount">Number of windows: 0</p>
                                    <button dragId="new">New Window</button>
                                    <button dragId="reset">Reset</button>
                                    <button dragId="save">Save</button>
                                    <button dragId="load">Load</button>
                                    <button dragId="log">Log</button>
                                </div>
                            </div>`;

function dragEngine() {
    this.list = [];
    this.initialized = false;
    this.uidGen = () => {
        if (!this.uidGen.uid) {
            this.uidGen.uid = 0;
        }
        this.uidGen.uid++;
        return this.uidGen.uid;
    }

    this.dragObject=(name='', html='')=> {
        var newObj = {
            posX: 0,
            posY: 0,
            uid: this.uidGen(),
            name: '',
            html: '',
            element: null,
            show: true
        }
        name ? newObj.name = name : newObj.name = `Window ${newObj.uid}`;
        html ? newObj.html = html : newObj.html = `<div name="${newObj.name}" class="dragDiv box"><div id="draggable${newObj.uid}" class="dragClick header">${newObj.name}<button dragId="remove">x</button></div><div class="boxBody"><input id="inputText" style="text" placeholder="text input"/></div></div>`;
        return newObj;
    }

    this.init = () => {
        if (this.initialized) { this.load(); return; }
        if (!document.querySelector('#draggable0')) document.body.insertAdjacentHTML('beforeend',_CONTROL_HTML_);
        let dragElements = document.getElementsByClassName("dragClick");
        for (let i=0; i<dragElements.length; i++) {
            let last = this.list.length;
            this.list.push(this.dragObject('', dragElements[i]) );
            this.list[last].element = dragElements[i];
            if (!this.list[last].element.id) 
                this.list[last].element.id = `draggable${this.list[last].uid}`; 
            this.dragElement(this.list[last].element);
            this.setEvents(this.list[last].element.parentElement);
        }
        this.update();
        this.initialized = true;
    }

    this.setEvents=(element)=>{
        const events = {
            'new': this.new,
            'remove': this.remove,
            'reset': this.reset,
            'load': this.load,
            'save': this.save,
            'log': this.log
        }

        let ele = null;
        for (each in events) {
            ele = element.querySelector(`[dragId='${each}']`);
            ele ? ele.onclick = events[each] : click=()=>{console.log('non-enumerated onclick event')};
        }
    }

    this.update = () => {
        let controlWindowCount = document.getElementById('draggable0').parentElement;
        controlWindowCount ? controlWindowCount.querySelector('#windowCount').innerHTML = `Window count: ${this.list.length}` : console.log(`controlWindowCount invalid`);
    }

    this.new = () => {
        console.log('new clicked')
        let last = this.list.length;
        this.list.push( this.dragObject() );
        this.count++;
        document.body.insertAdjacentHTML('beforeend', this.list[last].html);
        this.list[last].element = document.querySelector(`#draggable${this.list[last].uid}`);
        this.dragElement(this.list[last].element);
        this.setEvents(this.list[last].element.parentElement);
        this.update();
    }

    this.remove = (e) => {
        console.log('remove clicked')
        e = e || windows.event;
        let newList = [];
        for (let i=0; i<this.list.length; i++) {
            if (`draggable${this.list[i].uid}` != e.target.parentElement.id)
                newList.push(this.list[i]);
        }
        e.target.parentElement.parentElement.remove();
        this.list = newList;
        this.update();
    }
    
    this.reset = () => {
        localStorage.clear();
        window.location.reload();
    }

    this.save = () => {
        console.log('save clicked')

        let pageData = {
            list: this.list,
            uid: this.uidGen.uid
        }
        for (let i=0; i<this.list.length; i++) {
            pageData.list[i].posX = this.list[i].element.style.left;
            pageData.list[i].posY = this.list[i].element.style.top;
        }
        console.log(`uid on save == ${this.uidGen.uid}`);
        localStorage.setItem("pageBody", document.body.innerHTML );
        localStorage.setItem("pageData", JSON.stringify(pageData) );
    }

    this.load = () => {
        this.list = [];
        console.log('load clicked');
        var pageBody = localStorage.getItem("pageBody");
        var pageData = localStorage.getItem("pageData");

        if (pageBody && pageData) {
            console.log("loading saved page: ")
            document.body.innerHTML = pageBody;
            pageData = JSON.parse(pageData);
            this.uidGen.uid = 0;
            console.log(`uid on load == ${this.uidGen.uid}`);
        } else {console.log('Error in localStorage'); return;}

        let dragElements = document.getElementsByClassName("dragClick");

        for (let i=0; i<dragElements.length; i++) {
            let last = this.list.length;
            this.list.push(this.dragObject('', dragElements[i]) );
            this.list[last].element = dragElements[i];
            if (!this.list[last].element.id)
                this.list[last].element.id = `draggable${this.list[last].uid}`;
            this.dragElement(this.list[last].element);
            this.setEvents(this.list[last].element.parentElement);
        }
        
        this.update();
    }

    this.log = () => {
        console.log(`log: BEGIN this.list == `)
        for (let i=0; i<this.list.length;i++) {
            console.log(this.list[i])
        }
        console.log(`END this.list`)
    }

    //Basic Drag function
    this.dragElement = (ele) => {
        var pos1=0, pos2=0,
            pos3=0, pos4=0;

        ele.onmousedown = dragMouseDown;
        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            ele.parentElement.style.zIndex = 2;
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
            ele.parentElement.style.zIndex = 1;
        }
    }
    // basic drag function taken from: https://www.tutorialspoint.com/how-to-create-a-draggable-html-element-with-javascript-and-css
}
/*===============================*/
function draggables() {         /// This is the function that returns the object to use to call .init(), which should be called from the main document HTML script or onload
    return new dragEngine();    ///
}                               ///
/*===============================*/