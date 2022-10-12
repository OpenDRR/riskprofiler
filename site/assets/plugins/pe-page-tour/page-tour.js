// page tour
// v1.0

;(function ($) {
  
  // custom select class

  function page_tour(item, options) {

    this.item = $(item);
    
    // options
  
    var defaults = {
      default_open: true,
      open: false,
      current: 1,
      debug: false,
			cookie: {
				name: 'pe-page-tour',
				expires: 30
			},
      labels: {
        start_over: 'Start Over',
        next: 'Next',
    	  close: 'Close',
    	  dont_show: 'Don’t show again'
      },
      elements: {
        bubble: $('.page-tour-bubble')
      },
			classes: {
				content: '',
				footer: '',
				close: 'btn-sm btn-outline-secondary rounded-pill mr-3',
				dont_show: '',
				next: 'btn-sm btn-outline-primary rounded-pill'
			}
    };
    
    this.options = $.extend(true, defaults, options);
    this.init();
  }

  page_tour.prototype = {

    // init

    init: function () {

      var plugin = this
      var plugin_item = plugin.item
      var plugin_settings = plugin.options
      var plugin_elements = plugin_settings.elements
      
      if (plugin_settings.debug == true) {
        console.log('page tour init')
      }
      
      //
      // DEFAULT
      //
      
      if (plugin_settings.debug == true) {
        console.log('tour cookie: ' + plugin_settings.cookie.name + ', val: ' + Cookies.get(plugin_settings.cookie.name))
      }
      
      if (Cookies.get(plugin_settings.cookie.name) == 'no') {
        
        // cookie is set to 'no'
        
        plugin_settings.default_open = false
        
      } else {
        
        // set to 'yes' or not set at all
        
        // set it to 'yes'
        
        
      }
      
      //
      // ELEMENTS
      //
      
      $('body').addClass('page-tour-initialized');
      
      // content
      
      plugin_elements.content = $('<div class="page-tour-content ' + plugin_settings.classes.content + '">').appendTo(plugin_item);
      
      // footer
      
      plugin_elements.footer = $('<footer class="page-tour-footer ' + plugin_settings.classes.footer + '">').appendTo(plugin_item);
      
      // close
      
      plugin_elements.close_wrap = $('<div class="page-tour-close-wrap">').appendTo(plugin_elements.footer)
			
      plugin_elements.close_btn = $('<span class="page-tour-close btn ' + plugin_settings.classes.close + '">' + plugin_settings.labels.close + '</span>').appendTo(plugin_elements.close_wrap)
			
      plugin_elements.dont_show = $('<label class="page-tour-dontshow ' + plugin_settings.classes.dont_show + '" for="page-tour-dontshow"><input type="checkbox" id="page-tour-dontshow" name="page-tour-dontshow"> ' + plugin_settings.labels.dont_show + '</label>').appendTo(plugin_elements.close_wrap)
			
      
      // dots
      
      plugin_elements.dots = $('<div class="page-tour-dots">').appendTo(plugin_elements.footer);
      
      //
      // TOUR STEPS
      //
      
      plugin_settings.steps = JSON.parse(plugin_item.attr('data-steps'));
      
      for (i = 0; i < plugin_settings.steps.length; i += 1) {
        
        $('<span class="page-tour-dot" data-step="' + (i + 1) + '">').appendTo(plugin_elements.dots);
        
      }
      
      plugin_elements.dots.find('.page-tour-dot').first().addClass('current-step');
      
      plugin_elements.next = $('<span class="page-tour-next btn ' + plugin_settings.classes.next + '">' + plugin_settings.labels.next + ' <i class="fas fa-caret-right"></i></span>').appendTo(plugin_elements.footer);
      
      //
      
      if (plugin_settings.default_open == true) {
        plugin.show_tour();
      } else {
        plugin.hide_tour();
      }
      
      //
      // BEHAVIOURS
      //
      
      plugin_elements.next.click(function(e) {
        
        if (plugin_settings.debug == true) {
          console.log('next btn clicked')
        }
        
        var new_step_num = plugin_settings.current + 1;
        
        if (plugin_settings.current == plugin_settings.steps.length) {
          
          if (plugin_settings.debug == true) {
            console.log('on last step');
          }
          
          new_step_num = 1;
        }
        
        plugin.step({ step: new_step_num });
      });
      
      plugin_elements.close_btn.click(function(e) {
        plugin.hide_tour();
      });
      
      $('.page-tour-trigger').click(function(e) {
        e.preventDefault();
        
        if (plugin_settings.debug == true) {
          console.log('show tour btn clicked');
        }
				
				$('body').trigger('page_tour_trigger')
        
        plugin.show_tour();
        
      });
      
    },
    
    show_tour: function(fn_options) {
      
      var plugin = this;
      var plugin_item = this.item;
      var plugin_settings = plugin.options;
      var plugin_elements = plugin_settings.elements;
      
      // options

      var defaults = {
      };
      
      var settings = $.extend(true, defaults, fn_options);
      
      if (plugin_settings.debug == true) {
        console.log('show tour');
      }
      
      // add body class
      
      $('body').addClass('page-tour-open');
      
      // set content
      
      //plugin_elements.content.html(plugin_settings.steps[0]['text']);
      
      // set position
      
      plugin_item.show().css('opacity', 0).position({
        my: plugin_settings.steps[0]['position']['my'],
        at: plugin_settings.steps[0]['position']['at'],
        of: $(plugin_settings.steps[0]['position']['of'])
      }).animate({ opacity: 1 }, 250);
      
      // reset to step 1
      
      plugin.step({ step: 1 });
      
      // set bubble
      
      plugin_item.attr('data-bubble', plugin_settings.steps[0]['position']['bubble']);
      
      // set cookie
      
      Cookies.set(plugin_settings.cookie.name, 'yes', { expires: plugin_settings.cookie.expires });
      
      if (plugin_settings.debug == true) {
        console.log('just set the cookie to yes');
      }
        	  
    },
    
    hide_tour: function(fn_options) {
      
      var plugin = this;
      var plugin_item = this.item;
      var plugin_settings = plugin.options;
      var plugin_elements = plugin_settings.elements;
      
      // options

      var defaults = {
      };
      
      var settings = $.extend(true, defaults, fn_options);
      
      // reset current step
      
      plugin_settings.current = 1;
      
      // remove class
      
      $('body').removeClass('page-tour-open');
      
      // hide popup
      
      plugin_item.animate({
        opacity: 0
      }, {
        duration: 250,
        complete: function() {
          plugin_item.css('top', '-9999px').css('left', '-9999px');
        }
      }).hide();
      
      // if 'don't show again' is checked
      
      if (plugin_elements.dont_show.find('input').prop('checked') == true) {
        
        // set cookie
        Cookies.set(plugin_settings.cookie.name, 'no', { expires: plugin_settings.cookie.expires });
        
        if (plugin_settings.debug == true) {
          console.log('just set the cookie to no');
        }
        
        // uncheck in case the tour gets opened again
        plugin_elements.dont_show.find('input').prop('checked', false);
        
      }
      
    },
		
		get_step: function(fn_options) {
			
			var plugin = this
			var plugin_settings = plugin.options
			
			console.log('hey')
			// return plugin_settings.current
			
		},
    
    step: function(fn_options) {
      
      var plugin = this;
      var plugin_item = this.item;
      var plugin_settings = plugin.options;
      var plugin_elements = plugin_settings.elements;
      
      // options

      var defaults = {
        step: 1
      };
      
      var settings = $.extend(true, defaults, fn_options);
			
			$('body').trigger('page_tour_step')
      
      // update current step
      
      plugin_settings.current = settings.step;
      
      // UPDATE DOTS
      
      plugin_elements.dots.find('.page-tour-dot').removeClass('current-step');
      plugin_elements.dots.find('.page-tour-dot[data-step="' + settings.step + '"]').addClass('current-step');
          
      var new_step_data = plugin_settings.steps[settings.step - 1]; // -1 for array index
      
      // UPDATE CONTENT & POSITION
      
      plugin_elements.content.animate({
        opacity: 0.1
      }, {
        duration: 100,
        complete: function() {
          
          plugin_item.attr('data-bubble', new_step_data.position.bubble);
          
          $(this).html(new_step_data.text).animate({
            opacity: 1
          }, 250);
          
          plugin_item.position({
            my: new_step_data.position.my,
            at: new_step_data.position.at,
            of: new_step_data.position.of,
            using: function(css, calc) {
              $(this).animate(css, 500, 'swing');
            }
          });
          
        }
      });
      
      if (plugin_settings.debug == true) {
        if (plugin_settings.debug == true) {
          console.log('new step: ' + plugin_settings.current);
        }
      }
      
      // if it's now on the last step
      
      if (plugin_settings.current == plugin_settings.steps.length) {
        
        if (plugin_settings.debug == true) {
          console.log('now on the last step');
        }
        
        plugin_elements.next.html(plugin_settings.labels.start_over + ' <i class="fas fa-undo"></i>');
        
      } else {
        
        plugin_elements.next.html(plugin_settings.labels.next + ' <i class="fas fa-caret-right"></i>');
        
      }
      
    }  
    
  }

  // jQuery plugin interface

  $.fn.page_tour = function (opt) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {

      var item = $(this);
      var instance = item.data('page_tour');

      if (!instance) {

        // create plugin instance if not created
        item.data('page_tour', new page_tour(this, opt));

      } else {

        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          instance[opt].apply(instance, args);
        }

      }
    });
  }

}(jQuery));