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
    
    //0-pause,1-play,2-record,3-stop,4-new,5-load,6-save
    var images = [
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHEAAABxCAYAAADifkzQAAADrklEQVR42u3czUsVURjH8UubaH25oI1nZm71DwRRWUK08aatinYFvWjtyqRN0UKLwghfaF8tTOtf0BaK7sogCInWwl3XNsQmLRJf7s07r+c853wfGBBBzu+cz5yZM85LqWRBHfKDKMlWVf6vElVsHVb+alKwOBsjbcgsu3ThYnTzRt/mBqqBcFm3+X52FtC84UzLhFgLA9XTXYsk5Ax9/zt4AvfwhpgdwTx4lvRl/df7rcVTStVsPbc4cc50ZWHQoJ8/bejXAddWdROjY/bssK4vy8X3nWuqv3X18pUdK1i1BiCzstiwr1++AlASpGpvP8bsEwxZqVSOANh6nTp+wixIz/M6AYxfI0+emgMJYPLaWDNoHz8A09fgwIA+SACFL3YAzHdMww71obDGbvX1gyhxcjALhUMCKBwSQBAp3eMNoHBIAEFsqT4tLaV6xP7x8HCUVR9Ne8Q/dTtFBQWxefV210CUjpjKociQWxGTZMwSMcnf5T0+byYnQZSOmChj0StSEPeurpOdIEpHjJ2z6HAgZpxTx8U9iBm3CaIMxP+2qyMYiBlm1fV/UhAzPKSCKAuxYdu6QoGYUd7QDz6DKAOxads67xuCCKLTiKHvfzUiEIgZZQYRRBALrtmZme2ZNz7cCqIsxF3t636iDUQQQQRRPmK5XPZAFI4YesEYiMIR/2T498OjoSEQQQQRRBDTI3JOBBFEVqcgcp3If2xAFI/IXQwLEHUHAjF+7bqfCCJ39kE0DZGn3WQhhir4BmLJpudOlb8MonBEnaFAzDAvb0WBCKLuQ6nOYCBmnJV39kEEUfehVFc4EHPIyRelLEAs+tYUiHvXmdNd8TPylUWzEBNlBNEcxLdTU8kt+PKw8C8Pg2gG4vlzPenbKSJsvV5/MT46GiXd5ufmUmVL0/bGZuws1HnxT+Uw9kBagAikBYAgWgAIpEWIQFoAuLORu7fvACl1gjAb8x3Tqgq+2LfXOARY+HgCmb4e3n8QaR9HIJPX85FnkRHj57W1nQUyfk2MjUdGjdvBSuUokK3X1rv0Ro2X53mdQBq+iEkS8t30NJjSAEWGZUyA3Kv6r13fNg5hh1oTvfe5hmlN39cXPGXXIHu7a3buvK7Myl39VGrZ/k5aguncqUPX85sF4u1z9sQvBXNlZWWxUe6qUh+5hjIctFnG0A9+cCXcAqYJX25y+rCZB2geqIsLC0a8e+EsaLPt3uDg5mbySzNugSp/Ne0LMKAZWlvfbo6zhUrVbej/b3tawRq7/DAmAAAAAElFTkSuQmCC"
        ,"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHEAAABxCAYAAADifkzQAAAE30lEQVR42u2dTWgTQRTHU6+iIgYK+5VNVQRFra0VquIXFUVQ6cmiKELBi6JoWxVRiiDFix/4WUGx6slqFbS1oIhUq94UD4IVqade9OKhF4W6JofUWHfTTXaz+96b/4OBNNnuzHu/eW9mJzMviYQAsY3UjSor5RRT0qY1loDEI8XCKqXAygyhwWNjAtf76LETdZ0ZoL9Bp4BkDDRKLcQh5AozlFcbLdO8CnjMenhfb69HqDU/Ap4QXTJvT1EOIPSCktT1/CVSMenDRePmLXI6rOrTchfdZ8D7GMqN69d5dmQAZG6T/Ibu3rkLADmBNCorF8L7GINMJ5PzANC/vH3zhhZIW7erATC4V6IhAAmAyoIEwPCk5/796MdIAGQ+a82v6NnTp4BYPueYXp5KNK0BXsg8ygEgc5AAGJ2cO3P27/homN/DAaibh3I37Th1ChA5emOUXghPL4Pdow6jCNt/ZdOGjeFsvooTYrYc2LvPgTcGsH8cXoHd1t42sQxjf8n/3LBmbeQQs6/nzZkLmEGcKS7DudUJz8zzRs1oZwnRC+bQpyEH3khwhjhZvV+Hh5X1SjEQVQ6xvnVNaVozhfOAQWazUiGebG/3pyOVQ51BH03Ee6NhfZv0osFXg6wgZuXShYvivXJS3WYbqf64lQ+jfukhtqBOFJQOs37pZyHThvXB88NrnZ0iIHrB/DzE+/myYKek0FvL1YZbN7vEeGX7iRPuOmTzs0iGKC3EuradilJRfvmcX+pqah2OEDPl539vHm07rARE7s+Xrm2mokQc7di+rYldiAVEIePlP22kMqmhNkPOlbaWFoc8REo9j5IHUPdKQBQQYvM2GH8BRKYw/2nL+IaotesAsUiY/U/6HVIQya5EEJP3796RS6gLiExDLCCWEeai+QscQBSSwBYQGcme5uZYwiogClgQAMSQ4a1avsKJsw3jfwy8eIHnREYP/a4QsWLjLRfOn+exYgOI9MY9X+3C2ql/eHPTVSQ7V+ZlBb5PJDzu+bbVbE1rAsREYmRk5Cjbb/YphbG4j9TlytXLV0gDXLd6jfcem+whTpUgct2HWnCjlCr7TpfV1LLeRKw8RLE7wKnNDKOAt3H9erbnMZSDKO2Im69TUTifCIgkICp7UphCSA1a/0R4R1rbRAL0BZF79gwVfinV8yLbMEc5QVy1YqVSSYl865i7sHHLVocyRGSUCuviGCBOhFdft0yJ/G45fW3T7CCzclJsvSqnzCxJZ0qpMh/2PEC+01J0TyaT0yhARObhgA5FKQe4ynnAQ0vm3n33rhMXxITCEood8LsYNCCmrdQPNobN1vGkrw8Aw7Y7vIM5QIAUBBEgBQCcePPbXV0AyXViB28snyytXhLPj0PD9IztCpAC7FllmjcBUoBD2Ib5GyAFRDSscwoZkgAymM10Xa8n1yiALMoDK0g1LjNGjgGktxw/doxHR09b1p38hr59/RowuUYqhFchtlAd5IaGBhm7FFTdbuGi81RxSt3r7nZUgCeu00pW0C0HgK1pTcqEGs4waxYtVnt7pZvyO7fvYJv/W9lZuK7rszgZBPBKNFCcRjrd0eFgV3oJYuclDIzaeC8HBpzJ6rZ1/SAoheSdXqX14KGCkLOfF39f6zlohCAzEomZpUAttcDi0UlFUFjZfK/cjfAHJ5oQGJBfli8AAAAASUVORK5CYII="
        ,"data:image/png;base64,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"
        ,"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHEAAABxCAYAAADifkzQAAAD70lEQVR42u3dTU8TQRjA8WriRWMaCAlUZ2d3FRMPvpCYAAZo5KCJGowv8aLBEFCPGgwI6BfwC6iH6kEPvt4AbxgTE0945gMQExIvXjwoiBUORSht+rLd3Xlm/5Psqe3OzPObZ2a33d2mUhYUT7nPD2g3X+vmO3o1RYm+1INV63bQ9ZaJtEFot4ZH8gPnzgfaRzqdbkIiBLiZ6el8HPWiEyCIJg4mxP4flHySEKShwRtgFhdf6ZlSAfk4N5eXOmMkyW+XLQFYO4pNHqatHe7vy5Y4B3U+24b3Owmj1dqsLO7U6J271q8dxX12tc5J7cvOJC/8E2PjsrOyuPFXL11O7GG4SEjOoYTHBMDq4+Nm3JsA2pGVy0Y2rD+bBbCGePmO/mtUg57lcgDWk5HKWTGiIbAEhNynHsXagKePn4AoLRE2V3yyswtAaZCecv4wjQqHBFB4bAGMDnF9xgOQbCxaB1tbuws7Ptx+CESJkGRhfJBr0+oqgGQjiOIhAbQI8cPsbCyXzEvbjIOMsnEgli9LS0tDgRHDnipsmvaMmlajWAtBDLmOwge+zs+DaBhiVfVEdUQKIoiJQ9xio/T3sm9qbm5WUTcIxAZnY5Qn9yCGVFfhDSeOd4BoOGLJ+jKZzG6jRhSItSNG/T0piCHUB6JIxB1mjiYQ659SQRSOGMfvhiA2uE4QLUI81dsHonRE2ztuI+JGvSCCCGLciJ7yXoAoHHH9nnEQZfZlo964ri0FEUQQQQQRRBBBBBFEEK1E5DzRAkRX6ZcgCv/GJu5GgAgiiCBaiMgv+/IQfa3fl1YFUQxi+dQEUR6iamvrBFFOX7h4OAmI3IshB7EplUqDKBxx2wstLS17QTS/LxWTrfDig8lJ7hSWjsg9++Yjln2D1noARHP7UnWS8Rwb8xEr/r8UiGb2pWYXEC1C5CmLKdGDfg+I5vSl7qTiycNmPHk40CDZH/LD+kCMKJl4Gn+85eHUVGPiX9hJx5GjQMa01jYMkWwUCgikRYiuUu8KOxy8dh1IaYBkoyWAQEZTzp4+E/55ZzqVbgJScBaWO0kn9EJnuc0Vvnn1GkipyxTZ2Pg4usq9kpwRZCFgKH/JDmR0cat4uQWQZgMaFbPNjcr29IIpJQM5/Qi0Bq4yVQgqPV3dW2LiOM4wcz7rXzTF1TqXdExr+p9EyOI+G3kAE7RTtmK2e779/bQZ08rsK1d8rX/YgvltcfFtUmaZqrNSSgAktz3SgJgYFPAqTbOO/mka6MLCQl7SIBOTnWEG8OLAhSou19dfEAoBtHi7PXIzPzF+fxv02Oi9+u6zUM4KEo0Cdb1l6Xc4UUoUpdSxIFi+dn9Jj8E/T3UVUFUBWIsAAAAASUVORK5CYII="
        ,"data:image/png;base64,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"
        ,"data:image/png;base64,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"
        ,"data:image/png;base64,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"
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
        this.items.push(new Button(itemLeftPadding+buttonMargin*4,10,"New",images[4],m));
        this.items.push(new Button(itemLeftPadding+buttonMargin*5,10,"Save",images[6],m));
        this.items.push(new Button(itemLeftPadding+buttonMargin*6,10,"Load",images[5],m));
        this.items.push(new Slider(itemLeftPadding+buttonMargin*7,30,1,9,6,"Zoom",m));
        // doubles as playback speed
        this.items.push(new Slider(itemLeftPadding+buttonMargin*8,30,40,240,140,"BPM",m));
        
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
    
    Header.prototype.setBPM = function(b){
        for(var item in this.items)
            if(this.items[item].text == "BPM")
                this.items[item].setValue(b);
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
        ctx.arc(this.x+this.width/2, this.y+this.height/2, this.width/2, 0, 2*Math.PI, false);
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