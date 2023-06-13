#!/usr/bin/python3
# SPDX-License-Identifier: MIT
# Copyright © 2023 Government of Canada
# Author: Anthony Fok <anthony.fok@nrcan-rncan.gc.ca>

"""Generate scenario entries for RiskProfiler-Datasets.md

This script converts the Earthquake_Scenario_Extents spreadsheet,
kindly provided by William Chow, and saved as CSV, to new entries
with scenario title, extents and resource links in Markdown format,
mimicking previous entries added by Joost van Ulden and Damon Ulmi,
for appending to the RiskProfiler-Datasets.md wiki page
for the https://github.com/OpenDRR/riskprofiler repository.
"""

import csv
from collections import defaultdict


def main():
    """Main function to read CSV file and print extents and URLs in Markdown"""
    scenario_lc = None
    with open('Earthquake_Scenario_Extents - Sheet1.csv', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:
            if row[0][:4] == 'dsra':
                scenario_lc = row[0]
                extent = defaultdict(dict)
            if scenario_lc is not None:
                if row[0][:5] == 'sauid':
                    map_type = 'sauid'
                elif row[0][:3] == 'csd':
                    map_type = 'csd'
                elif row[0][:3] == '5km':
                    map_type = '5km_hexgrid'
                else:
                    continue
                extent[map_type]['left'] = row[1]
                extent[map_type]['bottom'] = row[2]
                extent[map_type]['right'] = row[3]
                extent[map_type]['top'] = row[4]

                if row[0][:3] == '5km':  # Assuming 5km hexgrid is the last entry
                    scenario_title = set_scenario_title(scenario_lc)
                    # pylint: disable=line-too-long
                    print(
                        f"""
## {scenario_title}

SAUID Extent ({extent['sauid']['left']}, {extent['sauid']['bottom']}, {extent['sauid']['right']}, {extent['sauid']['top']})\\
CSD Extents ({extent['csd']['left']}, {extent['csd']['bottom']}, {extent['csd']['right']}, {extent['csd']['top']})\\
5km Hexgrid Extents ({extent['5km_hexgrid']['left']}, {extent['5km_hexgrid']['bottom']}, {extent['5km_hexgrid']['right']}, {extent['5km_hexgrid']['top']})

* [GPKG (Building Aggregation)](https://github.com/OpenDRR/earthquake-scenarios/releases/latest/download/{scenario_lc}_indicators_b.zip)
* [GPKG (Settlement Area)](https://github.com/OpenDRR/earthquake-scenarios/releases/latest/download/{scenario_lc}_indicators_s.zip)
* [GPKG (Census Subdivision)](https://github.com/OpenDRR/earthquake-scenarios/releases/latest/download/{scenario_lc}_indicators_csd.zip)
* [GPKG (Shake Map)](https://github.com/OpenDRR/earthquake-scenarios/releases/latest/download/{scenario_lc}_shakemap.zip)
* [OGC API - Features (Building Aggregation)](https://geo-api.riskprofiler.ca/collections/opendrr_{scenario_lc}_indicators_b?lang=en_US)
* [OGC API - Features (Settlement Area)](https://geo-api.riskprofiler.ca/collections/opendrr_{scenario_lc}_indicators_s?lang=en_US)
* [OGC API - Features (Census Subdivision)](https://geo-api.riskprofiler.ca/collections/opendrr_{scenario_lc}_indicators_csd?lang=en_US)
* [OGC API - Features (Shake Map)](https://geo-api.riskprofiler.ca/collections/opendrr_{scenario_lc}_shakemap?lang=en_US)
* [Elasticsearch (Building Aggregation)](https://api.riskprofiler.ca/opendrr_{scenario_lc}_indicators_b)
* [Elasticsearch (Settlement Area)](https://api.riskprofiler.ca/opendrr_{scenario_lc}_indicators_s)
* [Elasticsearch (Census Subdivision)](https://api.riskprofiler.ca/opendrr_{scenario_lc}_indicators_csd)
* [Elasticsearch (Shake Map)](https://api.riskprofiler.ca/opendrr_{scenario_lc}_shakemap)
* [1km Hex Grid Vector Tiles EPSG_4326 (Shake Map)](https://riskprofiler.ca/{scenario_lc}_shakemap_hexgrid_1km/EPSG_4326)
* [1km Hex Grid Vector Tiles EPSG_900913(Shake Map)](https://riskprofiler.ca/{scenario_lc}_shakemap_hexgrid_1km/EPSG_900913)
* [5km Hex Grid Vector Tiles EPSG_4326 (Shake Map)](https://riskprofiler.ca/{scenario_lc}_shakemap_hexgrid_5km/EPSG_4326)
* [5km Hex Grid Vector Tiles EPSG_900913 (Shake Map)](https://riskprofiler.ca/{scenario_lc}_shakemap_hexgrid_5km/EPSG_900913)
* [Features Vector Tiles EPSG_4326 (Census Subdivision)](https://riskprofiler.ca/{scenario_lc}_indicators_csd/EPSG_4326)
* [Features Vector Tiles EPSG_900913 (Census Subdivision)](https://riskprofiler.ca/{scenario_lc}_indicators_csd/EPSG_900913)
* [Features Vector Tiles EPSG_4326 (Settlement Area)](https://riskprofiler.ca/{scenario_lc}_indicators_s/EPSG_4326)
* [Features Vector Tiles EPSG_900913 (Settlement Area)](https://riskprofiler.ca/{scenario_lc}_indicators_s/EPSG_900913)"""
                    )  # noqa: E501


def set_scenario_title(scenario_lc: str) -> str:
    """Converts a lowercase scenario name to its uppercase equivalent"""
    type_and_mw, location = scenario_lc[5:].split('_')
    type_and_mw = type_and_mw[:3].upper() + type_and_mw[3:]
    for word in (
        'Beach',
        'Beaufort',
        'Burlington',
        'Charlotte',
        'Fault',
        'Georgia',
        'Gloucester',
        'Iles',
        'Lake',
        'Milles',
        'Mystery',
        'Point',
        'Queen',
        'Rouge',
        'Southey',
        'Strait',
        'Structural',
        'Toronto',
        'Vedder',
        'Zone',
    ):
        location = location.replace(word.lower(), word)
    return type_and_mw + '_' + location


if __name__ == '__main__':
    main()
