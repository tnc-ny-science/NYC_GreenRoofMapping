-- All of this is using a 2017 Building Footprint dataset because BBL was already joined.
--To identify green roof areas overlapping multiple buildings (and require fixing)
select id, count(id) as idcnt, qa_notes from (select id, gr.qa_notes,  st_multi(st_intersection(gr.geom_2263, bd.geom_2263)), bd.bin 
from results_greenroof.greenroofresults_qa_20180912 gr join infrastructure.nycbldgs_201708 bd on st_intersects(bd.geom_2263, gr.geom_2263) 
--where qa_notes like 'Good%'
) as foo
group by id, qa_notes order by idcnt desc, id;

--To get bin, bbl, etc. for green roofs, as well as green roof area and such.
-- still includes areas as 'probably planters and such.
create
	table
		results_greenroof.greenroofs_qa_20180918_bin201708_mappluto18v1 as 
		select
			gr.id,
			bd.bin,
			bd.bbl,
			gr.geom_2263,
			st_area( gr.geom_2263 ) as gr_area,
			st_area( bd.geom_2263 ) as bldg_area,
			st_area( gr.geom_2263 )/ st_area( bd.geom_2263 ) as prop_gr,
			bd.cnstrct_yr,
			bd.doitt_id,
			bd.heightroof,
			bd.feat_code,
			bd.groundelev,
			gr.qa_notes as qa,
			gr.notes,
			gr.classified,
			gr.digitized,
			gr.newlyadded,
			gr.gr_source as original_source,
			--pluto.ownername,
			pluto.address,
			pluto.borough,
			pluto.ownertype,
			pluto.zonedist1,
			pluto.spdist1
		from
			results_greenroof.greenroofresults_qa_20180912 gr
		left join infrastructure.nycbldgs_201708 bd on
				st_intersects( gr.geom_2263, bd.geom_2263 )
		left join admin.mappluto_citywide18v1 pluto on pluto.bbl::numeric=bd.bbl::numeric
		where gr.qa_notes like 'Good%';

			
select bin, count(bin) as cnt from results_greenroof.greenroofs_qa_20180914_bin201708_bbl
group by bin order by cnt desc