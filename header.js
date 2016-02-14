// Setup namespace
var Editor_Header = new function() {
    
    var borderWidth = 4;
    
    var itemLeftPadding = 40;
    var buttonMargin = 120;
    var sliderSize = 30;
    
    this.init = function(editor, vw, h, m){
        return new Header(editor, vw, h, m);
    }
    
    //editor header
    var Header = function(editor, vw, h, m){
        console.log("New Header Created");
        this.viewWidth = vw;
        this.height = h;
        this.items = [];
        this.items.push(new Button(itemLeftPadding,10,"Play","icons/play.png",m));
        this.items.push(new Button(itemLeftPadding+buttonMargin,10,"Pause","icons/pause.png",m));
        this.items.push(new Button(itemLeftPadding+buttonMargin*2,10,"Stop","icons/stop.png",m));
        this.items.push(new Slider(itemLeftPadding+buttonMargin*3,30,3,9,6,"Zoom",m));
        this.items.push(new Slider(itemLeftPadding+buttonMargin*4,30,60,180,140,"BPM",m));
        //this.items.push(new Slider(itemLeftPadding+buttonMargin*5,30,10,150,100,"Playback Speed",m));
        
        var thisObj = this;
        editor.addEventListener('InputEvent', function (e) {thisObj.generalInput(e);}, false);
    }
    
    Header.prototype.generalInput = function(e){
        for (var item in this.items)
            this.items[item].checkMouseOver(e.detail.mouseX, e.detail.mouseY);
        if(e.detail.mouseDown)
            for (var item in this.items)
                this.items[item].checkMouseDown(e.detail);
        if(e.detail.scrollConsumes > 0){
            e.detail.scrollConsumes--;
            for (var item in this.items){
                if(this.items[item] instanceof Slider)
                    this.items[item].smallInc(Math.floor(e.detail.deltaX));
            }
        }
    }
    
    Header.prototype.windowResize = function(width, height){
        this.viewWidth = width;
    }
    
    Header.prototype.draw = function(ctx){
        // console.log("Drawing header");
        ctx.strokeStyle = "rgb(200,200,200)";
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(borderWidth/2,borderWidth/2,this.viewWidth-borderWidth,this.height-borderWidth);
        
        for (var item in this.items)
            this.items[item].draw(ctx);
    }
    
    Header.prototype.isReady = function(){
        for (var item in this.items)
            if(!this.items[item].isReady())
                return false;
        return true;
    }
    
    var Slider = function(x,y,min,max,d,t,m){
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 20;
        this.min = min;
        this.max = max;
        this.value = d;
        this.text = t;
        this.mouseOver = false;
        this.midiWorkspace = m;
    }
    
    Slider.prototype.draw = function(ctx){
        ctx.fillStyle = "rgb(220,220,220)";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "rgb(160,160,160)";
        var sliderCenter = ((this.value-this.min)/(this.max-this.min))*this.width+this.x;
        ctx.beginPath();
        ctx.moveTo(sliderCenter-sliderSize/2,this.y-(sliderSize-this.height)/2);
        ctx.lineTo(sliderCenter+sliderSize/2,this.y-(sliderSize-this.height)/2);
        ctx.lineTo(sliderCenter,this.y+this.height+(sliderSize-this.height)/2);
        ctx.closePath();
        ctx.fill();
        
        if(this.mouseOver){
            ctx.fillStyle = "rgb(230,230,30)";
            ctx.fillRect(this.x+this.width/2+5,this.y+this.height/2+10,ctx.measureText(this.text+": "+this.value).width+10,20);
            ctx.fillStyle = "black";
            ctx.fillText(this.text+": "+this.value,this.x+this.width/2+10,this.y+this.height/2+26);
        }
    }
    
    Slider.prototype.isReady = function(){
        return true;
    }
    
    Slider.prototype.checkMouseOver = function(mx,my){
        if(mx > this.x && mx < this.x+this.width && my > this.y && my < this.y+this.height)
            this.mouseOver = true;
        else
            this.mouseOver = false;
    }
    
    Slider.prototype.checkMouseDown = function(e){
        if(this.mouseOver)
            this.setValue(Math.round(map(e.mouseX,this.x,this.x+this.width,this.min,this.max)));
    }
    
    Slider.prototype.smallInc = function(dx){
        if(this.mouseOver)
            this.setValue(Math.max(Math.min(this.value+dx,this.max),this.min));
    }
    
    Slider.prototype.setValue = function(v){
        this.value = v;
        this.midiWorkspace.sliderChange(this.text,this.value);
    }
    
    var Button = function(x,y,t,i,m){
        this.x = x;
        this.y = y;
        this.text = t;
        this.width = 60;
        this.height = 60;
        this.icon = new Image(this.width,this.height);
        this.ready = false;
        this.mouseOver = false;
        this.pressed = false;
        this.midiWorkspace = m;
        
        var thisObj = this;
        this.icon.addEventListener("load", function() {
          thisObj.ready = true;
        }, false);
        this.icon.src = i;
    }
    
    Button.prototype.isReady = function(){
        return this.ready;
    }
    
    Button.prototype.draw = function(ctx){
        ctx.drawImage(this.icon,this.x,this.y,this.width,this.height);
        
        if(this.mouseOver){
            ctx.fillStyle = "rgb(230,230,30)";
            ctx.fillRect(this.x+this.width/2+5,this.y+this.height/2+10,ctx.measureText(this.text).width+10,20);
            ctx.fillStyle = "black";
            ctx.fillText(this.text,this.x+this.width/2+10,this.y+this.height/2+26);
        }
    }
    
    Button.prototype.checkMouseOver = function(mx,my){
        if(mx > this.x && mx < this.x+this.width && my > this.y && my < this.y+this.height)
            this.mouseOver = true;
        else{
            this.mouseOver = false;
            this.mouseDown = false;
        }
    }
    
    Button.prototype.checkMouseDown = function(e){
        if(this.mouseOver)
            this.pressed = true;
    }
    
    var map = function(x, in_min, in_max, out_min, out_max){
      return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }
}