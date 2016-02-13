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
        this.detail.mouseX = -1;
        this.detail.mouseY = -1;
        this.detail.keyPressed = null;
        this.detail.deltaX = 0;
        this.detail.deltaY = 0;
        this.detail.mouseIn = false;
        this.editor = editor;
        
        var thisObj = this;
        // the detail refers to same object
        this.inputEvent = new CustomEvent('InputEvent', {"detail":this.detail});
        $(this.editor).mousedown(function(e){thisObj.mouseInputDown(e)});
        $(this.editor).mouseup(function(e){thisObj.mouseInputUp(e)});
        $(this.editor).mousemove(function(e){thisObj.mouseInputMove(e)});
        
        this.editor.addEventListener('mousewheel',function(e){e.preventDefault(); thisObj.mouseInputWheel(e)});
        
        console.log("New Input Events");
    }
    
    InputEvents.prototype.keyInputDown = function(event){
        
    }
    
    InputEvents.prototype.keyInputUp = function(event){
        
    }
    
    InputEvents.prototype.mouseInputLeave = function(event){
        
    }
    
    InputEvents.prototype.mouseInputEnter = function(event){
        
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
        this.editor.dispatchEvent(this.inputEvent);
    }
    
    InputEvents.prototype.mouseInputMove = function(event){
        this.detail.mouseX = event.pageX - $(this.editor).offset().left;
        this.detail.mouseY = event.pageY - $(this.editor).offset().top;
        this.editor.dispatchEvent(this.inputEvent);
    }
    
    InputEvents.prototype.mouseInputWheel = function(event){
        this.detail.deltaX = event.deltaX;
        this.detail.deltaY = event.deltaY;
        this.editor.dispatchEvent(this.inputEvent);
    }
    
    InputEvents.prototype.mouseInputDoubleClick = function(event){
        
    }
}