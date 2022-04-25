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

		}

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
