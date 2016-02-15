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
    
    //0-pause,1-play,2-record,3-stop
    var images = [
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHEAAABxCAYAAADifkzQAAADrklEQVR42u3czUsVURjH8UubaH25oI1nZm71DwRRWUK08aatinYFvWjtyqRN0UKLwghfaF8tTOtf0BaK7sogCInWwl3XNsQmLRJf7s07r+c853wfGBBBzu+cz5yZM85LqWRBHfKDKMlWVf6vElVsHVb+alKwOBsjbcgsu3ThYnTzRt/mBqqBcFm3+X52FtC84UzLhFgLA9XTXYsk5Ax9/zt4AvfwhpgdwTx4lvRl/df7rcVTStVsPbc4cc50ZWHQoJ8/bejXAddWdROjY/bssK4vy8X3nWuqv3X18pUdK1i1BiCzstiwr1++AlASpGpvP8bsEwxZqVSOANh6nTp+wixIz/M6AYxfI0+emgMJYPLaWDNoHz8A09fgwIA+SACFL3YAzHdMww71obDGbvX1gyhxcjALhUMCKBwSQBAp3eMNoHBIAEFsqT4tLaV6xP7x8HCUVR9Ne8Q/dTtFBQWxefV210CUjpjKociQWxGTZMwSMcnf5T0+byYnQZSOmChj0StSEPeurpOdIEpHjJ2z6HAgZpxTx8U9iBm3CaIMxP+2qyMYiBlm1fV/UhAzPKSCKAuxYdu6QoGYUd7QDz6DKAOxads67xuCCKLTiKHvfzUiEIgZZQYRRBALrtmZme2ZNz7cCqIsxF3t636iDUQQQQRRPmK5XPZAFI4YesEYiMIR/2T498OjoSEQQQQRRBDTI3JOBBFEVqcgcp3If2xAFI/IXQwLEHUHAjF+7bqfCCJ39kE0DZGn3WQhhir4BmLJpudOlb8MonBEnaFAzDAvb0WBCKLuQ6nOYCBmnJV39kEEUfehVFc4EHPIyRelLEAs+tYUiHvXmdNd8TPylUWzEBNlBNEcxLdTU8kt+PKw8C8Pg2gG4vlzPenbKSJsvV5/MT46GiXd5ufmUmVL0/bGZuws1HnxT+Uw9kBagAikBYAgWgAIpEWIQFoAuLORu7fvACl1gjAb8x3Tqgq+2LfXOARY+HgCmb4e3n8QaR9HIJPX85FnkRHj57W1nQUyfk2MjUdGjdvBSuUokK3X1rv0Ro2X53mdQBq+iEkS8t30NJjSAEWGZUyA3Kv6r13fNg5hh1oTvfe5hmlN39cXPGXXIHu7a3buvK7Myl39VGrZ/k5aguncqUPX85sF4u1z9sQvBXNlZWWxUe6qUh+5hjIctFnG0A9+cCXcAqYJX25y+rCZB2geqIsLC0a8e+EsaLPt3uDg5mbySzNugSp/Ne0LMKAZWlvfbo6zhUrVbej/b3tawRq7/DAmAAAAAElFTkSuQmCC"
        ,"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHEAAABxCAYAAADifkzQAAAE30lEQVR42u2dTWgTQRTHU6+iIgYK+5VNVQRFra0VquIXFUVQ6cmiKELBi6JoWxVRiiDFix/4WUGx6slqFbS1oIhUq94UD4IVqade9OKhF4W6JofUWHfTTXaz+96b/4OBNNnuzHu/eW9mJzMviYQAsY3UjSor5RRT0qY1loDEI8XCKqXAygyhwWNjAtf76LETdZ0ZoL9Bp4BkDDRKLcQh5AozlFcbLdO8CnjMenhfb69HqDU/Ap4QXTJvT1EOIPSCktT1/CVSMenDRePmLXI6rOrTchfdZ8D7GMqN69d5dmQAZG6T/Ibu3rkLADmBNCorF8L7GINMJ5PzANC/vH3zhhZIW7erATC4V6IhAAmAyoIEwPCk5/796MdIAGQ+a82v6NnTp4BYPueYXp5KNK0BXsg8ygEgc5AAGJ2cO3P27/homN/DAaibh3I37Th1ChA5emOUXghPL4Pdow6jCNt/ZdOGjeFsvooTYrYc2LvPgTcGsH8cXoHd1t42sQxjf8n/3LBmbeQQs6/nzZkLmEGcKS7DudUJz8zzRs1oZwnRC+bQpyEH3khwhjhZvV+Hh5X1SjEQVQ6xvnVNaVozhfOAQWazUiGebG/3pyOVQ51BH03Ee6NhfZv0osFXg6wgZuXShYvivXJS3WYbqf64lQ+jfukhtqBOFJQOs37pZyHThvXB88NrnZ0iIHrB/DzE+/myYKek0FvL1YZbN7vEeGX7iRPuOmTzs0iGKC3EuradilJRfvmcX+pqah2OEDPl539vHm07rARE7s+Xrm2mokQc7di+rYldiAVEIePlP22kMqmhNkPOlbaWFoc8REo9j5IHUPdKQBQQYvM2GH8BRKYw/2nL+IaotesAsUiY/U/6HVIQya5EEJP3796RS6gLiExDLCCWEeai+QscQBSSwBYQGcme5uZYwiogClgQAMSQ4a1avsKJsw3jfwy8eIHnREYP/a4QsWLjLRfOn+exYgOI9MY9X+3C2ql/eHPTVSQ7V+ZlBb5PJDzu+bbVbE1rAsREYmRk5Cjbb/YphbG4j9TlytXLV0gDXLd6jfcem+whTpUgct2HWnCjlCr7TpfV1LLeRKw8RLE7wKnNDKOAt3H9erbnMZSDKO2Im69TUTifCIgkICp7UphCSA1a/0R4R1rbRAL0BZF79gwVfinV8yLbMEc5QVy1YqVSSYl865i7sHHLVocyRGSUCuviGCBOhFdft0yJ/G45fW3T7CCzclJsvSqnzCxJZ0qpMh/2PEC+01J0TyaT0yhARObhgA5FKQe4ynnAQ0vm3n33rhMXxITCEood8LsYNCCmrdQPNobN1vGkrw8Aw7Y7vIM5QIAUBBEgBQCcePPbXV0AyXViB28snyytXhLPj0PD9IztCpAC7FllmjcBUoBD2Ib5GyAFRDSscwoZkgAymM10Xa8n1yiALMoDK0g1LjNGjgGktxw/doxHR09b1p38hr59/RowuUYqhFchtlAd5IaGBhm7FFTdbuGi81RxSt3r7nZUgCeu00pW0C0HgK1pTcqEGs4waxYtVnt7pZvyO7fvYJv/W9lZuK7rszgZBPBKNFCcRjrd0eFgV3oJYuclDIzaeC8HBpzJ6rZ1/SAoheSdXqX14KGCkLOfF39f6zlohCAzEomZpUAttcDi0UlFUFjZfK/cjfAHJ5oQGJBfli8AAAAASUVORK5CYII="
        ,"data:image/png;base64,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"
        ,"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHEAAABxCAYAAADifkzQAAAD70lEQVR42u3dTU8TQRjA8WriRWMaCAlUZ2d3FRMPvpCYAAZo5KCJGowv8aLBEFCPGgwI6BfwC6iH6kEPvt4AbxgTE0945gMQExIvXjwoiBUORSht+rLd3Xlm/5Psqe3OzPObZ2a33d2mUhYUT7nPD2g3X+vmO3o1RYm+1INV63bQ9ZaJtEFot4ZH8gPnzgfaRzqdbkIiBLiZ6el8HPWiEyCIJg4mxP4flHySEKShwRtgFhdf6ZlSAfk4N5eXOmMkyW+XLQFYO4pNHqatHe7vy5Y4B3U+24b3Owmj1dqsLO7U6J271q8dxX12tc5J7cvOJC/8E2PjsrOyuPFXL11O7GG4SEjOoYTHBMDq4+Nm3JsA2pGVy0Y2rD+bBbCGePmO/mtUg57lcgDWk5HKWTGiIbAEhNynHsXagKePn4AoLRE2V3yyswtAaZCecv4wjQqHBFB4bAGMDnF9xgOQbCxaB1tbuws7Ptx+CESJkGRhfJBr0+oqgGQjiOIhAbQI8cPsbCyXzEvbjIOMsnEgli9LS0tDgRHDnipsmvaMmlajWAtBDLmOwge+zs+DaBhiVfVEdUQKIoiJQ9xio/T3sm9qbm5WUTcIxAZnY5Qn9yCGVFfhDSeOd4BoOGLJ+jKZzG6jRhSItSNG/T0piCHUB6JIxB1mjiYQ659SQRSOGMfvhiA2uE4QLUI81dsHonRE2ztuI+JGvSCCCGLciJ7yXoAoHHH9nnEQZfZlo964ri0FEUQQQQQRRBBBBBFEEK1E5DzRAkRX6ZcgCv/GJu5GgAgiiCBaiMgv+/IQfa3fl1YFUQxi+dQEUR6iamvrBFFOX7h4OAmI3IshB7EplUqDKBxx2wstLS17QTS/LxWTrfDig8lJ7hSWjsg9++Yjln2D1noARHP7UnWS8Rwb8xEr/r8UiGb2pWYXEC1C5CmLKdGDfg+I5vSl7qTiycNmPHk40CDZH/LD+kCMKJl4Gn+85eHUVGPiX9hJx5GjQMa01jYMkWwUCgikRYiuUu8KOxy8dh1IaYBkoyWAQEZTzp4+E/55ZzqVbgJScBaWO0kn9EJnuc0Vvnn1GkipyxTZ2Pg4usq9kpwRZCFgKH/JDmR0cat4uQWQZgMaFbPNjcr29IIpJQM5/Qi0Bq4yVQgqPV3dW2LiOM4wcz7rXzTF1TqXdExr+p9EyOI+G3kAE7RTtmK2e779/bQZ08rsK1d8rX/YgvltcfFtUmaZqrNSSgAktz3SgJgYFPAqTbOO/mka6MLCQl7SIBOTnWEG8OLAhSou19dfEAoBtHi7PXIzPzF+fxv02Oi9+u6zUM4KEo0Cdb1l6Xc4UUoUpdSxIFi+dn9Jj8E/T3UVUFUBWIsAAAAASUVORK5CYII="
        ];
    
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
        this.items.push(new Button(itemLeftPadding,10,"Play",images[1],m));
        this.items.push(new Button(itemLeftPadding+buttonMargin,10,"Pause",images[0],m));
        this.items.push(new Button(itemLeftPadding+buttonMargin*2,10,"Stop",images[3],m));
        this.items.push(new Button(itemLeftPadding+buttonMargin*3,10,"Record",images[2],m));
        this.items.push(new Button(itemLeftPadding+buttonMargin*4,10,"New",images[2],m));
        this.items.push(new Button(itemLeftPadding+buttonMargin*5,10,"Save",images[2],m));
        this.items.push(new Button(itemLeftPadding+buttonMargin*6,10,"Load",images[2],m));
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