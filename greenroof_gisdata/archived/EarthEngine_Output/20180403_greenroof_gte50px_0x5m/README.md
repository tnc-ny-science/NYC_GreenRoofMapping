# README

The data contained in the [original](/original) folder are geotiffs, created in Google Earth Engine using [2016Imagery_Bldgs_PCAThresholds_class_export.js](../../../Workflow/GoogleEarthEngine/2016Imagery_Bldgs_PCAThresholds_class_export.js) and then downloaded.

They were polygonized into nyc_landcover_polygons.gdb (not included here due to large size) were taken into R, polygons with value of 0 were removed, and everything was combined into single vector layer using [CombiningPolygonizedData.R](../../../Workflow/RCode/CombiningPolygonizedData.R)
