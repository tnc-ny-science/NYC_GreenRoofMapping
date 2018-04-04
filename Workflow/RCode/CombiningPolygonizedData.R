#Dont' forget to fix file paths before running. ALso, can likely do removal of 0-value polygons in for loop/lapply
#install.packages("sf")
library(sf)

test <- st_read("polygons/gr_polygons_1.geojson")

#st_write(test, "polygons/test.shp")

help(st_write)

# The input file geodatabase
fgdb <- "D:/nyc_landcover_polygons.gdb"

## If needed, can list all feature classes in a file geodatabase
# subset(rgdal::ogrDrivers(), grepl("GDB", name))
# fc_list <- rgdal::ogrListLayers(fgdb)
# print(fc_list)

## Read the spatial data
t1 <- sf::st_read(dsn=fgdb,
                      layer="gr_polygons_1")
t1 <- t1[which(t1$gridcode != 0),]


t2 <- sf::st_read(dsn=fgdb,
                    layer="gr_polygons_2")
t2 <- t2[which(t2$gridcode != 0),]

t3 <- sf::st_read(dsn=fgdb,
                  layer="gr_polygons_3")
t3 <- t3[which(t3$gridcode != 0),]

t4 <- sf::st_read(dsn=fgdb,
                  layer="gr_polygons_4")
t4 <- t4[which(t4$gridcode != 0),]

t5 <- sf::st_read(dsn=fgdb,
                  layer="gr_polygons_5")
t5 <- t5[which(t5$gridcode != 0),]

t6 <- sf::st_read(dsn=fgdb,
                  layer="gr_polygons_6")
t6 <- t6[which(t6$gridcode != 0),]


gr_class_polys <- rbind(t1, t2, t3, t4, t5, t6)


str(gr_class_polys)


st_write(gr_class_polys, "polygons/gr_polys.shp")

st_write(st_transform(gr_class_polys, 4326), "polygons/gr_polys.GeoJSON")
