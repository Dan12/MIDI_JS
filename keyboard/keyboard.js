var Keyboard_Space = new function(){

    this.initKeyboard = function(testing){
        testmode = testing;
        return new Keyboard();
    }
    
    var Keyboard = function(){
        for(var i = 0; i < numChains; i++)
            currentSounds.push([]);
        
        this.loadSounds(currentSongData["mappings"]["chain1"], currentSounds[0], 1);
        this.loadSounds(currentSongData["mappings"]["chain2"], currentSounds[1], 2);
        this.loadSounds(currentSongData["mappings"]["chain3"], currentSounds[2], 3);
        this.loadSounds(currentSongData["mappings"]["chain4"], currentSounds[3], 4);
        
        this.backend = BackendSpace.init();
        
        this.keyboardUI = Keyboard_UI_Space.initKeyboardUI();
        
        console.log("New keyboard created");
    }
    
    // link the keyboard and the editor
    Keyboard.prototype.linkEditor = function(editor){
        this.editor = editor;
        var mainObj = this;
        setTimeout(function(){mainObj.editor.setBPM(currentSongData.bpm)},500);
    }
    
    // loads sounds from srcArray for given chain into soundArr
    Keyboard.prototype.loadSounds = function(srcArr, soundArr, chain){
        for(var i = 0; i < srcArr.length; i++)
            soundArr.push(null);
    
        for(var i = 0; i < srcArr.length; i++){
            if(srcArr[i] == "")
                this.checkLoaded();
            else
                this.requestSound(i, srcArr, soundArr, chain);
        }
    }
    
    // makes request for sounds
    // if offline version, gets from local files
    // if online version, gets from dropbox
    Keyboard.prototype.requestSound = function(i, srcArr, soundArr, chain){
        var thisObj = this;
        setTimeout(function(){
            //console.log(i+","+chain+","+srcArr[i]+","+soundUrls["chain"+chain][srcArr[i]]);
            soundArr[i] = new Howl({
                // for online version
                urls: [currentSongData["soundUrls"]["chain"+chain][srcArr[i]].replace("www.dropbox.com","dl.dropboxusercontent.com").replace("?dl=0","")],
                // for offline version
                // urls: ["audio/chain"+chain+"/"+srcArr[i]+".mp3"],
                onload: function(){
                    thisObj.checkLoaded();
                },
                onloaderror: function(){
                    console.log("audio/chain"+chain+"/"+srcArr[i]+".mp3");
                    console.log(i+","+chain+","+srcArr[i]+","+currentSongData["soundUrls"]["chain"+chain][srcArr[i]]);
                    $("#error_msg").html("There was an error. Please reload the page");
                }
            });
        },i*50);
    }
    
    // checks if all of the sounds have loaded
    // if they have, load the keyboard
    Keyboard.prototype.checkLoaded = function(){
        numSoundsLoaded++;
        $(".soundPack").html("Loading sounds ("+numSoundsLoaded+"/"+(4*12*numChains)+"). This should only take a few seconds.");
        if(numSoundsLoaded == 4*12*numChains){
            this.keyboardUI.loadKeyboard(this, currentSounds, currentSongData, currentSoundPack);
        }
    }
    
    Keyboard.prototype.getKeyInd = function(kc){
        var keyInd = keyPairs.indexOf(kc);
        if(keyInd == -1)
            keyInd = backupPairs.indexOf(kc);
            
        return keyInd;
    }
    
    Keyboard.prototype.switchSoundPackCheck = function(kc){
        // up
        if(kc == 39){
            this.switchSoundPack(3);
            return true;
        }
        // left
        else if(kc == 37){
            this.switchSoundPack(0);
            return true;
        }
        // down
        else if(kc == 38){
            this.switchSoundPack(1);
            return true;
        }
        // right
        else if(kc == 40){
            this.switchSoundPack(2);
            return true;
        }
    }
    
    // switch sound pack and update pressures
    Keyboard.prototype.switchSoundPack = function(sp){
        // release all keys
        for(var i = 0; i < 4; i++)
            for(var j = 0; j < 12; j++)
                if($(".button-"+(i*12+j)+"").attr("released") == "false")
                    this.releaseKey(keyPairs[i*12+j]);
        
        // set the new soundpack
        currentSoundPack = sp;
        
        $(".sound_pack_button").css("background-color","white");
        $(".sound_pack_button_"+(currentSoundPack+1)).css("background-color","rgb(255,160,0)");
        $(".soundPack").html("Sound Pack: "+(currentSoundPack+1));
        // set pressures for buttons in new sound pack
        for(var i = 0; i < 4; i++){
            for(var j = 0; j < 12; j++){
                var press = false;
                if(currentSongData["holdToPlay"]["chain"+(currentSoundPack+1)].indexOf((i*12+j)) != -1)
                    press = true;
                $('.button-'+(i*12+j)+'').attr("pressure", ""+press+"");
                // holdToPlay coloring, turned off for now
                //$('.button-'+(i*12+j)+'').css("background-color", $('.button-'+(i*12+j)+'').attr("pressure") == "true" ? "lightgray" : "white");
            }
        }
    }
    
    // key released
    // stop playing sound if holdToPlay
    Keyboard.prototype.releaseKey = function(kc){
        this.midiKeyUp(kc);
        
        // send key code to MIDI editor
        this.editor.recordKeyUp(kc);
    }
    
    Keyboard.prototype.midiKeyUp = function(kc){
        if(this.switchSoundPackCheck(kc)){
            // do nothing
        }
        else{
            var kcInd = this.getKeyInd(kc);
            if(currentSounds[currentSoundPack][kcInd] != null){
                if($(".button-"+(kcInd)+"").attr("pressure") == "true")
                    currentSounds[currentSoundPack][kcInd].stop();
                $(".button-"+(kcInd)+"").attr("released","true");
                // holdToPlay coloring, turned off for now

                // Removes Style Attribute to clean up HTML
                $(".button-"+(kcInd)+"").removeAttr("style");

                if($(".button-"+(kcInd)+"").hasClass("pressed") == true)
                	$(".button-"+(kcInd)+"").removeClass("pressed");

                //$(".button-"+(kcInd)+"").css("background-color", $(".button-"+(kcInd)+"").attr("pressure") == "true" ? "lightgray" : "white");
            }
        }
    }
    
    // play the key by finding the mapping,
    // stopping all sounds in key's linkedArea
    // and then playing sound
    Keyboard.prototype.playKey = function(kc){
        this.midiKeyDown(kc);
        
        // send key code to midi editor
        this.editor.recordKeyDown(kc);
    }
    
    Keyboard.prototype.midiKeyDown = function(kc){
        if(this.switchSoundPackCheck(kc)){
            // do nothing
        }
        else{
            var kcInd = this.getKeyInd(kc);
            if(currentSounds[currentSoundPack][kcInd] != null){
                currentSounds[currentSoundPack][kcInd].stop();
                currentSounds[currentSoundPack][kcInd].play();
                
                // go through all linked Areas in current chain
                currentSongData["linkedAreas"]["chain"+(currentSoundPack+1)].forEach(function(el, ind, arr){
                    // for ever linked area array
                    for(var j = 0; j < el.length; j++){
                        // if key code is in linked area array
                        if(kcInd == el[j]){
                            // stop all other sounds in linked area array
                            for(var k = 0; k < el.length; k++){
                                if(k != j)
                                    currentSounds[currentSoundPack][el[k]].stop();
                            }
                            break;
                        }
                    }
                });
                
                // set button color and attribute
                $(".button-"+(kcInd)+"").addClass("pressed");
                $(".button-"+(kcInd)+"").attr("released","false");
                //$(".button-"+(kcInd)+"").css("background-color","rgb(255,160,0)");
            }
        }
    }
    
    // shows and formats all of the UI elements
    Keyboard.prototype.initUI = function(){
        // create new editor and append it to the body element
        if(testmode)
            BasicMIDI.init("#editor_container_div", this);
        else
            MIDI_Editor.init("#editor_container_div", this);
        
        // info and links buttons
        // $(".click_button").css("display", "inline-block");
        
        for(var s in songDatas)
            $("#songs_container").append("<div class='song_selection' songInd='"+s+"'>"+songDatas[s].song_name+"</div>");
        $("[songInd='"+currentSongInd+"']").css("background-color","rgb(220,220,220)");
        
        var mainObj = this; 
        
        $(".song_selection").click(function() {
            var tempS = parseInt($(this).attr("songInd"));
            if(tempS != currentSongInd){
                currentSongInd = tempS
                currentSongData = songDatas[currentSongInd];
                $(".song_selection").css("background-color","white");
                $("[songInd='"+currentSongInd+"']").css("background-color","rgb(220,220,220)");
                
                $(".button-row").remove();
                
                currentSounds = [];
                for(var i = 0; i < numChains; i++)
                    currentSounds.push([]);
                    
                mainObj.editor.notesLoaded([],-1);
                
                mainObj.editor.setBPM(currentSongData.bpm)
                
                numSoundsLoaded = 0;
                mainObj.loadSounds(currentSongData["mappings"]["chain1"], currentSounds[0], 1);
                mainObj.loadSounds(currentSongData["mappings"]["chain2"], currentSounds[1], 2);
                mainObj.loadSounds(currentSongData["mappings"]["chain3"], currentSounds[2], 3);
                mainObj.loadSounds(currentSongData["mappings"]["chain4"], currentSounds[3], 4);
            }
        });
    }
    
    // send request to server to save the notes to the corresponding projectId (pid)
    Keyboard.prototype.saveNotes = function(notes, pid){
        var saveNote = [];
        for(var n in notes)
            saveNote.push({"note":notes[n].note, "beat":notes[n].beat, "length":notes[n].length});
        //console.log(saveNote);
        this.backend.saveSong(JSON.stringify(saveNote), pid, this.editor, currentSongData.song_number);
    }
    
    // ask the user for the project they would like to load and then load that project from the server
    // send back a notes array of the loaded project with note,beat,and length and the project id
    Keyboard.prototype.loadNotes = function(){
        this.backend.loadSongs(this.editor, currentSongData.song_number);
    }
    
    // current soundpack (0-3)
    var currentSoundPack = 0;
    // number of sounds loaded
    var numSoundsLoaded = 0;
    // howl objects for current song
    var currentSounds = [];
    // reference to current song data
    var songDatas = [equinoxData];
    var currentSongInd = 0;
    var currentSongData = equinoxData;
    // number of chains
    var numChains = 4;
    var loaded = false;
    
    var testmode = false;

}