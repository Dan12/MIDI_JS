$(document).ready(function(){
   // create a new player
   Keyboard_Space.initKeyboard();
   
   // a simple test player
   //Test_Player.init();
    
   $(window).resize(function(){
     $(".buttons").css("margin", "0");
     $(".buttons").css("margin","0 "+(($("body").innerWidth()-$(".buttons").width()-30)/2)+"px");
   });
});

// TODO: maybe add global color palette for themes
// TODO: maybe add a metronome and have a slider for on and off
// TODO: long run add some kind of guitar hero thing
// TODO: long run add lights

// Global Variables

// TODO: convert keypairs to dictionarys/objects
// {49:0,50:1,51:2...}
// ascii key mappings to array index
var keyPairs = [49,50,51,52,53,54,55,56,57,48,189,187,
            81,87,69,82,84,89,85,73,79,80,219,221,
            65,83,68,70,71,72,74,75,76,186,222,13,
            90,88,67,86,66,78,77,188,190,191,16,-1];
          
// alternate keys for firefox
var backupPairs = [49,50,51,52,53,54,55,56,57,48,173,61,
               81,87,69,82,84,89,85,73,79,80,219,221,
               65,83,68,70,71,72,74,75,76,59,222,13,
               90,88,67,86,66,78,77,188,190,191,16,-1];
                       
// letter to show in each button
var letterPairs = ["1","2","3","4","5","6","7","8","9","0","-","=",
               "Q","W","E","R","T","Y","U","I","O","P","[","]",
               "A","S","D","F","G","H","J","K","L",";","'","\\n",
               "Z","X","C","V","B","N","M",",",".","/","\\s","NA"];