//Setup Namespace
var MIDI = new function() {
    
    this.init = function(editor, vw, vh, ho, dc){
        return new MIDI_Workspace(editor, vw, vh, ho, dc);   
    }
    
    var borderWidth = 4;
    var scrubBarHeight = 30;
    var keySize = 24;
    var scrubBarSize = 10;
    var scrubBarPadding = 16;
    
    var PixelsPerSection = 70;
    var resolutions = [1/32,1/16,1/8,1/4,1/2,1,2,4,8,16,32];
    
    var scrollVelocity = 24;
    
    var scrollBarWidth = 26;
    
    // available keys for editor
    var keys = ["1","2","3","4","5","6","7","8","9","0","-","=",
                "Q","W","E","R","T","Y","U","I","O","P","[","]",
                "A","S","D","F","G","H","J","K","L",";","'","\\n",
                "Z","X","C","V","B","N","M",",",".","/","\\s"];
                
    // keycodes for corresponding key
    var keyPairs = [49,50,51,52,53,54,55,56,57,48,189,187,
                    81,87,69,82,84,89,85,73,79,80,219,221,
                    65,83,68,70,71,72,74,75,76,186,222,13,
                    90,88,67,86,66,78,77,188,190,191,16];
    
    var MIDI_Workspace = function(editor, vw, vh, ho, dc){
        this.width = vw;
        this.height = vh-ho;
        this.heightOffset = ho;
        
        this.BPM = 140;
        this.ZoomLevel = 0;
        this.BeatsPerSection = resolutions[this.ZoomLevel+5];
        this.BeatsToPixels = PixelsPerSection/this.BeatsPerSection;
        this.horizontalOffset = 0;
        this.verticalOffset = 0;
        this.scrubBarAt = 0;
        this.edgeScroll = false;
        this.scrollInterval = null;
        this.drawClass = dc;
        this.maxWidth = this.width;
        this.noteHandler = Note_Space.init(editor, keySize, this.heightOffset+scrubBarHeight, this.width-keySize, this.height-scrubBarHeight-scrollBarWidth, PixelsPerSection, this);
        
        var thisObj = this;
        editor.addEventListener('InputEvent', function (e) {thisObj.generalInput(e);}, false);
        
        console.log("New MIDI Workspace created");
    }
    
    MIDI_Workspace.prototype.generalInput = function(e){
        if(e.detail.scrollConsumes > 0 && e.detail.mouseY > this.heightOffset){
            this.canvasScroll(e.detail.deltaX, e.detail.deltaY);
            e.detail.scrollConsumes--;
        }
        if(e.detail.mouseDown){
            // scrubbing bar
            if(e.detail.mouseY > this.heightOffset && e.detail.mouseY < this.heightOffset+scrubBarHeight)
                this.scrubBarAt = Math.max(0,(e.detail.mouseX-this.horizontalOffset-keySize)/this.BeatsToPixels);
            
            // scroll bar drag
            if(e.detail.mouseY > this.height+this.heightOffset-scrollBarWidth && e.detail.mouseX > keySize){
                this.canvasScroll(e.detail.deltaX*(this.maxWidth/this.BeatsPerSection)/this.width,0);
            }
            
            // scrolling edge drag
            this.checkEdgeScroll(e.detail.mouseX, e.detail.mouseY);
        }
        else{
            if(this.scrollInterval != null)
                clearInterval(this.scrollInterval);
            this.edgeScroll = false;
        }
    }
    
    MIDI_Workspace.prototype.checkEdgeScroll = function(mx, my){
        if(mx < keySize*2 || mx > this.width-keySize || (my < this.height+this.heightOffset-scrollBarWidth && my > this.height+this.heightOffset-scrollBarWidth-keySize) || (my > this.heightOffset+scrubBarHeight && my < this.heightOffset+scrubBarHeight+keySize)){
            if(!this.edgeScroll){
                this.edgeScroll = true;
                var thisObj = this;
                var velocity = [2];
                if(mx < keySize*2)
                    velocity = [-scrollVelocity,0];
                else if(mx > this.width-keySize)
                    velocity = [scrollVelocity,0];
                else if(my < this.height+this.heightOffset-scrollBarWidth && my > this.height+this.heightOffset-scrollBarWidth-keySize)
                    velocity = [0,scrollVelocity];
                else if(my > this.heightOffset+scrubBarHeight && my < this.heightOffset+scrubBarHeight+keySize)
                    velocity = [0,-scrollVelocity];
                this.scrollInterval = setInterval(function(){
                    thisObj.canvasScroll(velocity[0],velocity[1]);
                    thisObj.drawClass.draw();
                },100);
            }
        }
        else{
           if(this.scrollInterval != null)
                clearInterval(this.scrollInterval);
            this.edgeScroll = false; 
        }
    }
    
    MIDI_Workspace.prototype.canvasScroll = function(dx,dy){
        this.horizontalOffset-=dx;
        this.verticalOffset-=dy;
        this.verticalOffset = Math.max(this.verticalOffset, -keys.length*keySize+this.height-scrubBarHeight-borderWidth-scrollBarWidth);
        this.verticalOffset = Math.min(this.verticalOffset, 0);
        this.horizontalOffset = Math.min(this.horizontalOffset, 0);
        this.horizontalOffset = Math.max(this.horizontalOffset, Math.min(-(this.maxWidth/this.BeatsPerSection)+this.width,0));
        this.noteHandler.scroll(this.horizontalOffset, this.verticalOffset);
    }
    
    MIDI_Workspace.prototype.windowResize = function(width, height){
        this.width = width;
        this.height = height-this.heightOffset;
        this.canvasScroll(0,0);
        this.noteHandler.windowResize(this.width-keySize, this.height-scrubBarHeight-scrollBarWidth);
    }
    
    MIDI_Workspace.prototype.draw = function(ctx){
        // console.log("Drawing Workspace");
        
        // draw guide lines
        // vertical guide lines
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
        
        // scrub bar bottom
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
        // horizontal guide lines
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
        // partial guide lines
        ctx.fillStyle = "black";
        for(var i = 0; i < numVertical; i++){
            var xPos = i*PixelsPerSection+keySize+this.horizontalOffset%PixelsPerSection;
            ctx.beginPath();
            ctx.moveTo(xPos,this.heightOffset);
            ctx.lineTo(xPos,this.heightOffset+scrubBarHeight);
            ctx.stroke();
            for(var j = 1; j <= 3; j++){
                ctx.beginPath();
                ctx.moveTo(xPos+j*PixelsPerSection/4,this.heightOffset+scrubBarHeight-4+4*(j%2-1));
                ctx.lineTo(xPos+j*PixelsPerSection/4,this.heightOffset+scrubBarHeight);
                ctx.stroke();
            }
            var textVal = i*this.BeatsPerSection+Math.floor(this.horizontalOffset*-1/PixelsPerSection)*this.BeatsPerSection;
            if(textVal == Math.round(textVal))
                ctx.fillText(textVal+"",xPos+2,this.heightOffset+scrubBarHeight-scrubBarPadding+borderWidth);
        }
        // scrubBar
        ctx.fillStyle = "rgb(0,0,220)";
        ctx.strokeStyle = "rgb(0,0,220)";
        ctx.beginPath();
        ctx.moveTo(scrubBarCenter-scrubBarSize*.6,this.heightOffset+scrubBarPadding+borderWidth);
        ctx.lineTo(scrubBarCenter+scrubBarSize*.6,this.heightOffset+scrubBarPadding+borderWidth);
        ctx.lineTo(scrubBarCenter,this.heightOffset+borderWidth+scrubBarSize+scrubBarPadding);
        ctx.closePath();
        ctx.fill();
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
    
    }
    
    MIDI_Workspace.prototype.setMaxWidth = function(m){
        this.maxWidth = m+this.width;
        console.log("new max");
    }
    
    MIDI_Workspace.prototype.buttonPress = function(){
        
    }
    
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
    
    MIDI_Workspace.prototype.isReady = function(){
        return true;
    }
}