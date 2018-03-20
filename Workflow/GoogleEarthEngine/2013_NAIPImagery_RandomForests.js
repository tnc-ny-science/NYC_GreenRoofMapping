var geometry = /* color: d63000 */ee.Geometry.Polygon(
        [[[-74.3829345703125, 40.43231429013749],
          [-73.68, 40.43022363450859],
          [-73.68, 40.942564441333275],
          [-74.38156127929688, 40.943601771709744]]]);

///Classification of + NDVI surfaces in NYC based on NAIP Imagery
///developed by V Pietsch & M Treglia
//This code is being used to classify surfaces in NYC with (+) 
//NDVI based on 2013 NAIP Imagery;
//this code can also be modified to export a 5-band NAIP image for NYC
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

//Add Fusion Table and reclassify values
//var groofs = ee.FeatureCollection("ft:1otB8O_yxYbmE7htojIOdpn3OnWpCkjCfJMiCpesm", 'geometry')
//.remap([10, 20, 30, 40, 50, 60, 70], [0, 1, 2, 3, 4, 5, 6], 'TYPE');
var groofs = ee.FeatureCollection("ft:1J-dewM60la7wGUcMC-M8ORuR6WalZo6mLKApT5OR", 'geometry')
    .remap([10, 20, 30, 40, 50, 60, 70], [0, 1, 2, 3, 3, 4, 0], 'TYPE')
    .map(function(f) {
      return f.set('area', f.geometry().area());
    })
    .filter(ee.Filter.rangeContains('area', 0, 10000))
print(groofs)

print('shapefile',groofs);


////MAKE MAP
Map.setCenter(-73.965118, 40.783767, 10);


//Add NDVI band
var ndvi = naipImage.normalizedDifference(['N','R']);
var maskedNDVI = ndvi.mask(ndvi.where(ndvi.gt(0.0),ndvi))//mask out values < 0
var maskedNDVI = maskedNDVI.multiply(64000) //multiply out NDVI so can be seen as integer for UINT conversion (if data will be exported)
var naipImage2 = naipImage.addBands(maskedNDVI);
print('naipImage with ndvi',naipImage2)

//Mask out areas with non-(+) NDVI from other bands
var naipImage2 = naipImage2.mask(naipImage2.select('nd')); //show only areas with NDVI >0


////Classification
// Use these bands for prediction.
var bands = ['R','G','B','N', 'nd'];

// Overlay the points on the imagery to get training.
var training = naipImage2.select(bands).sampleRegions(groofs, ['TYPE'], 1);//NAIP pixels are 1m

// Train a RandomForests classifier with default parameters.
var trained = ee.Classifier.randomForest().train(training, 'TYPE', bands);

// Classify the image with the same bands used for training.
var classified = naipImage2.select(bands).classify(trained);




// var naipImageFinal = naipImage2.uint16();
// print('naipImage file formal uint16', naipImageFinal)
print(naipImage2)

//Add Layers to Map
Map.addLayer(naipImage2,{bands: ['R','G','B']},'true color')
//Map.addLayer(naipImage2.select('nd'),{min: -6400, max: 6400, palette: ['000000', 'FF0000']},'NDVI',false)
Map.addLayer(groofs, {color:'000000'},'shapefile',false) //add greenroofs layer to map
Map.addLayer(classified, {min:0, max:4, palette:['00FF00', '006600', '00FFFF','FF9933', 'FFFF00']},'classification');

var classifiedExport = classified.add(1) //Add 1 to all pixels so in output layer, nodata is 0


//export Naip Image
//Export.image(naipImage2.uint16(), 'exportNAIP', {
//  scale: 1,
//  maxPixels: 10000000000,
//  region: geometry,
//  crs: "EPSG:2263"
//});


//export Classification
// Export.image(classifiedExport.uint8(), 'exportNDVI_Classification', {
  // scale: 1,
  // maxPixels: 10000000000,
  // region: geometry,
  // crs: "EPSG:2263"
// });


// ///END OF CODE

