gr <- sf::st_read("https://github.com/tnc-ny-science/NYC_GreenRoofMapping/raw/master/greenroof_gisdata/CurrentDatasets/GreenRoofData2016_20180917.geojson")

str(gr)
names(gr)

library(jsonlite)

library(leaflet)


install.packages("geojsonio")
library(geojsonio)


x <- readLines("https://github.com/tnc-ny-science/NYC_GreenRoofMapping/raw/master/greenroof_gisdata/CurrentDatasets/GreenRoofData2016_20180917.geojson")
z <- geo2topo(x)


x <- geojson_read("https://github.com/tnc-ny-science/NYC_GreenRoofMapping/raw/master/greenroof_gisdata/CurrentDatasets/GreenRoofData2016_20180917.geojson")
z <- geo2topo(x)

str(x)

test <- geojson_sf(gr)

x <- geojson_atomize(gr)

x <- geojson_json(sf::st_transform(gr, 3857))
z <- geo2topo(x)

help(jsonlite::prettify)

test <- leaflet() %>% 
  addTiles() %>%
  addPolygons(data=gr)


library(htmlwidgets)
saveWidget(test, "D:/Test")
