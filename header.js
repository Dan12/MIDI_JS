// Setup namespace
var Editor_Header = new function() {
    
    var borderWidth = 4;
    
    this.init = function(editor, vw, h){
        return new Header(editor, vw, h);
    }
    
    //editor header
    var Header = function(editor, vw, h){
        console.log("New Header Created");
        this.viewWidth = vw;
        this.height = h;
        var thisObj = this;
        editor.addEventListener('InputEvent', function (e) {}, false);
    }
    
    Header.prototype.windowResize = function(width, height){
        this.viewWidth = width;
    }
    
    Header.prototype.draw = function(ctx){
        // console.log("Drawing header");
        ctx.strokeStyle = "rgb(200,200,200)";
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(borderWidth/2,borderWidth/2,this.viewWidth-borderWidth,this.height-borderWidth);
    }
    
    var Slider = function(){
        
    }
    
    var Button = function(){
        
    }
}