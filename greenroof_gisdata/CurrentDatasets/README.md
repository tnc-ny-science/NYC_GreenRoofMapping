# Metadata

The files in this folder are GIS data files representing green roof footprints in NYC, based on aggregated data from multiple sources, classification of aerial imagery, and manual correction/edits. Thus, these data represent what was present and detected in aerial imagery for NYC from 2016, described at [https://github.com/CityOfNewYork/nyc-geo-metadata/blob/master/Metadata/Metadata_AerialImagery.md](https://github.com/CityOfNewYork/nyc-geo-metadata/blob/master/Metadata/Metadata_AerialImagery.md). 

This dataset was developed by The Nature Conservancy's New York City Program (Mike Treglia and Emily Maxwell) with contributions (data aggregation and additional support) from Timon McPhearson of The Urban Systems Lab at The New School, Eric Sanderson of The Wildlife Conservation Society, and Greg Yetman of CIESIN at Columbia University. ***We will be depositing this dataset to a more permanent repository, after which we will be updating this page with an appropriate citation. Please stay tuned.***

## Usage Notes

The Nature Conservancy and co-authors of this work derived this data set from publicly available data sources. A proper citation will be forthcoming. If interested in using these data in advance of then, please contact Mike Treglia (michael.treglia[at]tnc.org). 

The Nature Conservancy and co-authors of this work shall not be held liable for improper or incorrect use of the data described and/or contained herein. Any sale, distribution, loan, or offering for use of these digital data, in whole or in part, is prohibited without the approval of The Nature Conservancy. The use of these data to produce other GIS products and services with the intent to sell for a profit is prohibited without the written consent of The Nature Conservancy. All parties receiving these data must be informed of these restrictions. The Nature Conservancy shall be acknowledged as data contributors to any reports or other products derived from these data.


## Contact information: 

Mike Treglia, Urban Spatial Planner, The Nature Conservancy. michael.treglia[at]tnc.org.


## The files are as follows:

* *GreenRoofData2016_20180917.geojson* is in the human-readable, GeoJSON format, in in geographic coordinates (Lat/Long, WGS84; [EPSG 4263](http://spatialreference.org/ref/epsg/wgs-84/))
* *GreenRoofData2016_20180917.gpkg* is in the GeoPackage format, which is an Open Standard readable by most GIS software including Esri products (tested on ArcMap 10.3.1 and multiple versions of QGIS). This dataset is in the New York State Plan Coordinate System (units in feet) for the Long Island Zone, North American Datum 1983, [EPSG 2263](http://www.spatialreference.org/ref/epsg/nad83-new-york-long-island-ftus/).
* *GreenRoofData2016_20180917_Shapefile* is a folder containing a Shapefile and associated files. Please note that some field names were truncated due to limitations of Shapefiles, but columns are in the same order as for other files asnd in the same order as listed below. This dataset is in the New York State Plan Coordinate System (units in feet) for the Long Island Zone, North American Datum 1983, [EPSG 2263](http://www.spatialreference.org/ref/epsg/nad83-new-york-long-island-ftus/).
* *GreenRoofData2016_20180917_Shapefile.zip* is a zipped folder with contents of the previously listed folder.


## The fields in the data are described below.

Some, but not all fields were joined to the green roof footprint data based on building footprint and tax lot data; those datasets are embedded as hyperlinks below.

* *fid* - Unique identifier
* *bin* - NYC Building ID Number based on overlap between green roof areas and a building footprint dataset for NYC from August, 2017. (Newer building footprint datasets do not have linkages to the tax lot identifier (bbl), thus this older dataset was used). The most current building footprint dataset should be available at: [https://data.cityofnewyork.us/Housing-Development/Building-Footprints/nqwf-w8eh](https://data.cityofnewyork.us/Housing-Development/Building-Footprints/nqwf-w8eh). Associated metadata for fields from that dataset are available at [https://github.com/CityOfNewYork/nyc-geo-metadata/blob/master/Metadata/Metadata_BuildingFootprints.md](https://github.com/CityOfNewYork/nyc-geo-metadata/blob/master/Metadata/Metadata_BuildingFootprints.md).
* *bbl* - Boro Block and Lot number as a single string. This field is a tax lot identifier for NYC, which can be tied to the [Digital Tax Map](http://gis.nyc.gov/taxmap/map.htm) and (PLUTO/MapPLUTO)[https://www1.nyc.gov/site/planning/data-maps/open-data/dwn-pluto-mappluto.page]. Metadata for fields pulled from PLUTO/MapPLUTO can be found in the [PLUTO Data Dictionary](https://www1.nyc.gov/assets/planning/download/pdf/data-maps/open-data/pluto_datadictionary.pdf?v=18v1). All joins to this bbl were based on MapPLUTO version 18v1.
* *gr_area* - Total area of the footprint of the green roof as per this data layer, in square feet, calculated using the projected coordinate system (EPSG 2263).
* *bldg_area* - Total area of the footprint of the associated building, in square feet, calculated using the projected coordinate system (EPSG 2263).
* *prop_gr* - Proportion of the building covered by green roof according to this layer (*gr_area*/*bldg_area*).
* *cnstrct_yr* - Year the building was constructed, pulled from the Building Footprint data.
* *doitt_id* - An identifier for the building assigned by the NYC Dept. of Information Technology and Telecommunications, pulled from the Building Footprint Data.
* *heightroof* - Height of the roof of the associated building, pulled from the Building Footprint Data.
* *feat_code* - Code describing the type of building, pulled from the Building Footprint Data.
* *groundelev* - Lowest elevation at the building level, pulled from the Building Footprint Data.
* *qa* - Flag indicating a positive QA/QC check (using multiple types of imagery); all data in this dataset should have 'Good'
* *notes* - Any notes about the green roof taken during visual inspection of imagery; for example, it was noted if the green roof appeared to be missing in newer imagery, or if there were parts of the roof for which it was unclear whether there was green roof area or potted plants.
* *classified* - Flag indicating whether the green roof was detected image classification. (1 for yes, 0 for no)
* *digitized* - Flag indicating whether the green roof was digitized prior to image classification and used as training data. (1 for yes, 0 for no)
* *newlyadded* - Flag indicating whether the green roof was detected solely by visual inspection after the image classification and added. (1 for yes, 0 for no)
* *original_source* - Indication of what the original data source was, whether a specific website, agency such as NYC Dept. of Parks and Recreation (DPR), or NYC Dept. of Environmental Protection (DEP). Multiple sources are separated by a slash.
* *address* - Address based on MapPLUTO, joined to the dataset based on *bbl*.
* *borough* - Borough abbreviation pulled from MapPLUTO.
* *ownertype* - Owner type field pulled from MapPLUTO.
* *zonedist1* - Zoning District 1 type pulled from MapPLUTO.
* *spdist1* - Special District 1 pulled from MapPLUTO.
* *bbl_fixed* - Flag to indicate whether *bbl* was manually fixed. Since tax lot data may have changed slightly since the release of the building footprint data used in this work, a small percentage of bbl codes had to be manually updated based on overlay between the green roof footprint and the MapPLUTO data, when no join was feasible based on the bbl code from the building footprint data. (1 for yes, 0 for no)
