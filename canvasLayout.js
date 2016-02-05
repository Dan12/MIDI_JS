// Setup editor namespace
// can have private and public methods/functions/classes
var Canvas_Layout = new function() {
    
    // return a new CanvasLayout
    this.init = function(ctx){
        return new CanvasLayout(ctx);
    }
    
    // Canvas Layout Object to add some style to the canvas
    var CanvasLayout = function(ctx){
        this.ctx = ctx;
        console.log("New Canvas Layout");
    }
    
    // create a new container
    CanvasLayout.prototype.addContainer = function(horizontalScroll, verticalScroll){
        
    }
    
    // container object for CanvasLayout
    var Container = function(){
        
    }
}