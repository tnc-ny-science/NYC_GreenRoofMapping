// Import imagery
var image = ee.Image("users/mtreglia/nycdoitt2016_ortho");

//Import 2010 land cover (3') 
var lc = ee.Image("users/mtreglia/landcover_2010_nyc_3ft");

var canopy = lc.eq(1);

var canopy = lc.updateMask(canopy);

//Import training data
var trainingdata = ee.FeatureCollection("users/mtreglia/20180327_classification_training");

var gr = trainingdata.filter(ee.Filter.eq('roof_typeN', 10));

//import building footprints
var bldgs = ee.FeatureCollection("users/mtreglia/NYCBuilding_20170830");

//Calculate ndvi
var ndvi = image.normalizedDifference(['b4','b1']);

//concatenate original image w/ NDVI
var nyc_ortho_ndvi = ee.Image.cat([image, ndvi]);

var renamed = nyc_ortho_ndvi.select(0,1,2,3);

//set scale of imagery to use as variable
//var scale = image.projection().nominalScale();

var scale = 0.5;


//set max pixels
var maxPixels = 1e13;

//create geometry for mapping
var geometry = /* color: 98ff00 */ee.Geometry.Polygon(
        [[[-74.3829345703125, 40.43231429013749],
          [-73.42849731445312, 40.43022363450859],
          [-73.42849731445312, 40.942564441333275],
          [-74.38156127929688, 40.943601771709744]]]);

var region = geometry.bounds();
//store variable of Band names
var bandNames = renamed.bandNames();


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
    scale: 0.5,
    maxPixels: 1e16
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

print(pcImage);

var nyc_ortho_ndvi_pc = ee.Image
  .cat([nyc_ortho_ndvi, pcImage.select(0,1)])

//clip imagery to bldgs
var nyc_ortho_ndvi_clip = nyc_ortho_ndvi_pc.clipToCollection(bldgs);

var trainingdata2 = trainingdata.remap([10, 20, 30, 40, 50], 
    [0, 1, 2, 3, 4], 'roof_typeN');

var bands = nyc_ortho_ndvi_clip.select(4,5,6).bandNames();

print(bands);

////Classification

// Overlay the points on the imagery to get training.
var training = nyc_ortho_ndvi_clip.select(bands)
  .sampleRegions(trainingdata2, ['roof_typeN'], scale);//NAIP pixels are 1m

// Train a RandomForests classifier with default parameters.
var trained = ee.Classifier.minimumDistance("mahalanobis")
 .train(training, 'roof_typeN', bands);

//var trained = ee.Classifier.naiveBayes()
//  .train(training, 'roof_typeN', bands);

// Classify the image with the same bands used for training.
var classified = nyc_ortho_ndvi_clip.select(bands).classify(trained);

// Get a confusion matrix representing resubstitution accuracy.
var trainAccuracy = trained.confusionMatrix();
print('Resubstitution error matrix: ', trainAccuracy);
print('Training overall accuracy: ', trainAccuracy.accuracy());

//Map.centerObject(nyc_ortho_ndvi, 11); //
Map.addLayer(nyc_ortho_ndvi,{bands:['b1', 'b2', 'b3']}, 'rgb');
//Map.addLayer(naipImage2.select('nd'),{min: -6400, max: 6400, palette: ['000000', 'FF0000']},'NDVI',false)
Map.addLayer(classified, {min:0, max:4, 
  palette:['008000',  '00FFFF','00FF00','000000','FF9933']},'classification')
Map.addLayer(gr, {color:'000000'},'grs',false) //add greenroofs layer to map


//set green roof as classified values equal to 0
var greenroof = classified.eq(0);

//mask out all other values
var greenroof = greenroof.updateMask(greenroof);

//Mask out areas that are actually known/assumed to be tree canopy
//(based on 2010 land cover data)
var greenroof = greenroof.updateMask(lc.neq(1));

//map patches where each pixel represents patch size (pixels)
//following GEE limits, max size of individual patch is 512 pixels
var patchsize = greenroof.connectedPixelCount(512, false);

//mask out patches < 50 pixels
var patchsize2 = patchsize.gte(50);
var patchsize2 = patchsize.updateMask(patchsize2);


Map.addLayer(patchsize2, {palette:['FFFF00',  '0000ff']}, 'patch size');

Map.addLayer(canopy, {palette:'FF69B4'},'canopy') //add greenroofs layer to map


//mask out patches < 50 pixels
var patchsize2 = patchsize.gte(50);
var patchsize2 = patchsize.updateMask(patchsize2);


Map.addLayer(patchsize2, {palette:['FFFF00',  '0000ff']}, 'patch size');

Map.addLayer(canopy, {palette:'FF69B4'},'canopy') //add greenroofs layer to map



Export.image.toCloudStorage({
  image: patchsize2,
  description: 'canopy_gte50px_20180403',
  bucket: 'greenroof_ee_export',
  fileNamePrefix: '20180403_greenroof_gte50px_0x5m',
  scale: scale,
  region: image.geometry(),
  maxPixels: 1e13,
});