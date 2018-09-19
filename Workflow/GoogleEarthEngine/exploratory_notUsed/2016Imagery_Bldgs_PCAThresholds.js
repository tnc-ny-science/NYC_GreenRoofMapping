//////FIGURE OUT WAY TO MASK OUT SHADOWS; PC1 should be conducive to this!

//------------------
//Bring In Data
//------------------

//Bring in imagery
var image = ee.Image("users/mtreglia/nycdoitt2016_ortho");

//Bring in Building footprints
var bldgs = ee.FeatureCollection("users/mtreglia/NYCBuilding_20170830");

//Bring in Green Roof Footprints
var grs = ee.FeatureCollection("users/mtreglia/DPR_MLTAdditions_shapefile");


//Calculate ndvi
var ndvi = image.normalizedDifference(['b4','b1']);

//concatenate original image w/ NDVI
var nyc_ortho_ndvi = ee.Image.cat([image, ndvi]);

//simply making the data fit the template
var renamed = nyc_ortho_ndvi;


//---------------
//Setting some generally used parameters
//---------------

//set scale of imagery to use as variable
//var scale = image.projection().nominalScale();
var scale = 3;

//Set Max Pixels
var maxPixels = 1e13;

var threshPC1 = 1.0;
var threshPC2 = 1.0;

//Set AOI based on imagery
//var region = ee.Feature(image.geometry());
//print(region);

var geometry = /* color: 98ff00 */ee.Geometry.Polygon(
        [[[-74.3829345703125, 40.43231429013749],
          [-73.42849731445312, 40.43022363450859],
          [-73.42849731445312, 40.942564441333275],
          [-74.38156127929688, 40.943601771709744]]]);

var region = geometry.bounds();
//store variable of Band names
var bandNames = renamed.bandNames();

//---------------
//Start with analytics
//---------------

// Mean center the data to enable a faster covariance reducer
// and an SD stretch of the principal components.
var meanDict = renamed.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: region.geometry,
      scale: scale,
      maxPixels: maxPixels
  });

var means = meanDict.toImage();


var centered = renamed.subtract(means);
//print(centered)
//Map.addLayer(centered);
// This helper function returns a list of new band names.
var getNewBandNames = function(prefix) {
  var seq = ee.List.sequence(1, bandNames.length());
  return seq.map(function(b) {
    return ee.String(prefix).cat(ee.Number(b).int());
  });
};


// This function accepts mean centered imagery, a scale and
// a region in which to perform the analysis.  It returns the
// Principal Components (PC) in the region as a new image.
//Code from https://developers.google.com/earth-engine/arrays_eigen_analysis 
var getPrincipalComponents = function(centered, scale, region) {
  // Collapse the bands of the image into a 1D array per pixel.
  var arrays = centered.toArray();

  // Compute the covariance of the bands within the region.
  var covar = arrays.reduceRegion({
    reducer: ee.Reducer.centeredCovariance(),
    geometry: image.geometry(),
    scale: 20,
    maxPixels: 1e13
  });

  // Get the 'array' covariance result and cast to an array.
  // This represents the band-to-band covariance within the region.
  var covarArray = ee.Array(covar.get('array'));

  // Perform an eigen analysis and slice apart the values and vectors.
  var eigens = covarArray.eigen();

  // This is a P-length vector of Eigenvalues.
  var eigenValues = eigens.slice(1, 0, 1);
  // This is a PxP matrix with eigenvectors in rows.
  var eigenVectors = eigens.slice(1, 1);

  // Convert the array image to 2D arrays for matrix computations.
  var arrayImage = arrays.toArray(1);

  // Left multiply the image array by the matrix of eigenvectors.
  var principalComponents = ee.Image(eigenVectors).matrixMultiply(arrayImage);

  // Turn the square roots of the Eigenvalues into a P-band image.
  var sdImage = ee.Image(eigenValues.sqrt())
    .arrayProject([0]).arrayFlatten([getNewBandNames('sd')]);

  // Turn the PCs into a P-band image, normalized by SD.
  return principalComponents
    // Throw out an an unneeded dimension, [[]] -> [].
    .arrayProject([0])
    // Make the one band array image a multi-band image, [] -> image.
    .arrayFlatten([getNewBandNames('pc')])
    // Normalize the PCs by their SDs.
    .divide(sdImage);
};

// Get the PCs at the specified scale and in the specified region
var pcImage = getPrincipalComponents(centered, scale, region);


