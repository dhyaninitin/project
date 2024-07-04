jQuery(function($){

	"use strict";

	/*----------------------/
	/* MAIN NAVIGATION
	/*---------------------*/

	$(window).on('scroll', function(){
		if( $(window).width() > 1199 ) {
			if( $(document).scrollTop() > 50 ) {
				setNavbarLight();
			}else {
				setNavbarTransparent();
			}
		}
	});

	function toggleNavbar() {
		if(($(window).width() > 1199) && ($(document).scrollTop() <= 50)) {
			setNavbarTransparent();
		} else {
			setNavbarLight();
		}
	}

	toggleNavbar();

	$(window).on('resize', function() {
		toggleNavbar();
	});

	/* Navbar Setting */
	function setNavbarLight() {
		$('.navbar').addClass('navbar-light');
	}

	function setNavbarTransparent() {
		$('.navbar').removeClass('navbar-light');
	}

	// Hide Collapsible Menu
	if($(window).width() < 1200) {
		$('.navbar li.page_item_has_children > a').siblings('.children').slideDown();
		$('.navbar li.page_item_has_children > a').siblings('.children').slideUp();
		$('.navbar li.page_item_has_children > a').on("touch click", function(e) {
			e.preventDefault();
			$(this).siblings('.children').slideToggle();
			e.stopPropagation();
		});
	}

	$('#main-nav li a').addClass('nav-link');

	$('body').scrollspy({
		target: '#main-nav'
	});

	$('body').localScroll({
		duration: 1500,
		easing: 'easeInOutExpo'
	});

	var wow = new WOW();

	wow.init();

	$("#owl-clients").owlCarousel({

		loop: true,
		stagePadding: 30,
		smartSpeed: 1000,
		autoplay: true,

		responsive: {
		  0: {
				items: 1
		  },
		  600: {
				items: 2
		  },
		  1000: {
				items: 3
		  }
		}

	});

	$("#owl-testimonials").owlCarousel({

		loop: true,
		stagePadding: 30,
		smartSpeed: 2000,
		autoplay: true,
		items: 1

	});

	/*----------------------/
	/* WORKS
	/*---------------------*/

	var originalTitle, currentItem;

	$('.media-popup').magnificPopup({
		type: 'image',
		callbacks: {
			beforeOpen: function() {
				// modify item title to include description
				currentItem = $(this.items)[this.index];
				originalTitle = currentItem.title;
				currentItem.title = '<h3>' + originalTitle + '</h3>' + '<p>' + $(currentItem).parents('.work-item').find('img').attr('alt') + '</p>';

				// adding animation
				this.st.mainClass = 'mfp-fade';
			},
			close: function() {
				currentItem.title = originalTitle;
			}
		}

	});

	/*----------------------/
	/* SCROLL TO TOP
	/*---------------------*/

	if( $(window).width() > 992 ) {
		$(window).scroll( function() {
			if( $(this).scrollTop() > 300 ) {
				$('.back-to-top').fadeIn();
			} else {
				$('.back-to-top').fadeOut();
			}
		});

		$('.back-to-top').on('click', function(e) {
			e.preventDefault();

			$('body, html').animate({
				scrollTop: 0
			}, 1500, 'easeInOutExpo');
		});
	}

});
