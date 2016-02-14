// Setup editor namespace
// can have private and public methods/functions/classes
var MIDI_Editor = new function() {
    
    // editor height and width subtract from window dims
    var widthSub = 100;
    var heightSub = 160;
    
    // minimum width and height
    var minHeight = 200;
    var minWidth = 900;
    
    // height of header
    var headerHeight = 80;
    
    // init function for namespace
    // returns a new editor
    this.init = function(append_to, player){
        return new Editor(append_to, player);
    }
    
    /**
     * editor constructor
     * append_to-html element to append new editor canvas to
     * player-player object linked to editor, must have methods called midiKeyUp, midiKeyDown, and linkEditor
     *      and invokes editor methods recordKeyDown and recordKeyUp
     */
    var Editor = function(append_to, player){
        
        this.player = player;
        
        // create editor canvas
        $(append_to).append('<div class="editor_container"><canvas class="editor_canvas">Your browser does not support the HTML5 canvas tag.</canvas></div>');
        var editors = document.getElementsByClassName("editor_canvas");
        this.canvas = editors[editors.length-1];
        this.context = this.canvas.getContext("2d");
        
        // initialize Input Events object
        Input_Events.init(this.canvas);
        
        // set the dimensions
        this.setDimensions();
        
        // initialize a new midi workspace
        this.midiWorkspace = MIDI.init(this.canvas, this.width, this.height, headerHeight, this);
        
        // setup window resize function
        var thisObj = this;
        $(window).resize(function(){
            thisObj.setDimensions();
        });
        
        // add listener for input events, always redraw canvas
        this.canvas.addEventListener('InputEvent', function (e) {thisObj.draw();}, false);
        
        // check if images are loaded every 300ms
        var readyInterval = setInterval(function(){
            if(thisObj.isReady){
             thisObj.draw();
             clearInterval(readyInterval);
            }
        },300);

        // send instance of this editor to player to link them together
        this.player.linkEditor(this);
        
        console.log("New Editor created");
    }
    
    // sets dimensions of editor according to window size
    // and calls window resize on all items, then redraws
    Editor.prototype.setDimensions = function(){
        this.width = Math.max(window.innerWidth-widthSub, minWidth);
        this.height = Math.max(window.innerHeight-heightSub, minHeight);
        $(this.canvas).css({"width":this.width+"px","height":this.height+"px"});
        this.context.width = this.width;
        this.context.height = this.height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        if(this.midiWorkspace)
            this.midiWorkspace.windowResize(this.width, this.height);
        this.draw();
    }
    
    // clears canvas and draw midiworkspace
    Editor.prototype.draw = function(){
        var t0 = performance.now();
        this.context.clearRect(0,0,this.width, this.height);
        this.context.font = "16px arial";
        if(this.midiWorkspace)
            this.midiWorkspace.draw(this.context);
        var t1 = performance.now();
        //console.log("Call took " + (t1 - t0) + " milliseconds.")
    }
    
    // is the editor ready (right now ask have all images loaded)
    Editor.prototype.isReady = function(){
        return this.midiWorkspace.ready();
    }
    
    // pass along
    Editor.prototype.recordKeyDown = function(kc){
        this.midiWorkspace.recordKeyDown(kc);
    }
    
    Editor.prototype.recordKeyUp = function(kc){
        this.midiWorkspace.recordKeyUp(kc);
    }
    
    // pass along
    Editor.prototype.midiKeyDown = function(kc){
        this.player.midiKeyDown(kc);
    }
    
    Editor.prototype.midiKeyUp = function(kc){
        this.player.midiKeyUp(kc);
    }
}