var reducers = ee.Reducer.mean()
  .combine({reducer2: ee.Reducer.stdDev(), sharedInputs: true})
  .combine({reducer2: ee.Reducer.max(), sharedInputs: true})
  .combine({reducer2: ee.Reducer.min(), sharedInputs: true});
  
var pcstats = pcImage.reduceRegion({
  reducer: reducers,
  geometry: image.geometry(),
  scale: scale,
  maxPixels: maxPixels,
});


//---------------
//---------------
//DONE WITH PCA - now for the clipping and object creation
//---------------
//---------------

//Clip the PC imagery to buildings and green roofs
var pca_clip_bldgs = pcImage.clipToCollection(bldgs);
var pca_clip_grs = pcImage.clipToCollection(grs);

//make stack of pc imagery by bldgs and green roofs... not really necessary/used right now
var pca_bldgs_stack = ee.Image.cat([pca_clip_bldgs, pca_clip_grs]);

//Create mask of the pca imagery clipped to bldgs; keep where PC2>1 and PC1<1
var masked_pca_bldgs = pca_clip_bldgs.select('pc2').
  gt(1.0).mask(1);//mask out values <= 0
var masked_pca_bldgs2 = pca_clip_bldgs.select('pc1').
  lt(1.0).mask(1);//mask out values <= 0 

//Multiply the two masks to get a 
var test = pca_clip_bldgs.multiply(masked_pca_bldgs).multiply(masked_pca_bldgs2);

// Create a binary mask.
var masktest = test.select('pc2').gt(1).mask(1);

// Update the composite mask with the water mask.
var maskedComposite = test.updateMask(masktest);


//Attempt to calculate the stats of principle components by bldgs
//Currently runs out of memory.
var bldg_pc_stats = masked_pca_bldgs.select("pc2").reduceRegion({
  reducer: reducers,
  geometry: image.geometry(),
  scale: 30,
  maxPixels: maxPixels,
});

//print(bldg_pc_stats, "bldg_pc_stats");


//Exploring Band Ratios
var redgreen = image.select("b2").divide(image.select('b1'));

//---------------
//Put stuff on the map
//---------------
//Center map on the imagery, set zoom to 11
Map.centerObject(image, 11); //

//Map.addLayer(AOI, {color: "98ff00"}, "Bounding Box");

//Add the imagery to the map
Map.addLayer(image,{bands:['b1', 'b2', 'b3']}, 'rgb');


// Code to Plot each PC as a new layer
//for (var i = 0; i < bandNames.length().getInfo(); i++) {
//  var band = pcImage.bandNames().get(i).getInfo();
//  Map.addLayer(pcImage.select([band]), {min: -2, max: 2}, band);
//}

//Or add pc's manually
//Map.addLayer(pcImage.select([0]), {min: -3, max: 3}, 'pc1');
//Map.addLayer(pcImage.select([1]), {min: -3, max: 3}, 'pc2');

Map.addLayer(bldgs, {color: '#C0C0C0'}, 'Building Footprints');

Map.addLayer(grs, {color: "#32CD32"}, 'green roofs');

//Map.addLayer(masked_pca_bldgs2.select([1]), {min: -3, max: 3, palette: ['000000', 'FF0000']}, 'masked pc2_try2');
//Map.addLayer(masked_pca_bldgs.select([0]), {min: -3, max: 3, palette: ['000000', 'FF0000']}, 'masked pc2_try1');
//Map.addLayer(test2, {min: 0, max: 3, palette: ['000000', 'FF0000']}, 'masked pc2_try1');
Map.addLayer(maskedComposite.select([1]), {min: 0, max: 3, palette: ['000000', 'FF0000']},'masked');

//Map.addLayer(redgreen);


//-------------
//Charts!
//-------------
//var options = {
//  title: 'Principal Components',
//  fontSize: 20,
//  hAxis: {title: 'PC Scores'},
//  vAxis: {title: 'count of Pixels'},
//  series: {
//    0: {color: 'blue'},
//    1: {color: 'green'},
//    2: {color: 'red'},
//    3: {color: 'gray'},
////    4: {color: 'purple'}
//  }
//};
//
// Make the histogram, set the options.
//var histogram = ui.Chart.image.histogram(pcImage.select('pc1', 'pc2'), region, 50)
//    .setSeriesNames(['pc1', 'pc2'])
//    .setOptions(options);



