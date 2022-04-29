#!/bin/bash
# SPDX-License-Identifier: MIT
# Copyright © 2022 Government of Canada
#
# This script uses WP-CLI to import WordPress database, create admin user,
# and generate static HTML files using Simply Static plugin, for the
# Risk Profiler website to be published at https://www.riskprofiler.ca/

import_db() {
	echo "Waiting for the db container to be ready..."
	bash /usr/local/bin/wait-for-it db:3306 -t 60

	if ! wp core is-installed; then
		echo "Importing WordPress database for RiskProfiler..."
		wp db import /usr/src/db-backup/wp_habitatseven_riskprofiler.sql
	else
		echo "WordPress database was previously installed, skipping import."
	fi
}

disable_wp_auto_update() {
	echo "Disabling WordPress auto-update"
	wp option update auto_update_core_dev 'disabled'
	wp option update auto_update_core_major 'disabled'
	wp option update auto_update_core_minor 'disabled'
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
	wp option patch update simply-static 'destination_url_type' 'offline'
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

	wp option patch update simply-static 'additional_urls' <<-EOF
		http://riskprofiler.demo/favicon.ico
		http://riskprofiler.demo/site/assets/themes/fw-child/template/risks/detail.php
		http://riskprofiler.demo/site/assets/themes/fw-child/template/risks/filter.php
		http://riskprofiler.demo/site/assets/themes/fw-child/template/risks/items.php
		http://riskprofiler.demo/site/assets/themes/fw-child/template/scenarios/control-bar.php
		http://riskprofiler.demo/site/assets/themes/fw-child/template/scenarios/control-filter.php
		http://riskprofiler.demo/site/assets/themes/fw-child/template/scenarios/control-sort.php
		http://riskprofiler.demo/site/assets/themes/fw-child/template/scenarios/detail.php
		http://riskprofiler.demo/site/assets/themes/fw-child/template/scenarios/items.php
	EOF

	wp option patch update simply-static 'additional_files' <<-EOF
		/var/www/html/site/assets/themes/fw-child/resources/css/child.css.map
		/var/www/html/site/assets/themes/fw-child/resources/vendor/Leaflet.markercluster-1.4.1/dist/leaflet.markercluster.js.map
		/var/www/html/site/assets/themes/fw-child/resources/vendor/Highcharts-9.3.3/code/modules/export-data.js.map
		/var/www/html/site/assets/themes/fw-parent/resources/css/global.css.map
		/var/www/html/site/assets/themes/fw-parent/resources/vendor/bootstrap/dist/js/bootstrap.bundle.min.js.map
		/var/www/html/site/assets/uploads/2021/10/lf20_mmrbfbcv.json
		/var/www/html/site/assets/uploads/2021/10/lf20_vx8bv90p.json
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

generate_static_site() {
	set -x
	wp cron event schedule 'simply_static_site_export_cron'
	wp cron event list
	wp cron event run --due-now

	until wp option pluck simply-static 'archive_status_messages' 'done' >/dev/null; do
		sleep 5
		# The site export task often gets interrupted or stuck for some yet-to-be-determined reason.
		# Thankfully, the "wp cron event run --all" (not --due-now) command is able to resume the export.
		wp cron event run --all
	done
	set +x
	wp option pluck simply-static 'archive_status_messages'
}

main() {
	echo "Running $0 as $(id -u):$(id -g)"

	import_db
	disable_wp_auto_update
	create_wp_admin_user
	configure_simply_static
	generate_static_site

	sleep 1
	echo "Done!"
	echo "Static site exported to: html_static/simply-static-output/"
	echo "Simply Static debug log: wp-app/site/assets/plugins/simply-static/debug.txt"

	if [[ "${KEEP_WPCLI_RUNNING,,}" =~ ^(true|1|y|yes|on)$ ]]; then
		echo
		echo "To enter the WP-CLI container, run:"
		echo "    docker exec -it riskprofiler-cms_wpcli_1 /bin/bash"
		sleep infinity
	fi
}

main "$@"
