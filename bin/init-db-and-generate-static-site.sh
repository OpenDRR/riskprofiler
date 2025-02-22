#!/bin/bash
# SPDX-License-Identifier: MIT
# Copyright © 2022, 2023 Government of Canada
#
# This script uses WP-CLI to import WordPress database, create admin user,
# and generate static HTML files using Simply Static plugin, for the
# Risk Profiler website to be published at https://www.riskprofiler.ca/

set -eo pipefail

# Note: Please increment the RiskProfiler version number before each release.
RISKPROFILER_VERSION=1.1.0

import_db() {
	echo "Waiting for the db container to be ready..."
	bash /usr/local/bin/wait-for-it db:3306 -t 60

	if ! wp core is-installed; then
		echo "Importing WordPress database for RiskProfiler..."
		wp db import /usr/src/db-backup/riskprofiler_db.sql
	else
		echo "WordPress database was previously installed, skipping import."
	fi
}

update_wp_core_and_simply_static() {
	# Updating WordPress core and Simply Static adds about 1 minute to the build.
	echo "Updating WordPress core and Simply Static plugin..."
	wp core update
	wp plugin update simply-static
	wp core update-db
}

update_simply_static() {
	echo "Updating Simply Static plugin..."
	wp plugin update simply-static
	wp core update-db
}

create_wp_admin_user() {
	if [[ -n $WP_ADMIN_USER && -n $WP_ADMIN_EMAIL && -n $WP_ADMIN_PASSWORD ]]; then
		echo "Creating WordPress admin user \"${WP_ADMIN_USER}\"..."
		wp user create "${WP_ADMIN_USER}" "${WP_ADMIN_EMAIL}" --role=administrator --user_pass="${WP_ADMIN_PASSWORD}"
		echo "Updating admin email address to \"${WP_ADMIN_EMAIL}\"..."
		wp option update admin_email "${WP_ADMIN_EMAIL}"
	else
		echo "Warning: WP_ADMIN_{USER,EMAIL,PASSWORD} not defined."
		echo "         WordPress admin user not automatically created."
		echo "See"
		echo "https://developer.wordpress.org/cli/commands/user/create/WordPress"
	fi
}

