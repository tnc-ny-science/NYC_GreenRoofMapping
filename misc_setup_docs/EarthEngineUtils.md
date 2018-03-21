#Setting up Docker Earth Engine Container. First need to install Docker though
export GCP_PROJECT_ID=GEE_v01 #Name Project
export CONTAINER_IMAGE_NAME=gcr.io/earthengine-project/datalab-ee:latest
export WORKSPACE=$workspace/datalab-ee #Define workspace
mkdir -p $WORKSPACE
cd $WORKSPACE

docker run -it -p "127.0.0.1:8081:8080" -v "$WORKSPACE:/content" -e "PROJECT_ID=$GCP_PROJECT_ID" $CONTAINER_IMAGE_NAME



#Installing earthengine command line tools from scratch - 
#Note - for sudo pip, need to use sudo -H pip
https://developers.google.com/earth-engine/python_install_manual

#to install gsutil see:
https://cloud.google.com/storage/docs/gsutil_install#deb 

#list projects available and set project to work in
gcloud projects list
gcloud config set project nyc2016-earthen
gcloud config set project nyctrees-178319

#to check current config
gcloud config set project nyc2016-earthen

#Set up google storage bucket
gsutil mb gs://nyc2016-ortho-temp-test1/

#migrate to location with desired data locally
cd ../../media/sf_Treglia_Data/MLT_GISData/US_Data/New\ York/NYC/nyc_ortho_2016_geotif/

#copy data from local to remote
gsutil cp 997275.tif gs://nyc2016-ortho-temp-test1/

#upload 
earthengine upload image --asset_id=users/mtreglia/nyc2016_997275_test gs://nyc2016-ortho-temp-test1/997275.tif


gsutil mb gs://nyc2016-ortho-temp-test2/
gsutil cp 000212.tif gs://nyc2016-ortho-temp-test2/
gsutil cp 000210.tif gs://nyc2016-ortho-temp-test2/

earthengine upload image --asset_id=users/mtreglia/nyc2016_00021x_test gs://nyc2016-ortho-temp-test2/*.tif

#Upload all files in google cloud storage bin to asset
earthengine upload image --asset_id users/mtreglia/nyc2016_00021x_test `gsutil ls 'gs://nyc2016-ortho-temp-test2/'`

gsutil mb gs://nyc2016-ortho-temp/
gsutil -m cp *.tif gs://nyc2016-ortho-temp/
earthengine upload image --asset_id users/mtreglia/nycdoitt2016_ortho `gsutil ls 'gs://nyc2016-ortho-temp/'`
