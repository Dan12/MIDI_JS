$(document).ready(function(){
   // create a new player
   Keyboard_Space.initKeyboard();
    
   $(window).resize(function(){
     $(".buttons").css("margin", "0");
     $(".buttons").css("margin","0 "+(($("body").innerWidth()-$(".buttons").width()-30)/2)+"px");
   });
});

// TODO: maybe add global color palette for themes
// TODO: maybe add a metronome and have a slider for on and off
// TODO: long run add some kind of guitar hero thing
// TODO: long run add lights
// TODO: set BPM from keyboard