configure_simply_static() {
	echo "Configuring Simply Static..."
	set -x

	wp option patch update simply-static 'temp_files_dir' '/var/www/html/site/assets/plugins/simply-static/static-files/'
	wp option patch update simply-static 'delivery_method' 'local'
	wp option patch update simply-static 'local_dir' '/var/www/html_static/simply-static-output/'

	# Link to e.g. ./scenarios/index.html instead of ./scenarios/
	wp option patch update simply-static 'destination_scheme' ''
	wp option patch update simply-static 'destination_host' '.'
	wp option patch update simply-static 'destination_url_type' 'offline'

	# Enable use_cron for simply_static_site_export_cron to work
	wp option patch insert simply-static 'use_cron' 'on' || \
	wp option patch update simply-static 'use_cron' 'on'

	# "wp option patch update" would set 'debugging_mode' to integer 1,
	# but Simply Static recognizes only the string '1', hence "wp eval-file"
	wp eval-file - <<-'EOF'
		<?php
		$options = Simply_Static\Options::instance();
		$options
			->set( 'debugging_mode', '1' )
			->save();
	EOF

	# Add additional URLs
	additional_urls=(
		"http://${WORDPRESS_HOST}/community/"
		"http://${WORDPRESS_HOST}/favicon.ico"
		"http://${WORDPRESS_HOST}/fr/community/"
		"http://${WORDPRESS_HOST}/fr/scenario/"
		"http://${WORDPRESS_HOST}/scenario/"
		"http://${WORDPRESS_HOST}/site/assets/themes/fw-child/template/risks/control-bar.php"
		"http://${WORDPRESS_HOST}/site/assets/themes/fw-child/template/risks/detail.php"
		"http://${WORDPRESS_HOST}/site/assets/themes/fw-child/template/risks/filter.php"
		"http://${WORDPRESS_HOST}/site/assets/themes/fw-child/template/risks/items.php"
		"http://${WORDPRESS_HOST}/site/assets/themes/fw-child/template/scenarios/control-bar.php"
		"http://${WORDPRESS_HOST}/site/assets/themes/fw-child/template/scenarios/control-filter.php"
		"http://${WORDPRESS_HOST}/site/assets/themes/fw-child/template/scenarios/control-sort.php"
		"http://${WORDPRESS_HOST}/site/assets/themes/fw-child/template/scenarios/items.php"
	)


	################################################################################################################
	# Deal with rewrite_rules (check with "wp option get rewrite_rules")

	# Read and display names of scenarios from WordPress posts
	# Example: scenarios=([0]="georgia-strait" [1]="val-des-bois" [2]="cascadia-interface-best-fault" [3]="sidney" [4]="leech-river-full-fault")
	mapfile -t scenarios < <(wp post list --post_type=scenario --field=post_name)
	declare -p scenarios
	for i in "${scenarios[@]}"; do
		additional_urls+=( "http://${WORDPRESS_HOST}/fr/scenario/${i}/" )
		additional_urls+=( "http://${WORDPRESS_HOST}/scenario/${i}/" )
	done
	IFS=$'\n' eval 'echo "${additional_urls[*]}"' | wp option patch update simply-static 'additional_urls'

	# This one is apparently not needed?  http://${WORDPRESS_HOST}/community/ and http://${WORDPRESS_HOST}/fr/community/ alone suffice?
	# # Read and display names of communities from WordPress posts
	# # Example: communities=([0]="halifax" [1]="montreal" [2]="ottawa" [3]="winnipeg" [4]="calgary" [5]="vancouver")
	# mapfile -t communities < <(wp post list --post_type=community --field=post_name)
	# declare -p communities
	# for i in "${communities[@]}"; do
	# 	additional_urls+=( "http://${WORDPRESS_HOST}/fr/community/${i}/" )
	# 	additional_urls+=( "http://${WORDPRESS_HOST}/community/${i}/" )
	# done
	# IFS=$'\n' eval 'echo "${additional_urls[*]}"' | wp option patch update simply-static 'additional_urls'
	# ################################################################################################################

	# Add additional files
	wp option patch update simply-static 'additional_files' <<-EOF
		/var/www/html/site/assets/languages/wpml/acf-fr_CA.mo
		/var/www/html/site/assets/languages/wpml/default-fr_CA.mo
		/var/www/html/site/assets/languages/wpml/fw-fr_CA.mo
		/var/www/html/site/assets/languages/wpml/pe-page-tour-fr_CA.mo
		/var/www/html/site/assets/languages/wpml/rp-fr_CA.mo
		/var/www/html/site/assets/languages/wpml/rp-post-types-fr_CA.mo
		/var/www/html/site/assets/languages/wpml/sitepress-fr_CA.mo
		/var/www/html/site/assets/languages/wpml/wpml-media-fr_CA.mo
		/var/www/html/site/assets/languages/wpml/wpml-translation-management-fr_CA.mo
		/var/www/html/site/assets/plugins/pe-page-tour/page-tour.css.map
		/var/www/html/site/assets/themes/fw-child/resources/css/child.css.map
		/var/www/html/site/assets/themes/fw-child/resources/css/highcharts.css.map
		/var/www/html/site/assets/themes/fw-child/resources/vendor/Highcharts-9.3.3/code/highcharts.js.map
		/var/www/html/site/assets/themes/fw-child/resources/vendor/Highcharts-9.3.3/code/modules/export-data.js.map
		/var/www/html/site/assets/themes/fw-child/resources/vendor/Highcharts-9.3.3/code/modules/exporting.js.map
		/var/www/html/site/assets/themes/fw-child/resources/vendor/Leaflet.markercluster-1.4.1/dist/leaflet.markercluster.js.map
		/var/www/html/site/assets/themes/fw-parent/resources/css/global.css.map
		/var/www/html/site/assets/themes/fw-parent/resources/json/highcharts.json
		/var/www/html/site/assets/themes/fw-parent/resources/vendor/bootstrap/dist/js/bootstrap.bundle.min.js.map
		/var/www/html/site/assets/uploads/2021/10/lf20_mmrbfbcv.json
		/var/www/html/site/assets/uploads/2021/10/lf20_vx8bv90p.json
		/var/www/html/site/assets/uploads/2021/10/riskprofiler-lottie1.json
		/var/www/html/site/assets/uploads/2021/10/riskprofiler-lottie3.json
		/var/www/html/site/wp-includes/images/w-logo-blue-white-bg.png
	EOF

	# Remove old status values
	wp option patch delete simply-static 'archive_name'
	wp option patch delete simply-static 'archive_start_time'
	wp option patch delete simply-static 'archive_end_time'
	wp option patch delete simply-static 'archive_status_messages'

	# Show final configuration to the user
	set +x
	wp option get simply-static
}

