# Make sure packages are installed
# install.packages("leaflet")
# install.packages("leaflet.extras")
# install.packages("readr")



library(leaflet)

library(leaflet.extras)



fName <- 'https://raw.githubusercontent.com/tnc-ny-science/NYC_GreenRoofMapping/master/greenroof_gisdata/20180220_bbl_bin/greenroofs_bbl_bin_20180220.GeoJSON'

geoJson <- readr::read_file(fName)

leaf %>% setView(-74.0060, 40.7128, 11) %>%
  addBootstrapDependency() %>%
  addGeoJSONChoropleth(
    geoJson,
    valueProperty = 'square_feet',
    scale = c('white','red'), mode='q', steps = 4, padding = c(0.2,0),
    labelProperty='id',
     popupProperty=propstoHTMLTable(
       props = c('id', 'square_feet', 'bbl_bldgs', 'address_pluto'),
       table.attrs = list(class='table table-striped table-bordered'),drop.na = T),
    color='#ffffff', weight=1, fillOpacity = 0.7,
    highlightOptions = highlightOptions(
      weight=2, color='#000000',
      fillOpacity=1, opacity =1,
      bringToFront=TRUE, sendToBack=TRUE),
    legendOptions = legendOptions(title='Area in Sq. Feet'),
    group = 'reds') %>%
  addGeoJSONChoropleth(
    geoJson,
    valueProperty = 'square_feet',
    scale = c('yellow','red', 'black'), mode='q', steps = 4,
    bezierInterpolate = TRUE,
    labelProperty='id',
     popupProperty=propstoHTMLTable(
       props = c('id', 'square_feet', 'bbl_bldgs', 'address_pluto'),
       table.attrs = list(class='table table-striped table-bordered'),drop.na = T),
    color='#ffffff', weight=1, fillOpacity = 0.7,
    highlightOptions = highlightOptions(
      weight=2, color='#000000',
      fillOpacity=1, opacity =1,
      bringToFront=TRUE, sendToBack=TRUE),
    legendOptions = legendOptions(title='Area in Sq. Ft'),
    group = 'yellow-black'
  ) %>%
  addLayersControl(baseGroups = c('reds','yellow-black'),
                   options = layersControlOptions(collapsed=FALSE))



#Example code from here: http://rpubs.com/bhaskarvk/geojsonv2

# Original
fName <- 'https://rawgit.com/benbalter/dc-maps/master/maps/ward-2012.geojson'

geoJson <- readr::read_file(fName)

leaf %>% setView(-77.0369, 38.9072, 11) %>%
  addBootstrapDependency() %>%
  addGeoJSONChoropleth(
    geoJson,
    valueProperty = 'AREASQMI',
    scale = c('white','red'), mode='q', steps = 4, padding = c(0.2,0),
    labelProperty='NAME',
    popupProperty=propstoHTMLTable(
      props = c('NAME', 'AREASQMI', 'REP_NAME', 'WEB_URL', 'REP_PHONE', 'REP_EMAIL', 'REP_OFFICE'),
      table.attrs = list(class='table table-striped table-bordered'),drop.na = T),
    color='#ffffff', weight=1, fillOpacity = 0.7,
    highlightOptions = highlightOptions(
      weight=2, color='#000000',
      fillOpacity=1, opacity =1,
      bringToFront=TRUE, sendToBack=TRUE),
    legendOptions = legendOptions(title='Area in Sq. Miles'),
    group = 'reds') %>%
  addGeoJSONChoropleth(
    geoJson,
    valueProperty = 'AREASQMI',
    scale = c('yellow','red', 'black'), mode='q', steps = 4,
    bezierInterpolate = TRUE,
    labelProperty='NAME',
    popupProperty=propstoHTMLTable(
      props = c('NAME', 'AREASQMI', 'REP_NAME', 'WEB_URL', 'REP_PHONE', 'REP_EMAIL', 'REP_OFFICE'),
      table.attrs = list(class='table table-striped table-bordered'),drop.na = T),
    color='#ffffff', weight=1, fillOpacity = 0.7,
    highlightOptions = highlightOptions(
      weight=2, color='#000000',
      fillOpacity=1, opacity =1,
      bringToFront=TRUE, sendToBack=TRUE),
    legendOptions = legendOptions(title='Area in Sq. Miles'),
    group = 'yellow-black'
  ) %>%
  addLayersControl(baseGroups = c('reds','yellow-black'),
                   options = layersControlOptions(collapsed=FALSE))
