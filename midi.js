//Setup Namespace
var MIDI = new function() {
    
    // width of border around editor
    var borderWidth = 4;
    // height of scrubbing bar
    var scrubBarHeight = 30;
    // size of keys, height of notes
    var keySize = 24;
    // size of scrub bar pointer
    var scrubBarSize = 10;
    // position of scrub bar pointer from to of scrub bar
    var scrubBarPadding = 16;
    
    // pixels per section, constant
    var PixelsPerSection = 70;
    // different resolutions, represent beats per section
    var resolutions = [1/32,1/16,1/8,1/4,1/2,1,2,4,8,16,32];
    
    // velocity of scroll when using edge scroll (dragging elements at edg of window to scroll)
    var scrollVelocity = 24;
    
    // height of scroll bar at the bottom of the editor
    var scrollBarWidth = 26;
    
    // available keys for editor
    var keys = ["1","2","3","4","5","6","7","8","9","0","-",  "=",
                "Q","W","E","R","T","Y","U","I","O","P","[",  "]",
                "A","S","D","F","G","H","J","K","L",";","'",  "\\n",
                "Z","X","C","V","B","N","M",",",".","/","\\s","",
                "<",">","^","v"]; // these last 4 are left, right, up, down
                
    // keycodes for corresponding key
    var keyPairs = [49,50,51,52,53,54,55,56, 57, 48, 189,187,
                    81,87,69,82,84,89,85,73, 79, 80, 219,221,
                    65,83,68,70,71,72,74,75, 76, 186,222,13,
                    90,88,67,86,66,78,77,188,190,191,16, -1,
                    37,39,38,40];
    
    
    // returns new midi workspace
    this.init = function(editor, vw, vh, ho, dc){
        return new MIDI_Workspace(editor, vw, vh, ho, dc);   
    }
    
    /**
     * MIDI workspace, draws all midi editor objects and makes calls to note handler
     * editor-html element where input event calls will be triggered on
     * vw-view width and width of midi workspace
     * vh-view heigh
     * ho-height offset (height of header)
     * dc-parent class where draw calls can be made from
     *
     */
    var MIDI_Workspace = function(editor, vw, vh, ho, dc){
        this.width = vw;
        this.height = vh-ho;
        this.heightOffset = ho;
        this.drawClass = dc;
        
        // Beats per minute
        this.BPM = 140;
        // zoom level/resolution
        this.ZoomLevel = 0;
        // beats per section, based on resolutions
        this.BeatsPerSection = resolutions[this.ZoomLevel+5];
        // beats to pixels, multiply beats to get pixels, used to convert
        this.BeatsToPixels = PixelsPerSection/this.BeatsPerSection;
        // x offset of editor window from scrolling
        this.horizontalOffset = 0;
        // y offset of editor window from scrolling
        this.verticalOffset = 0;
        // beat of where the scrub bar is at
        this.scrubBarAt = 0;
        // scrolling by dragging to the edge
        this.edgeScroll = false;
        // interval to update edge scrolling
        this.scrollInterval = null;
        // max width of editor in pixels, max horizontal scroll
        this.maxWidth = this.width;
        // create new note handler and pass in editor dimensions, constants, and reference to this
        this.noteHandler = Note_Handler.init(editor, keySize, this.heightOffset+scrubBarHeight, this.width-keySize, this.height-scrubBarHeight-scrollBarWidth, PixelsPerSection, keyPairs.length, this);
        
        // add listener to editor for input event, trigger this objects input method and pass event data
        var thisObj = this;
        editor.addEventListener('InputEvent', function (e) {thisObj.generalInput(e);}, false);
        
        this.isRecording = false;
        this.isPlaying = false;
        
        this.header = Editor_Header.init(editor, this.width, this.horizontalOffset, this);
        
        console.log("New MIDI Workspace created");
    }
    
    // whenve there is some input from mouse or keyboard
    MIDI_Workspace.prototype.generalInput = function(e){
        
        // if scrolling and mouse in MIDI workspace, scroll canvas and consume the scroll
        if(e.detail.scrollConsumes > 0 && e.detail.mouseY > this.heightOffset){
            this.canvasScroll(e.detail.deltaX, e.detail.deltaY);
            e.detail.scrollConsumes--;
        }
        
        // if mouse down
        if(e.detail.mouseDown){
            // adjust scrubbing bar
            if(e.detail.mouseY > this.heightOffset && e.detail.mouseY < this.heightOffset+scrubBarHeight)
                this.scrubBarAt = Math.max(0,(e.detail.mouseX-this.horizontalOffset-keySize)/this.BeatsToPixels);
            
            // scroll bar drag
            if(e.detail.mouseY > this.height+this.heightOffset-scrollBarWidth && e.detail.mouseX > keySize){
                this.canvasScroll(e.detail.deltaX*(this.maxWidth/this.BeatsPerSection)/this.width,0);
            }
            
            // scrolling edge drag
            this.checkEdgeScroll(e.detail.mouseX, e.detail.mouseY, e.detail.deltaX, e.detail.deltaY);
        }
        // if mouse not down, cancel edge scrolling if it was happening
        else{
            if(this.scrollInterval != null)
                clearInterval(this.scrollInterval);
            this.edgeScroll = false;
        }
    }
    
    // check if mouse dragging on end and automatically scroll in that direction
    MIDI_Workspace.prototype.checkEdgeScroll = function(mx, my, dx, dy){
        // if mouse is in one of the corners and the direction of the mouse 
        // is into that corner (prevents scrolling when selecting a note in one of the corners and moving it the other way)
        if((mx < keySize*2 && dx < 0) || (mx > this.width-keySize && dx > 0) || ((my < this.height+this.heightOffset-scrollBarWidth && my > this.height+this.heightOffset-scrollBarWidth-keySize) && dy > 0) || ((my > this.heightOffset+scrubBarHeight && my < this.heightOffset+scrubBarHeight+keySize) && dy < 0)){
            if(!this.edgeScroll){
                this.edgeScroll = true;
                var thisObj = this;
                var velocity = [2];
                // set velocity based on mouse position
                if(mx < keySize*2)
                    velocity = [-scrollVelocity,0];
                else if(mx > this.width-keySize)
                    velocity = [scrollVelocity,0];
                else if(my < this.height+this.heightOffset-scrollBarWidth && my > this.height+this.heightOffset-scrollBarWidth-keySize)
                    velocity = [0,scrollVelocity];
                else if(my > this.heightOffset+scrubBarHeight && my < this.heightOffset+scrubBarHeight+keySize)
                    velocity = [0,-scrollVelocity];
                    
                // scroll by scroll velocity every 100ms until mouse is lifted up
                // or the mouse is out of a corner
                this.scrollInterval = setInterval(function(){
                    thisObj.canvasScroll(velocity[0],velocity[1]);
                    thisObj.drawClass.draw();
                },100);
            }
        }
        // if mouse out of the corner, stop autoscrolling
        else{
           if(this.scrollInterval != null)
                clearInterval(this.scrollInterval);
            this.edgeScroll = false; 
        }
    }
    
    // change horizontal and vertical offsets by dx and dy respectively
    // make sure that horizontal and vertical offsets are within their bounds
    MIDI_Workspace.prototype.canvasScroll = function(dx,dy){
        this.horizontalOffset-=dx;
        this.verticalOffset-=dy;
        this.verticalOffset = Math.max(this.verticalOffset, -keys.length*keySize+this.height-scrubBarHeight-borderWidth-scrollBarWidth);
        this.verticalOffset = Math.min(this.verticalOffset, 0);
        this.horizontalOffset = Math.min(this.horizontalOffset, 0);
        this.horizontalOffset = Math.max(this.horizontalOffset, Math.min(-(this.maxWidth/this.BeatsPerSection)+this.width,0));
        
        // call scroll in note handler to move selected notes and update visible notes
        this.noteHandler.scroll(this.horizontalOffset, this.verticalOffset);
    }
    
    // window resize, update width and height, make sure offsets are still in bounds, and resize note handler
    MIDI_Workspace.prototype.windowResize = function(width, height){
        this.width = width;
        this.height = height-this.heightOffset;
        this.canvasScroll(0,0);
        this.noteHandler.windowResize(this.width-keySize, this.height-scrubBarHeight-scrollBarWidth);
        this.header.windowResize();
    }
    
    // draw all elements
    MIDI_Workspace.prototype.draw = function(ctx){
        // console.log("Drawing Workspace");
        
        // draw vertical guide lines
        var numVertical = Math.ceil(this.width/PixelsPerSection)+1;
        ctx.strokeStyle = "rgb(90,70,70)";
        ctx.lineWidth = 1;
        for(var i = 0; i < numVertical; i++){
            ctx.beginPath();
            ctx.moveTo(i*PixelsPerSection+keySize+this.horizontalOffset%PixelsPerSection,this.heightOffset);
            ctx.lineTo(i*PixelsPerSection+keySize+this.horizontalOffset%PixelsPerSection,this.height+this.heightOffset);
            ctx.stroke();
        }
        
        // draw notes
        this.noteHandler.draw(ctx);
        
        // draw part of scrub bar on guide lines (prevents order of visibility problems)
        var scrubBarCenter = this.scrubBarAt*this.BeatsToPixels+this.horizontalOffset+keySize;
        ctx.strokeStyle = "rgb(0,0,220)";
        ctx.beginPath();
        ctx.moveTo(scrubBarCenter,this.heightOffset+scrubBarHeight);
        ctx.lineTo(scrubBarCenter,this.heightOffset+this.height);
        ctx.stroke();
    
        // draw keys
        ctx.fillStyle = "rgb(240,240,240)";
        ctx.fillRect(0,this.heightOffset,keySize,this.height);
        ctx.fillStyle = "black";
        for(var i = 1; i <= keys.length; i++){
            var drawY = this.heightOffset+scrubBarHeight+i*keySize-6+this.verticalOffset;
            if(drawY > this.heightOffset+scrubBarHeight && drawY <= this.height+this.heightOffset+keySize)
                ctx.fillText(keys[i-1], 8, this.heightOffset+scrubBarHeight+i*keySize-6+this.verticalOffset);
        }
        
        // draw horizontal guide lines, go all the way across
        var numHorizontal = Math.ceil(this.height/keySize);
        ctx.strokeStyle = "rgb(90,70,70)";
        for(var i = 1; i <= numHorizontal; i++){
            ctx.beginPath();
            ctx.moveTo(0,this.heightOffset+scrubBarHeight+i*keySize+this.verticalOffset%keySize);
            ctx.lineTo(this.width,this.heightOffset+scrubBarHeight+i*keySize+this.verticalOffset%keySize);
            ctx.stroke();
        }
        
        // draw scrubbing bar
        ctx.fillStyle = "rgb(210,210,210)";
        ctx.fillRect(0,this.heightOffset,this.width,scrubBarHeight);
        
        // scrub bar part of vertical guide lines
        ctx.fillStyle = "black";
        // each one is a section
        for(var i = 0; i < numVertical; i++){
            var xPos = i*PixelsPerSection+keySize+this.horizontalOffset%PixelsPerSection;
            ctx.beginPath();
            ctx.moveTo(xPos,this.heightOffset);
            ctx.lineTo(xPos,this.heightOffset+scrubBarHeight);
            ctx.stroke();
            // draw 3 small lines in between
            for(var j = 1; j <= 3; j++){
                ctx.beginPath();
                ctx.moveTo(xPos+j*PixelsPerSection/4,this.heightOffset+scrubBarHeight-4+4*(j%2-1));
                ctx.lineTo(xPos+j*PixelsPerSection/4,this.heightOffset+scrubBarHeight);
                ctx.stroke();
            }
            // set number by adding horizontal offset converted to beats
            var textVal = i*this.BeatsPerSection+Math.floor(this.horizontalOffset*-1/PixelsPerSection)*this.BeatsPerSection;
            // only show whole numbers
            if(textVal == Math.round(textVal))
                ctx.fillText(textVal+"",xPos+2,this.heightOffset+scrubBarHeight-scrubBarPadding+borderWidth);
        }
        // scrub bar
        ctx.fillStyle = "rgb(0,0,220)";
        ctx.strokeStyle = "rgb(0,0,220)";
        // scrub bar pointer
        ctx.beginPath();
        ctx.moveTo(scrubBarCenter-scrubBarSize*.6,this.heightOffset+scrubBarPadding+borderWidth);
        ctx.lineTo(scrubBarCenter+scrubBarSize*.6,this.heightOffset+scrubBarPadding+borderWidth);
        ctx.lineTo(scrubBarCenter,this.heightOffset+borderWidth+scrubBarSize+scrubBarPadding);
        ctx.closePath();
        ctx.fill();
        // small part of scrub bar line inside scrub bar
        ctx.beginPath();
        ctx.moveTo(scrubBarCenter,this.heightOffset+scrubBarPadding+borderWidth);
        ctx.lineTo(scrubBarCenter,this.heightOffset+scrubBarHeight);
        ctx.stroke();
        
        // draw horizontal scroll
        ctx.fillStyle = "rgb(100,100,100)";
        ctx.fillRect(keySize,this.height+this.heightOffset-scrollBarWidth,this.width-keySize,scrollBarWidth);
        ctx.fillStyle = "rgb(200,200,200)";
        ctx.fillRect(keySize+2+this.width/(this.maxWidth/this.BeatsPerSection)*-this.horizontalOffset,this.height+this.heightOffset-scrollBarWidth+2,this.width*this.width/(this.maxWidth/this.BeatsPerSection)-keySize-4-borderWidth,scrollBarWidth-4-borderWidth);
        
        // draw border
        ctx.lineWidth = borderWidth;
        ctx.strokeStyle = "rgb(170,170,170)";
        ctx.strokeRect(borderWidth/2,this.heightOffset+borderWidth/2,this.width-borderWidth,this.height-borderWidth);
        
        // draw header
        this.header.draw(ctx);
    }
    
    // set max width of workspace in pixels
    MIDI_Workspace.prototype.setMaxWidth = function(m){
        this.maxWidth = m+this.width;
    }
    
    // TODO: add functionality
    // if a button is pressed, play, pause, stop, or record midi based on which button
    MIDI_Workspace.prototype.buttonPress = function(b){
        if(b.text == "Record"){
            if(!this.isPlaying){
                this.isRecording = !this.isRecording;
                this.header.resetButtons();
                b.isDown = this.isRecording;
                if(this.isRecording)
                    this.noteHandler.startRecording(this.BPM, this.scrubBarAt);
                else
                    this.scrubBarAt = this.noteHandler.stopRecording();
            }
        }
        else if(b.text == "Play"){
            if(!this.isRecording && !this.isPlaying){
                this.isPlaying = true;
                this.header.resetButtons();
                this.noteHandler.startPlaying(this.BPM, this.scrubBarAt);
                b.isDown = true;
            }
        }
        else if(b.text == "Pause"){
            if(this.isPlaying){
                this.isPlaying = false;
                this.header.resetButtons();
                this.noteHandler.stopPlaying();
                b.isDown = true;
            }
        }
        else if(b.text == "Stop"){
            if(this.isRecording)
                this.scrubBarAt = this.noteHandler.stopRecording();
            else
                this.scrubBarAt = 0;
            if(this.isPlaying)
                this.noteHandler.stopPlaying();
            this.isPlaying = false;
            this.isRecording = false;
            this.noteHandler.beatAt = this.scrubBarAt;
            this.header.resetButtons();
            b.isDown = true;
        }
    }
    
    // update slider value in midi workspace
    MIDI_Workspace.prototype.sliderChange = function(t,v){
        if(t == "Zoom"){
            this.ZoomLevel = v-6;
            this.BeatsPerSection = resolutions[this.ZoomLevel+5];
            this.BeatsToPixels = PixelsPerSection/this.BeatsPerSection;
            this.noteHandler.changeResolution(this.BeatsPerSection);
            this.canvasScroll(0,0);
        }
        else if(t == "BPM")
            this.BPM = v;
    }
    
    MIDI_Workspace.prototype.redrawAll = function(){
        if(this.isPlaying || this.isRecording)
            this.scrubBarAt = this.noteHandler.beatAt;
        this.drawClass.draw();
    }
    
    // is header ready
    MIDI_Workspace.prototype.isReady = function(){
        return this.header.ready();
    }
    
    MIDI_Workspace.prototype.recordKeyDown = function(kc){
        if(this.isRecording){
            var noteInd = keyPairs.indexOf(kc);
            if(noteInd != -1)
                this.noteHandler.recordNoteDown(noteInd);
        }
    }
    
    MIDI_Workspace.prototype.recordKeyUp = function(kc){
        if(this.isRecording){
            var noteInd = keyPairs.indexOf(kc);
            if(noteInd != -1)
                this.noteHandler.recordNoteUp(noteInd);
        }
    }
    
    MIDI_Workspace.prototype.playKeyDown = function(noteInd){
        this.drawClass.midiKeyDown(keyPairs[noteInd]);
    }
    
    MIDI_Workspace.prototype.playKeyUp = function(noteInd){
        this.drawClass.midiKeyUp(keyPairs[noteInd]);
    }
}