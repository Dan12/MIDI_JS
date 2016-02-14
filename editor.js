// Setup editor namespace
// can have private and public methods/functions/classes
var MIDI_Editor = new function() {
    
    // editor height and width subtract from window dims
    var widthSub = 60;
    var heightSub = 160;
    
    // minimum width and height
    var minHeight = 200;
    var minWidth = 820;
    
    // height of header
    var headerHeight = 80;
    
    // init function for namespace
    // returns a new editor
    this.init = function(append_to){
        return new Editor(append_to);
    }
    
    // editor constructor
    // appends a new editor canvas to append_to and resizes it
    // initalize object variables
    var Editor = function(append_to){
        
        // create editor canvas
        $(append_to).append('<div class="editor_container"><canvas class="editor_canvas">Your browser does not support the HTML5 canvas tag.</canvas></div>');
        var editors = document.getElementsByClassName("editor_canvas");
        this.canvas = editors[editors.length-1];
        this.context = this.canvas.getContext("2d");
        
        // create empty items array
        this.items = [];
        
        // initialize Input Events object
        Input_Events.init(this.canvas);
        
        // set the dimensions
        this.setDimensions();
        
        // initialize a new midi workspace and a header
        var midiWorkspace = MIDI.init(this.canvas, this.width, this.height, headerHeight, this);
        this.items.push(midiWorkspace);
        this.items.push(Editor_Header.init(this.canvas, this.width, headerHeight, midiWorkspace));
        
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
        
        console.log("New editor created");
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
        
        for (var item in this.items)
            this.items[item].windowResize(this.width, this.height);
        this.draw();
    }
    
    // clears canvas and calls draw on all items
    Editor.prototype.draw = function(){
        var t0 = performance.now();
        this.context.clearRect(0,0,this.width, this.height);
        this.context.font = "16px arial";
        for (var item in this.items)
            this.items[item].draw(this.context);
        var t1 = performance.now();
        //console.log("Call took " + (t1 - t0) + " milliseconds.")
    }
    
    // is the editor ready (right now ask have all images loaded)
    Editor.prototype.isReady = function(){
        for (var item in this.items)
            if(!this.items[item].isReady())
                return false;
        return true;
    }
}