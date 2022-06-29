var current_script = document.currentScript.src
var filename = current_script.split('/').pop()
var child_theme_dir = current_script.replace('/resources/js/' + filename, '') + '/'

var child_logging = true

;(function($) {
  $(function() {

    //
    // CHILD THEME URL
    //

    $(document).data('child_theme_dir', child_theme_dir)

		//
		// HEADER
		//

		$('#menu-icon i').click(function() {

			if ($('body').hasClass('nav-open')) {
				$('body').removeClass('nav-open')
				$(this).removeClass('fa-times').addClass('fa-bars')
			} else {
				$('body').addClass('nav-open')
				$(this).removeClass('fa-bars').addClass('fa-times')
			}

		})

		$(document).on('overlay_show', function() {
			$('body').removeClass('nav-open')
		})

    //
    // APP
    //

		if ($('body').hasClass('app-page')) {

			$(document).profiler()

			if ($('body').attr('id') == 'page-scenarios') {

				$(document).rp_scenarios({

				})

			} else if ($('body').attr('id') == 'page-risks') {

				$(document).rp_risks({

				})

			}

			$('body').on('click', '.overlay-content #psra-items .query-item', function(e) {

				if ($(e.target).is('div')) {
					$(this).find('a').trigger('click')
				}

			})

		}

		$('body').on('click', '.overlay-content #psra-items-filter .item', function() {

			var item_list = $('body').find('.overlay-content #psra-items .list-group')

			if ($(this).hasClass('selected')) {

				$(this).removeClass('selected')
				item_list.find('.query-item').slideDown(250)

			} else {

				var selected_filter = $(this).text().toLowerCase()

				console.log(selected_filter)

				$(this).addClass('selected').siblings().removeClass('selected')

				item_list.find('.risk-var:not([data-type="' + selected_filter + '"])').closest('.query-item').slideUp(250)

				item_list.find('[data-type="' + selected_filter + '"]').closest('.query-item').slideDown(250)
			}

		})

		//
		// BOOTSTRAP
		//

		$('.accordion').on('hidden.bs.collapse', function (e) {

			console.log(e)

			console.log($(this))

		})

    if (child_logging == true) {
      console.log('end of child-functions.js')
      console.log('- - - - -')
    }

  });
})(jQuery);
