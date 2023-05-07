
<div class="sidebar-detail city">
	<div class="container-fluid py-5">
		<div class="row justify-content-center mb-5 text-white">
			<div class="col-8">
				<h4 class="city-name"></h4>
			</div>

					</div>

		<div class="row justify-content-center">
			<div class="col-8 accordion" id="scenario-detail-indicators">

				<div class="card mx-n3">
					<div
						id="detail-scores-head"
						class="card-header border-bottom d-flex align-items-center justify-content-between open"
						data-toggle="collapse"
						data-target="#detail-scores-collapse"
						aria-expanded="false"
						aria-controls="detail-scores-collapse"
					>
						Cote de risque						<i class="fas fa-caret-down"></i>
					</div>

					<div
						id="detail-scores-collapse"
						class="collapse show"
						data-parent="#scenario-detail-indicators"
						aria-labelledby="detail-scores-head"
					>
						<div class="card-body p-0">

							<h6 class="mb-0 p-3">Indice de Risque Sismique Intégré</h6>

							<div class="row mx-3 bg-gray-200">
								
								<div class="col-6 p-3 order-1">
									<h5 class="mb-0">Cote de risque – Effet total</h5>
								</div>

								<div class="col-6 px-3 order-3">
									<div id="abs-score-chart" class="score-chart">
										<div class="range d-flex" data-indicator="eqri_abs_score">
											<div class="well well-1" style="background-color: #4575b4;"></div>
											<div class="well well-2" style="background-color: #91bfdb;"></div>
											<div class="well well-3" style="background-color: #fee090;"></div>
											<div class="well well-4" style="background-color: #fc8d59;"></div>
											<div class="well well-5" style="background-color: #d73027;"></div>
										</div>
									</div>
								</div>
								
								<div class="col-6 order-5">
									<h6 class="mb-0 p-3 score-chart-rank" data-indicator="eqri_abs_rank">eqri_abs_rank</h6>
								</div>
								
								<div class="col-6 p-3 border-left order-2">
									<h5 class="mb-0">Cote de risque – Effet en pourcentage </h5>
								</div>

								<div class="col-6 px-3 border-left order-4">
									<div id="norm-score-chart" class="score-chart">
										<div class="range d-flex" data-indicator="eqri_norm_score">
											<div class="well well-1" style="background-color: #4575b4;"></div>
											<div class="well well-2" style="background-color: #91bfdb;"></div>
											<div class="well well-3" style="background-color: #fee090;"></div>
											<div class="well well-4" style="background-color: #fc8d59;"></div>
											<div class="well well-5" style="background-color: #d73027;"></div>
										</div>
									</div>
								</div>
								
								<div class="col-6 order-6 border-left">
									<h6 class="mb-0 p-3 score-chart-rank" data-indicator="eqri_norm_rank">eqri_norm_rank</h6>
								</div>
							</div>

							<div class="row border-bottom p-3">

								<div class="col-6 pr-3">
									<h6>Nombre annuel moyen de décès</h6>

									<div data-indicator="eC_Fatality">eC_Fatality</div>
								</div>

								<div class="col-6 pr-3">
									<h6>Probabilité annuelle de décès</h6>

									<div data-indicator="eCr_Fatality">eCr_Fatality</div>
								</div>
							</div>

							<div class="row border-bottom p-3">
								<div class="col-6 pr-3">
									<h6>Bâtiments complètement détruits sur 50 ans </h6>

									<div data-indicator="eDt_Complete">eDt_Complete</div>
								</div>

								<div class="col-6 pr-3">
									<h6>Probabilité de destruction complète sur 50 ans </h6>

									<div data-indicator="eDtr_Complete">eDtr_Complete</div>
								</div>
							</div>

							<div class="row p-3">
								<div class="col-6 pr-3">
									<h6>Perte économique annuelle</h6>
									
									
									<div data-indicator="eAALt_Asset" data-decimals="2" data-prepend="" data-append=" $ CAD">eAALt_Bldg</div>
								</div>

								<div class="col-6 pr-3">
									<h6>Ratio de perte économique annuelle</h6>

									<div data-indicator="eAALm_Bldg" data-append="%">eAALm_Bldg</div>
								</div>
							</div>

						</div>
					</div>
				</div>

				<div id="loss-exceedance-chart" class="card mx-n3">
					<div
						id="detail-exceedance-head"
						class="card-header border-bottom d-flex align-items-center justify-content-between"
						data-toggle="collapse"
						data-target="#detail-exceedance-collapse"
						aria-expanded="false"
						aria-controls="detail-exceedance-collapse"
					>
						Courbe de dépassement des pertes						<i class="fas fa-caret-down"></i>
					</div>

					<div
						id="detail-exceedance-collapse"
						class="collapse"
						data-parent="#scenario-detail-indicators"
						aria-labelledby="detail-exceedance-head"
					>
						<div class="card-body">

							<p>Données relatives à la courbe de dépassement des pertes pour le code postal <strong data-indicator="fsauid"></strong>, comme indiqué en <span class="text-primary">rouge</span> sur la carte</p>

							<div id="risk-detail-chart" class="chart"></div>

						</div>
					</div>
				</div>

			</div>
		</div>

	</div>
</div>
