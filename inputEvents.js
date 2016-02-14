// Setup namespace
var Input_Events = new function() {
    
    // return new inputevents object
    this.init = function(editor){
        this.Inputevents = new InputEvents(editor);
    }
    
    // constructor
    var InputEvents = function(editor){
         
        // create detail object
        // reference will be sent to all eventListeners attached to editor
        this.detail = {};
        this.detail.mouseDown = false;
        this.detail.mouseDrag = false;
        this.detail.mouseX = -1;
        this.detail.mouseY = -1;
        this.detail.keyDown = null;
        this.detail.deltaX = 0;
        this.detail.deltaY = 0;
        this.detail.scrollConsumes = 0;
        this.detail.doubleClickConsumes = 0;
        this.editor = editor;
        this.prevMouseX = -1;
        this.prevMouseY = -1;
        
        // setup all input methods
        var thisObj = this;
        // detail refers to same object
        this.inputEvent = new CustomEvent('InputEvent', {"detail":this.detail});
        $(this.editor).mousedown(function(e){thisObj.mouseInputDown(e); return false;});
        $(this.editor).mouseup(function(e){thisObj.mouseInputUp(e); return false;});
        $(this.editor).mousemove(function(e){thisObj.mouseInputMove(e); return false;});
        $(this.editor).mouseleave(function(e){thisObj.mouseInputLeave(e); return false;});
        $(this.editor).dblclick(function(e){e.preventDefault(); thisObj.mouseInputDoubleClick(e); return false;});
        $(document).keydown(function(e){thisObj.keyInputDown(e); return false;});
        $(document).keyup(function(e){thisObj.keyInputUp(e); return false;});
        this.editor.addEventListener('mousewheel',function(e){e.preventDefault(); thisObj.mouseInputWheel(e); return false;});
        
        console.log("New Input Events");
    }
    
    // keydown
    InputEvents.prototype.keyInputDown = function(event){
        this.detail.keyDown = event.keyCode;
        this.editor.dispatchEvent(this.inputEvent);
    }
    
    // keyup, set key to null
    InputEvents.prototype.keyInputUp = function(event){
        this.detail.keyDown = null;
        this.editor.dispatchEvent(this.inputEvent);
    }
    
    // mouse leave canvas
    InputEvents.prototype.mouseInputLeave = function(event){
        this.detail.mouseDown = false;
        this.detail.mouseX = -1;
        this.detail.mouseY = -1;
        this.editor.dispatchEvent(this.inputEvent);
    }
    
    // mouse down
    InputEvents.prototype.mouseInputDown = function(event){
        this.detail.mouseX = event.pageX - $(this.editor).offset().left;
        this.detail.mouseY = event.pageY - $(this.editor).offset().top;
        this.detail.deltaX = 0;
        this.detail.deltaY = 0;
        this.detail.mouseDown = true;
        this.editor.dispatchEvent(this.inputEvent);
    }
    
    // mouse up
    InputEvents.prototype.mouseInputUp = function(event){
        this.detail.mouseX = event.pageX - $(this.editor).offset().left;
        this.detail.mouseY = event.pageY - $(this.editor).offset().top;
        this.detail.mouseDown = false;
        this.prevMouseX = -1;
        this.prevMouseY = -1;
        this.detail.mouseDrag = false;
        this.editor.dispatchEvent(this.inputEvent);
    }
    
    // mouse move
    InputEvents.prototype.mouseInputMove = function(event){
        this.detail.mouseX = event.pageX - $(this.editor).offset().left;
        this.detail.mouseY = event.pageY - $(this.editor).offset().top;
        if(this.prevMouseX != -1){
            this.detail.deltaX = this.detail.mouseX-this.prevMouseX;
            this.detail.deltaY = this.detail.mouseY-this.prevMouseY;
        }
        this.prevMouseX = this.detail.mouseX;
        this.prevMouseY = this.detail.mouseY;
        if(this.detail.mouseDown)
            this.detail.mouseDrag = true;
        this.editor.dispatchEvent(this.inputEvent);
    }
    
    // scroll on editor
    InputEvents.prototype.mouseInputWheel = function(event){
        this.detail.deltaX = event.deltaX;
        this.detail.deltaY = event.deltaY;
        // no NotScroll method so can't tell when scrolling stops
        // number of objects checking scroll is 2
        // each object consumes a scrollConsumes, meaning that scrollConsumes == 0 is NotScroll
        this.detail.scrollConsumes = 2;
        this.editor.dispatchEvent(this.inputEvent);
    }
    
    // double click
    InputEvents.prototype.mouseInputDoubleClick = function(event){
        // consumed by notesHandler
        this.detail.doubleClickConsumes = 1;
        this.editor.dispatchEvent(this.inputEvent);
    }
}