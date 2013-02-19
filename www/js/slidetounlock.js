$(function() {
 
   slidetounlock_unlocked = function(){
      $("#slidetounlock").fadeOut(function(){
          $("#slider").css('left', 0);
      });
      if (typeof(slidetounlock_callback) == 'function'){ slidetounlock_callback(this); }  
   }
   
   function calcChangeWidth(){
      var window_btn_offset = 200;
      var change_width = $(window).width()-window_btn_offset; // < 550 ? $(window).width()-window_btn_offset : 550;
      return change_width;
   }

	$("#slider").draggable({
		axis: 'x',
		containment: 'parent',
		drag: function(event, ui) {
			if (ui.position.left > calcChangeWidth()) {
				slidetounlock_unlocked();
			} else {
			    // Apparently Safari isn't allowing partial opacity on text with background clip? Not sure.
				// $("h2 span").css("opacity", 100 - (ui.position.left / 5))
			}
		},
		stop: function(event, ui) {
			if (ui.position.left <= calcChangeWidth()) {
				$(this).animate({
					left: 0
				})
			}
		}
	});
	
	// The following credit: http://www.evanblack.com/blog/touch-slide-to-unlock/
	$('#slider')[0].addEventListener('touchmove', function(event) {
	    event.preventDefault();
	    var el = event.target;
	    var touch = event.touches[0];
	    curX = touch.pageX - this.offsetLeft - 73;
	    if(curX <= 0) return;
	    if(curX > calcChangeWidth()){
	    	slidetounlock_unlocked();
	    }
	   	el.style.webkitTransform = 'translateX(' + curX + 'px)'; 
	}, false);
	
	$('#slider')[0].addEventListener('touchend', function(event) {	
	    this.style.webkitTransition = '-webkit-transform 0.3s ease-in';
	    this.addEventListener( 'webkitTransitionEnd', function( event ) { this.style.webkitTransition = 'none'; }, false );
	    this.style.webkitTransform = 'translateX(0px)';
	}, false);

});