get_git_describe() {
	wp option delete options_git_describe
	wp option add options_git_describe "$OPTIONS_GIT_DESCRIBE"
}

set_riskprofiler_version() {
	wp option update options_version "$RISKPROFILER_VERSION"
	wp option update options_fr_version "$RISKPROFILER_VERSION"
}

set_api_version() {
	# profile.js, rp_scenarios.js and rp_risks.js all have the API version defined
	API_VERSION=$(grep -r version: site/assets/themes/fw-child/resources/js/ | sed -E 's/.*([0-9]+\.[0-9]+\.[0-9]+).*/\1/' | sort -u)
	wp option update options_api_version "$API_VERSION"
	wp option update options_fr_api_version "$API_VERSION"
}

trigger_wpml_st_sync_translation_files() {
	ls -l /var/www/html/site/assets/languages/wpml/*.mo || :
	# Need to remove existing MO files first as they may have a
	# newer timestamp which causes WPML not to regenerate them.
	rm -f /var/www/html/site/assets/languages/wpml/*.mo
	# Access a French page to trigger synchronization of MO files
	# with translated strings in the database.
	curl "http://${WORDPRESS_HOST}/fr/" -o /dev/null
	ls -l /var/www/html/site/assets/languages/wpml/*.mo
}

simply_static_site_export() {
	set -x
	wp cron event schedule 'simply_static_site_export_cron'
	#wp cron event run 'simply_static_site_export_cron'
	wp cron event list
	wp cron event run --due-now
	set +x

	# Wait until Simply Static export finishes (normally less than 1 minute).
	# The export shouldn't get interrupted unless there are errors such as such as WP_SITEURL got set to http:///site/ (empty hostname).
	# Inserting "wp cron event run --all" to the wait loop above may be able to force the interrupted task to completion,
	# but the export may be incomplete, and should only be used in "emergency".
	duration="5m"
	timeout "${duration}" bash -c "until wp option pluck simply-static 'archive_status_messages' 'done' >/dev/null; do sleep 1; done" \
		|| ( errcode=$?; [[ $errcode == 143 || $errcode == 124 ]] && echo "simply_static_site_export_cron timed out in ${duration}"; exit "${errcode}" )

	# Show status messages from the completed Simply Static export run
	wp option pluck simply-static 'archive_status_messages'
}

fixup_static_site() {
	set -x

	pushd /var/www/html_static

	if [[ -e riskprofiler ]]; then
		suffix=1
		while [[ -e riskprofiler.old.$suffix ]]; do
			((suffix++))
		done
		mv riskprofiler "riskprofiler.old.${suffix}"
	fi
	cp -a simply-static-output riskprofiler

	cd riskprofiler

	# The relative path to the animated logo is currently wrong in HTML files
	# in second- and third-level directories.  Or it could be an absolute URL
	# that needs to be changed to a relative one.
	sed -i 's#data-anim-path="http://[^/]\+/site#data-anim-path="site#' index.html
	for i in */index.html; do
		sed -i 's#data-anim-path="\.\/site#data-anim-path="../site#' "${i}"
		sed -i 's#data-anim-path="http://[^/]\+/site#data-anim-path="../site#' "${i}"
	done
	for i in */*/index.html; do
		sed -i 's#data-anim-path="\.\/site#data-anim-path="../../site#' "${i}"
		sed -i 's#data-anim-path="http://[^/]\+/site#data-anim-path="../../site#' "${i}"
	done
	for i in */*/*/index.html; do
		sed -i 's#data-anim-path="\.\/site#data-anim-path="../../../site#' "${i}"
		sed -i 's#data-anim-path="http://[^/]\+/site#data-anim-path="../../../site#' "${i}"
	done

	# Change PHP file paths to relative paths to allow serving from subdirectories
	sed -E -i "s#url(:| =) ('/site.*settings\.url)#url\1 ((plugin_settings.lang == 'fr') ? '../..' : '..') + \2#" \
		site/assets/themes/fw-child/resources/js/profiler.js

	# Prevent erroneous prepending of "/site/assets/themes/fw-child/template/"
	sed -i "s#settings.url.charAt(0) == '/'#& || settings.url.charAt(0) == '.'#" site/assets/themes/fw-child/resources/js/profiler.js

	# Change "./scenario/" to "../scenario/"
	sed -E -i 's#("url":")(\.\\/scenario\\/)#\1\.\2#' scenario/index.html site/assets/themes/fw-child/template/scenarios/items.php
	# Change "./fr/" to "../../fr/"
	sed -E -i 's#("url":")(\.\\/fr\\/)#\1\..\\/.\2#' fr/scenario/index.html

	# Point to index.html for Amazon S3, and make the links work when site is hosted in a subdirectory
	sed -E -i 's#"url":".[^"]*#&index.html#' \
		scenario/index.html site/assets/themes/fw-child/template/scenarios/items.php
	sed -i "s#\(plugin_settings\.lang_prepend + '/scenario\)'#(plugin_settings\.lang_prepend \? '../..' : '..') + \1/index.html'#" \
		site/assets/themes/fw-child/resources/js/rp_scenarios.js
	sed -i "s#\(plugin_settings\.lang_prepend + '/community\)'#(plugin_settings\.lang_prepend \? '../..' : '..') + \1/index.html'#" \
		site/assets/themes/fw-child/resources/js/rp_risks.js

	# Fix scenarios not loading due to wrong path (#116)
	sed -i "/ajax_url = settings\.url/a\\\
				ajax_url = ajax_url.replace('.//scenario/', '../scenario/')\n\
				ajax_url = ajax_url.replace('.//fr/scenario/', '../../fr/scenario/')\n\
				ajax_url = ajax_url.replace(/\\\\/$/, '/index.html')\n\
				if (ajax_url !== settings.url) {\n\
					console.log('ajax_url corrected from ' + settings.url + ' to ' + ajax_url)\n\
				}" \
		site/assets/themes/fw-child/resources/js/profiler.js

	# Fix relative link directory level in the "Learn More — Callouts" template for the Learn More page
	sed -i 's#"\./\.\./earthquake-scenario-information/index\.html"#"./earthquake-scenario-information/index.html"#' \
		learn-more/index.html

	# Fix links to French home page.  This is already fixed upstream;
	# check to make sure logo images link to the "Accueil" post
	# in both Header (FR) and Footer (FR) templates.
	grep -l -r '/layout/[^/]\+/' . | while IFS= read -r line; do
		sed -i 's#/layout/[^/]\+/#/#' "${line}"
	done

	# Generate static detail-fr.php from dynamic detail.php?lang=fr (#115)
	curl "http://${WORDPRESS_HOST}/site/assets/themes/fw-child/template/risks/detail.php?lang=fr" \
		-o site/assets/themes/fw-child/template/risks/detail-fr.php
	sed -i "s#url: 'risks/detail\.php',#url: (plugin_settings.lang == 'fr') ? 'risks/detail-fr.php' : 'risks/detail.php',#" \
		site/assets/themes/fw-child/resources/js/rp_risks.js

	popd
	set +x
}

check_for_empty_files() {
	pushd /var/www/html_static/riskprofiler

	mapfile -t empty_files < <(find . -empty)
	if [[ ${#empty_files[@]} -ne 0 ]]; then
		echo
		echo "Error! The following files/directories are found to be empty:"
		echo
		IFS=$'\n' eval 'echo "${empty_files[*]}"'
		echo
		echo "Aborting."
		exit 1
	fi
	popd
}

finish() {
	set +x
	if [[ "${KEEP_WPCLI_RUNNING,,}" =~ ^(true|1|y|yes|on)$ ]]; then
		echo
		echo "Since KEEP_WPCLI_RUNNING is true, you may enter WP-CLI container using:"
		echo "    docker exec -it riskprofiler-wpcli-1 /bin/bash"
		sleep infinity
	fi
}

main() {
	trap finish EXIT

	echo "Running $0 as $(id -u):$(id -g)"

	# Set $HOME to somewhere writable so that e.g. "wp update core"
	# can write to $WP_CLI_CACHE_DIR which defaults to $HOME/.wp-cli/cache
	export HOME="/tmp/${UID}"
	mkdir -p "${HOME}"

	import_db
	create_wp_admin_user

	# Updating WordPress core and Simply Static would add about 1 minute to the build,
	# thus disabled by default.
	#update_wp_core_and_simply_static
	#update_simply_static

	configure_simply_static
	get_git_describe
	set_riskprofiler_version
	set_api_version
	trigger_wpml_st_sync_translation_files
	simply_static_site_export
	fixup_static_site

	check_for_empty_files

	echo "Done!"
	echo
	echo "Raw static site export: html_static/simply-static-output/"
	echo " Site export debug log: wp-app/site/assets/plugins/simply-static/debug.txt"
	echo "  Fixed-up static site: html_static/riskprofiler/"
}

main "$@"
