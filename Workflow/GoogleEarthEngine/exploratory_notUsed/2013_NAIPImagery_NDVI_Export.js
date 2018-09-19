var geometry = /* color: 98ff00 */ee.Geometry.Polygon(
        [[[-74.3829345703125, 40.43231429013749],
          [-73.42849731445312, 40.43022363450859],
          [-73.42849731445312, 40.942564441333275],
          [-74.38156127929688, 40.943601771709744]]]);

////"Export NAIP Imagery for NYC", Mike Treglia and Valerie Pietsch
//this code exports a 5-band NAIP image for NYC
//bands are Red, Green, Blue, Near IR, and NDVI 
//final exported file is in unsigned 16-bit integer format

//Select NAIP Data Set 
var NAIP = ee.ImageCollection('USDA/NAIP/DOQQ');
 
//Filter NAIP imagery
var naipImage = NAIP
  .filterBounds(geometry)
  .filterDate('2013-01-01','2013-06-30')
  .mosaic();
print('naipImage',naipImage);

////MAKE MAP
Map.setCenter(-73.965118, 40.783767, 10);

//Add NDVI band
var ndvi = naipImage.normalizedDifference(['N','R']);
var maskedNDVI = ndvi.mask(ndvi.where(ndvi.gt(0.0),ndvi))//mask out values <= 0
var maskedNDVI = maskedNDVI.multiply(64000) //multiply out NDVI so can be seen as integer for UINT conversion
var naipImage2 = naipImage.addBands(maskedNDVI);
print('naipImage with ndvi',naipImage2)

// var naipImageFinal = naipImage2.uint16();
// print('naipImage file formal uint16', naipImageFinal)

//Add Layers to Map
Map.addLayer(naipImage2,{bands: ['R','G','B']},'true color')
Map.addLayer(naipImage2.select('nd'),{min: -1, max: 1, palette: ['000000', 'FF0000']},'NDVI')

//export Naip Image
Export.image(naipImage2.uint16(), 'exportNAIP', {
  scale: 1,
  maxPixels: 10000000000,
  region: geometry,
  crs: "EPSG:2263"
});

// ///END OF CODE

