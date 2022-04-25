
<div class="sidebar-detail scenario">
	<div class="container-fluid py-5">
		<div class="row justify-content-center mb-5">
			<div class="col-8">
				<h4 class="text-white mb-0">Cascadia Interface Best Fault</h4>
			</div>
		</div>

		<div class="row justify-content-center">
			<div class="col-8">

				<div class="card mx-n3">
					<div class="card-header text-primary border-bottom">Scenario</div>

					<div class="card-body">
						<div class="row row-cols-4 data-cols mb-3">

							<div class="">
								<h6>Magnitude</h6>

								<p class="d-flex align-items-center">
									<span class="rp-icon icon-chart text-primary mr-1"></span>
									<span>9.0</span>
								</p>
							</div>

							<div>
								<h6>Deaths</h6>
								<p>3,417</p>
							</div>

							<div>
								<h6>Damage</h6>
								<p>18,375 buildings</p>
							</div>

							<div>
								<h6>Dollars</h6>
								<p>$38,402,326,693</p>
							</div>
						</div>

						<div class="data-cols">
							<h6 class="mb-1">Description</h6>
							<p>This is a moment magnitude 9.0 earthquake on the Cascadia Subduction Zone. Earthquakes like this occur about once ever 400–500 years, with the most recent event in January 1700.</p>
						</div>
					</div>
				</div>

			</div>
		</div>

		<div class="row justify-content-center my-5">
			<div class="col-8">
				<h6 class="text-white mb-0">Indicators</h6>
			</div>
		</div>

		<div class="row justify-content-center">
			<div class="col-8 accordion" id="scenario-detail-indicators">

				<div class="card mx-n3">
					<div
						id="detail-shake-head"
						class="card-header open border-bottom d-flex align-items-center justify-content-between indicator-item"
						data-toggle="collapse"
						data-target="#detail-shake-collapse"
						aria-expanded="true"
						aria-controls="detail-shake-collapse"
						data-indicator='{
							"key": "sH_PGA",
							"label": "Peak Ground Acceleration, in units of g",
							"retrofit": false,
							"aggregation": {
								"5km": { "rounding": 0, "decimals": 6 },
								"10km": { "rounding": 0, "decimals": 6 },
								"25km": { "rounding": 0, "decimals": 6 },
								"50km": { "rounding": 0, "decimals": 6 }
							},
							"legend": {
								"prepend": "",
								"append": ""
							}
						}'
					>
						Shake Map
						<i class="fas fa-caret-down"></i>
					</div>

					<div
						id="detail-shake-collapse"
						class="collapse show border-bottom"
						data-parent="#scenario-detail-indicators"
						aria-labelledby="detail-shake-head"
					>
						<div class="card-body">
							<div class="">
								<p>chart</p>
							</div>
						</div>
					</div>
				</div>

				
				<div class="card mx-n3">
					<div
						id="detail-death-head"
						class="card-header border-bottom d-flex align-items-center justify-content-between"
						data-toggle="collapse"
						data-target="#detail-death-collapse"
						aria-expanded="false"
						aria-controls="detail-death-collapse"
					>
						Fatalities						<i class="fas fa-caret-down"></i>
					</div>

					<div
						id="detail-death-collapse"
						class="collapse"
						data-parent="#scenario-detail-indicators"
						aria-labelledby="detail-death-head"
					>
						<div class="card-body p-0">
							<ul class="list-unstyled">
								
								<li class="indicator-item border-bottom px-3 py-1" data-indicator='{
									"key": "sCt_CasDayL1",
									"label": "Daytime first aid injuries",
									"retrofit": true,
									"aggregation": {
										"csd": {
											"rounding": 0,
											"decimals": 0										},
										"s": {
											"rounding": 0,
											"decimals": 0										}
									},
									"legend": {"prepend":"","":null,"append":"injuries"}								}'>Daytime first aid injuries</li>

								
								<li class="indicator-item border-bottom px-3 py-1" data-indicator='{
									"key": "sCt_CasDayL2",
									"label": "Daytime noncritical hospital injuries",
									"retrofit": true,
									"aggregation": {
										"csd": {
											"rounding": 0,
											"decimals": 0										},
										"s": {
											"rounding": 0,
											"decimals": 0										}
									},
									"legend": {"prepend":"","":null,"append":"injuries"}								}'>Daytime noncritical hospital injuries</li>

								
								<li class="indicator-item border-bottom px-3 py-1" data-indicator='{
									"key": "sCt_CasDayL2",
									"label": "Daytime critical hospital injuries",
									"retrofit": true,
									"aggregation": {
										"csd": {
											"rounding": 0,
											"decimals": 0										},
										"s": {
											"rounding": 0,
											"decimals": 0										}
									},
									"legend": {"prepend":"","":null,"append":"injuries"}								}'>Daytime critical hospital injuries</li>

								
								<li class="indicator-item border-bottom px-3 py-1" data-indicator='{
									"key": "sCt_CasDayL4",
									"label": "Daytime fatalities and entrapments",
									"retrofit": true,
									"aggregation": {
										"csd": {
											"rounding": 0,
											"decimals": 0										},
										"s": {
											"rounding": 0,
											"decimals": 0										}
									},
									"legend": {"prepend":"","":null,"append":"injuries"}								}'>Daytime fatalities and entrapments</li>

															</ul>

							<div class="">
								<p>chart</p>
							</div>
						</div>
					</div>
				</div>

				
				<div class="card mx-n3">
					<div
						id="detail-damage-head"
						class="card-header border-bottom d-flex align-items-center justify-content-between"
						data-toggle="collapse"
						data-target="#detail-damage-collapse"
						aria-expanded="false"
						aria-controls="detail-damage-collapse"
					>
						Damage						<i class="fas fa-caret-down"></i>
					</div>

					<div
						id="detail-damage-collapse"
						class="collapse"
						data-parent="#scenario-detail-indicators"
						aria-labelledby="detail-damage-head"
					>
						<div class="card-body p-0">
							<ul class="list-unstyled">
								
								<li class="indicator-item border-bottom px-3 py-1" data-indicator='{
									"key": "sDt_None",
									"label": "Number of buildings with no damage",
									"retrofit": true,
									"aggregation": {
										"csd": {
											"rounding": 0,
											"decimals": 2										},
										"s": {
											"rounding": 0,
											"decimals": 2										}
									},
									"legend": {"prepend":"","":null,"append":"buildings"}								}'>Number of buildings with no damage</li>

								
								<li class="indicator-item border-bottom px-3 py-1" data-indicator='{
									"key": "sDt_Slight",
									"label": "Number of buildings in the &#8216;slight&#8217; damage state",
									"retrofit": true,
									"aggregation": {
										"csd": {
											"rounding": 0,
											"decimals": 2										},
										"s": {
											"rounding": 0,
											"decimals": 2										}
									},
									"legend": {"prepend":"","":null,"append":"buildings"}								}'>Number of buildings in the &#8216;slight&#8217; damage state</li>

								
								<li class="indicator-item border-bottom px-3 py-1" data-indicator='{
									"key": "sDt_Moderate",
									"label": "Number of buildings in the &#8216;moderate&#8217; damage state",
									"retrofit": true,
									"aggregation": {
										"csd": {
											"rounding": 0,
											"decimals": 2										},
										"s": {
											"rounding": 0,
											"decimals": 2										}
									},
									"legend": {"prepend":"","":null,"append":"buildings"}								}'>Number of buildings in the &#8216;moderate&#8217; damage state</li>

								
								<li class="indicator-item border-bottom px-3 py-1" data-indicator='{
									"key": "sDt_Extensive",
									"label": "Number of buildings in the &#8216;extensive&#8217; damage state",
									"retrofit": true,
									"aggregation": {
										"csd": {
											"rounding": 0,
											"decimals": 2										},
										"s": {
											"rounding": 0,
											"decimals": 2										}
									},
									"legend": {"prepend":"","":null,"append":"buildings"}								}'>Number of buildings in the &#8216;extensive&#8217; damage state</li>

								
								<li class="indicator-item border-bottom px-3 py-1" data-indicator='{
									"key": "sDt_Complete",
									"label": "Number of buildings in the &#8216;complete&#8217; damage state",
									"retrofit": true,
									"aggregation": {
										"csd": {
											"rounding": 0,
											"decimals": 2										},
										"s": {
											"rounding": 0,
											"decimals": 2										}
									},
									"legend": {"prepend":"","":null,"append":"buildings"}								}'>Number of buildings in the &#8216;complete&#8217; damage state</li>

								
								<li class="indicator-item border-bottom px-3 py-1" data-indicator='{
									"key": "sDt_Collapse",
									"label": "Number of buildings that are likely to collapse",
									"retrofit": true,
									"aggregation": {
										"csd": {
											"rounding": 0,
											"decimals": 2										},
										"s": {
											"rounding": 0,
											"decimals": 2										}
									},
									"legend": {"prepend":"","":null,"append":"buildings"}								}'>Number of buildings that are likely to collapse</li>

								
								<li class="indicator-item border-bottom px-3 py-1" data-indicator='{
									"key": "sCt_DebrisTotal",
									"label": "Total volume of disaster debris in tonnes",
									"retrofit": true,
									"aggregation": {
										"csd": {
											"rounding": -6,
											"decimals": 2										},
										"s": {
											"rounding": 0,
											"decimals": 0										}
									},
									"legend": {"prepend":"","":null,"append":"tonnes"}								}'>Total volume of disaster debris in tonnes</li>

															</ul>

							<div class="">
								<p>chart</p>
							</div>
						</div>
					</div>
				</div>

				
				<div class="card mx-n3">
					<div
						id="detail-dollars-head"
						class="card-header border-bottom d-flex align-items-center justify-content-between"
						data-toggle="collapse"
						data-target="#detail-dollars-collapse"
						aria-expanded="false"
						aria-controls="detail-dollars-collapse"
					>
						Dollars						<i class="fas fa-caret-down"></i>
					</div>

					<div
						id="detail-dollars-collapse"
						class="collapse"
						data-parent="#scenario-detail-indicators"
						aria-labelledby="detail-dollars-head"
					>
						<div class="card-body p-0">
							<ul class="list-unstyled">
								
								<li class="indicator-item border-bottom px-3 py-1" data-indicator='{
									"key": "sLt_Asset",
									"label": "Financial loss to assets",
									"retrofit": true,
									"aggregation": {
										"csd": {
											"rounding": -9,
											"decimals": 2										},
										"s": {
											"rounding": -6,
											"decimals": 2										}
									},
									"legend": {"prepend":"$","":null,"append":""}								}'>Financial loss to assets</li>

								
								<li class="indicator-item border-bottom px-3 py-1" data-indicator='{
									"key": "sLt_Bldg",
									"label": "Financial loss to buildings",
									"retrofit": true,
									"aggregation": {
										"csd": {
											"rounding": -9,
											"decimals": 2										},
										"s": {
											"rounding": -6,
											"decimals": 2										}
									},
									"legend": {"prepend":"$","":null,"append":""}								}'>Financial loss to buildings</li>

															</ul>

							<div class="">
								<p>chart</p>
							</div>
						</div>
					</div>
				</div>

				
			</div>
		</div>

	</div>
</div>

