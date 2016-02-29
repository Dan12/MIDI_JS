$(document).ready(function(){
   // create a new player
   Keyboard_Space.initKeyboard();
    
   $(window).resize(function(){
     $(".buttons").css("margin", "0");
     $(".buttons").css("margin","0 "+(($("body").innerWidth()-$(".buttons").width()-30)/2)+"px");
   });
});

// TODO: add global color palette
// TODO: add function pass note array between editor and noteHandler for loading and saving notes
// TODO: add function to pass button press between editor and noteHandler for calling load and save functions
// TODO: maybe add a metronome and have a slider for on and off