$(document).ready(function(){
   // create a new player
   Keyboard_Space.initKeyboard(true);
   
   // a simple test player
   //Test_Player.init();
    
   $(window).resize(function(){
     $(".buttons").css("margin", "0");
     $(".buttons").css("margin","0 "+(($("body").innerWidth()-$(".buttons").width()-30)/2)+"px");
   });
});