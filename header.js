// Setup namespace
var Editor_Header = new function() {
    
    // width of border around elements
    var borderWidth = 4;
    
    // items start x pos
    var itemLeftPadding = 30;
    // spacing between elements
    var buttonMargin = 90;
    // height and width of slider
    var sliderSize = 30;
    
    // return new header
    this.init = function(editor, vw, h, m){
        return new Header(editor, vw, h, m);
    }
    
    /**
     * constructor, this is the header that contains the buttons and sliders
     * editor-html object for editor where input event callw will be triggered
     * vw-view width and width of editor
     * h-height of editor
     * m-reference to midi editor for button calls
     * 
     */
    var Header = function(editor, vw, h, m){
        console.log("New Header Created");
        this.viewWidth = vw;
        this.height = h;
        
        // create all items
        this.items = [];
        this.items.push(new Button(itemLeftPadding,10,"Play","newIcons/play.png",m));
        this.items.push(new Button(itemLeftPadding+buttonMargin,10,"Pause","newIcons/pause.png",m));
        this.items.push(new Button(itemLeftPadding+buttonMargin*2,10,"Stop","newIcons/stop.png",m));
        this.items.push(new Button(itemLeftPadding+buttonMargin*3,10,"Record","newIcons/record.png",m));
        this.items.push(new Button(itemLeftPadding+buttonMargin*4,10,"New","newIcons/record.png",m));
        this.items.push(new Button(itemLeftPadding+buttonMargin*5,10,"Save","newIcons/record.png",m));
        this.items.push(new Button(itemLeftPadding+buttonMargin*6,10,"Load","newIcons/record.png",m));
        this.items.push(new Slider(itemLeftPadding+buttonMargin*7,30,3,9,6,"Zoom",m));
        // doubles as playback speed
        this.items.push(new Slider(itemLeftPadding+buttonMargin*8,30,40,200,140,"BPM",m));
        
        // add listener for input events and use it to call a local object method
        var thisObj = this;
        editor.addEventListener('InputEvent', function (e) {thisObj.generalInput(e);}, false);
    }
    
    // handels inputs
    Header.prototype.generalInput = function(e){
        // check each item for mouse over, so that they can display their name and value
        for (var item in this.items)
            this.items[item].checkMouseOver(e.detail.mouseX, e.detail.mouseY);
        
        // if mouse is down, check if on any item and call button press or adjust slider
        if(e.detail.mouseDown)
            for (var item in this.items)
                this.items[item].checkMouseDown(e.detail);
                
        // if scrolling and on slider, move slider by horizontal scroll amount
        if(e.detail.scrollConsumes > 0){
            e.detail.scrollConsumes--;
            for (var item in this.items){
                if(this.items[item] instanceof Slider)
                    this.items[item].smallInc(Math.floor(e.detail.deltaX));
            }
        }
    }
    
    // window resized, just resize width since height is constant
    Header.prototype.windowResize = function(width, height){
        this.viewWidth = width;
    }
    
    // draw method
    Header.prototype.draw = function(ctx){
        // draw border
        ctx.strokeStyle = "rgb(200,200,200)";
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(borderWidth/2,borderWidth/2,this.viewWidth-borderWidth,this.height-borderWidth);
        
        // call draw on all items
        for (var item in this.items)
            this.items[item].draw(ctx);
    }
    
    // called from midi workspace, reset background of all buttons
    Header.prototype.resetButtons = function(){
        for(var item in this.items)
            if(this.items[item] instanceof Button)
                this.items[item].isDown = false;
    }
    
    // check if all items are ready
    // mainly, check if button icons loaded
    Header.prototype.isReady = function(){
        for (var item in this.items)
            if(!this.items[item].isReady())
                return false;
        return true;
    }
    
    /**
     * A simple slider
     * x-x position of top left corner
     * y-y position of top left corner
     * min-minumum value
     * max-maximum value
     * d-initial value
     * t-text/name
     * m-midi editor to call function and send values
     *
     */
    var Slider = function(x,y,min,max,d,t,m){
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 20;
        this.min = min;
        this.max = max;
        this.value = d;
        this.text = t;
        this.mouseOver = false;
        this.midiWorkspace = m;
    }
    
    // draw method
    Slider.prototype.draw = function(ctx){
        // draw bar
        ctx.fillStyle = "rgb(240,240,240)";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // draw slider triangle with point at slider center
        ctx.fillStyle = "rgb(180,180,180)";
        var sliderCenter = ((this.value-this.min)/(this.max-this.min))*this.width+this.x;
        ctx.beginPath();
        ctx.moveTo(sliderCenter-sliderSize/2,this.y-(sliderSize-this.height)/2);
        ctx.lineTo(sliderCenter+sliderSize/2,this.y-(sliderSize-this.height)/2);
        ctx.lineTo(sliderCenter,this.y+this.height+(sliderSize-this.height)/2);
        ctx.closePath();
        ctx.fill();
        
        // if mouse is over slider, display name and value
        if(this.mouseOver){
            ctx.fillStyle = "rgb(230,230,30)";
            ctx.fillRect(this.x+this.width/2+5,this.y+this.height/2+10,ctx.measureText(this.text+": "+this.value).width+10,20);
            ctx.fillStyle = "black";
            ctx.fillText(this.text+": "+this.value,this.x+this.width/2+10,this.y+this.height/2+26);
        }
    }
    
    // slider is always ready
    Slider.prototype.isReady = function(){
        return true;
    }
    
    // if mx and my are in slider, set mouseOver to true to display name and value
    Slider.prototype.checkMouseOver = function(mx,my){
        if(mx > this.x && mx < this.x+this.width && my > this.y && my < this.y+this.height)
            this.mouseOver = true;
        else
            this.mouseOver = false;
    }
    
    // if the mouse is over the slider (checkMouseOver method called first),
    // then set the value by mapping the mouse x position to the slider min and max
    Slider.prototype.checkMouseDown = function(e){
        if(this.mouseOver)
            this.setValue(Math.round(map(e.mouseX,this.x,this.x+this.width,this.min,this.max)));
    }
    
    // used to increment the slider by the horizontal scroll velocity
    Slider.prototype.smallInc = function(dx){
        if(this.mouseOver)
            this.setValue(Math.max(Math.min(this.value+dx,this.max),this.min));
    }
    
    // set the value and call midi editor function to 
    // set the corrensponding value in midi editor
    Slider.prototype.setValue = function(v){
        this.value = v;
        this.midiWorkspace.sliderChange(this.text,this.value);
    }
    
    /**
     * button with an icon
     * x-x position of top left corner
     * y-y position of top left corner
     * t-text/name of button
     * i-icon image source
     * m-midi editor to make calls to
     *
     */
    var Button = function(x,y,t,i,m){
        this.x = x;
        this.y = y;
        this.text = t;
        this.midiWorkspace = m;
        
        // standard width and height
        this.width = 60;
        this.height = 60;
        this.icon = new Image(this.width,this.height);
        // image not loaded yet
        this.ready = false;
        this.mouseOver = false;
        
        // add listener to icon for load
        // this is what the editor waits for before it intially draws
        var thisObj = this;
        this.icon.addEventListener("load", function() {
          thisObj.ready = true;
        }, false);
        this.icon.src = i;
        
        // is the button down, recolor to give user feedback
        this.isDown = false;
    }
    
    // has the icon image loaded
    Button.prototype.isReady = function(){
        return this.ready;
    }
    
    Button.prototype.draw = function(ctx){
        // draw background color
        if(this.isDown)
            ctx.fillStyle = "rgb(100,140,200)";
        else
            ctx.fillStyle = "rgb(230,230,230)";
        ctx.beginPath();
        ctx.ellipse(this.x+this.width/2, this.y+this.height/2, this.width/2, this.height/2, 0, 0, 2*Math.PI);
        ctx.fill();
        
        // draw icon
        ctx.drawImage(this.icon,this.x,this.y,this.width,this.height);
        
        // if mouse is over button, show name and value
        if(this.mouseOver){
            ctx.fillStyle = "rgb(230,230,30)";
            ctx.fillRect(this.x+this.width/2+5,this.y+this.height/2+10,ctx.measureText(this.text).width+10,20);
            ctx.fillStyle = "black";
            ctx.fillText(this.text,this.x+this.width/2+10,this.y+this.height/2+26);
        }
    }
    
    // check if mouse is over button
    Button.prototype.checkMouseOver = function(mx,my){
        if(mx > this.x && mx < this.x+this.width && my > this.y && my < this.y+this.height)
            this.mouseOver = true;
        else
            this.mouseOver = false;
    }
    
    // if mouse is over button and mouse is down, call button pressed on midi workspace
    Button.prototype.checkMouseDown = function(e){
        if(this.mouseOver)
            this.midiWorkspace.buttonPress(this);
    }
    
    // change the state of the button, true-down, false-up
    Button.prototype.changeState = function(s){
        this.state = s;
    }
    
    // map function to map a value x between in_min and in_max 
    // to the corresponding value between out_min and out_max
    var map = function(x, in_min, in_max, out_min, out_max){
      return (x-in_min)*(out_max-out_min)/(in_max-in_min)+out_min;
    }
}