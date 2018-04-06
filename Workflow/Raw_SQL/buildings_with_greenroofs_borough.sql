--Get All buildings with y identified green roofs, along with borough names. Might miss some that were previously known but not classified
--only currently set for manhattan, bx, and si drop
--Run in nycgis database locally
	table
		test.gr_bldgs_newgr_20180406;

select
	distinct nycbldgs_201708.*,
	boroname into
		test.gr_bldgs_newgr_20180406
	from
		infrastructure.nycbldgs_201708,
		infrastructure.greenroofs_classified_thinned_20180405,
		staging.boroughs_nowater,
		infrastructure.greenroofs_bbl_bin_20180220
	where
		st_intersects(
			nycbldgs_201708.geom_2263,
			greenroofs_classified_thinned_20180405.geom_2263
		)
		and st_intersects(
			greenroofs_classified_thinned_20180405.geom_2263,
			boroughs_nowater.geom_2263
		)
		and(
			boroname like 'Manhattan'
			or boroname like 'Bronx'
			or boroname like 'Staten Island'
		);

