::Run OSGeo4w Shell on Windows command line
:: Used to convert all .jp2 files of 2016 nyc orthoimagery to .tif files, needed for Google Earth Engine.
:: Can be downloaded here: https://gis.ny.gov/gateway/mg/2016/new_york_city/ ; imagery also find-able on NYC OpenData https://data.cityofnewyork.us/browse?q=orthoimagery
:: And imagery is available as webservices here: https://maps.nyc.gov/tiles/
for %%N in (nyc_ortho_2016\*.jp2) DO gdal_translate -a_srs EPSG:2263 %%N /nyc_ortho_2016_geotif/%%~nN.tif