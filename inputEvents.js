// Setup namespace
// useful link: https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
var Input_Events = new function() {
    
    this.init = function(editor){
        this.Inputevents = new InputEvents(editor);
    }
    
    this.getInputEvents = function(){
        return this.Inputevents;
    }
    
    var InputEvents = function(editor){
        this.detail = {};
        this.detail.mouseDown = false;
        this.detail.mouseDrag = false;
        this.detail.mouseX = -1;
        this.detail.mouseY = -1;
        this.detail.keyDown = null;
        this.detail.deltaX = 0;
        this.detail.deltaY = 0;
        this.detail.scrollConsumes = 0;
        this.detail.doubleClick = false;
        this.editor = editor;
        this.prevMouseX = -1;
        this.prevMouseY = -1;
        
        var thisObj = this;
        // the detail refers to same object
        this.inputEvent = new CustomEvent('InputEvent', {"detail":this.detail});
        $(this.editor).mousedown(function(e){thisObj.mouseInputDown(e); return false;});
        $(this.editor).mouseup(function(e){thisObj.mouseInputUp(e); return false;});
        $(this.editor).mousemove(function(e){thisObj.mouseInputMove(e); return false;});
        $(this.editor).mouseleave(function(e){thisObj.mouseInputLeave(e); return false;});
        $(this.editor).dblclick(function(e){e.preventDefault(); thisObj.mouseInputDoubleClick(e); return false;});
        $(document).keydown(function(e){thisObj.keyInputDown(e); return false;});
        $(document).keyup(function(e){thisObj.keyInputUp(e); return false;});
        
        this.editor.addEventListener('mousewheel',function(e){thisObj.mouseInputWheel(e); return false;});
        
        console.log("New Input Events");
    }
    
    InputEvents.prototype.keyInputDown = function(event){
        this.detail.keyDown = event.keyCode;
        this.editor.dispatchEvent(this.inputEvent);
    }
    
    InputEvents.prototype.keyInputUp = function(event){
        this.detail.keyDown = null;
        this.editor.dispatchEvent(this.inputEvent);
    }
    
    InputEvents.prototype.mouseInputLeave = function(event){
        this.detail.mouseDown = false;
        this.detail.mouseX = -1;
        this.detail.mouseY = -1;
        this.editor.dispatchEvent(this.inputEvent);
    }
    
    InputEvents.prototype.mouseInputDown = function(event){
        this.detail.mouseX = event.pageX - $(this.editor).offset().left;
        this.detail.mouseY = event.pageY - $(this.editor).offset().top;
        this.detail.mouseDown = true;
        this.editor.dispatchEvent(this.inputEvent);
    }
    
    InputEvents.prototype.mouseInputUp = function(event){
        this.detail.mouseX = event.pageX - $(this.editor).offset().left;
        this.detail.mouseY = event.pageY - $(this.editor).offset().top;
        this.detail.mouseDown = false;
        this.prevMouseX = -1;
        this.prevMouseY = -1;
        this.detail.mouseDrag = false;
        this.editor.dispatchEvent(this.inputEvent);
    }
    
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
    
    InputEvents.prototype.mouseInputWheel = function(event){
        this.detail.deltaX = event.deltaX;
        this.detail.deltaY = event.deltaY;
        this.detail.scrollConsumes = 2;
        this.editor.dispatchEvent(this.inputEvent);
    }
    
    InputEvents.prototype.mouseInputDoubleClick = function(event){
        this.detail.doubleClick = true;
        this.editor.dispatchEvent(this.inputEvent);
    }
}