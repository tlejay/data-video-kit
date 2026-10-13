# Data recipes (Thai public data, all free)

Read when SKILL.md step 2 needs a second dataset. These are Thailand-specific; for other
countries look for the equivalent national statistics office, a CKAN open-data portal and
OpenStreetMap. Endpoints change: verify before relying on one.

**DOPA registered population by district** (context only, see `data-and-pairing.md`; no
key; registration offices include municipal offices, so aggregate tambon rows by `lsaa`):
`action=43&cc=<prov>&rcode=<prov>` lists the offices, then `action=44&cc=<prov>&rcode=<office>`
per office gives tambon rows with `lsaa` (district number) and `lssumtotTot`. Base URL
`https://stat.bora.dopa.go.th/stat/statnew/connectSAPI/stat_forward.php?API=/api/statpophouse/v1/statpop/list?...&yymmBegin=6712&yymmEnd=6712&statType=0&statSubType=999&subType=99`
(send a browser User-Agent; it is slow, about 4 s per call).

**OSM roads**: Overpass `way["ref"="2"]["highway"~"trunk|primary|motorway"](bbox);out geom;`
(retry another mirror on 504). Credit OpenStreetMap (ODbL).

**Province and district borders**: geoBoundaries (CC BY 3.0 IGO),
`https://github.com/wmgeolab/geoBoundaries` (`releaseData/gbOpen/THA/ADM1` or `ADM2`).

**Thai open data that actually downloads** (prefer these over scanned PDFs):
- Students per institution and province: MHESI `https://info.mhesi.go.th/open_data/univ_std_11_01_<year>_<sem>.csv`
  (`;`-separated, column `UNIV_PROVINCE_NAME`; some universities are missing from it).
- Labour force per province per quarter (household survey, i.e. people who actually live there):
  NSO `https://catalogapi.nso.go.th/api/index?table=ST_02_2005005_4&format=csv`. Other NSO tables:
  CKAN at `catalog.nso.go.th/api/3/action/package_search`.
- Any ministry's datasets: CKAN `gdcatalog.go.th/api/3/action/package_search?q=...`.
- Provincial CPI exists (`dataapi.moc.go.th/cpip-indexes?province_code=30&index_id=0000000000000000&from_year=..`)
  but was unreliable when tested; fall back to the regional figure from the trade-policy
  office's news and label it a proxy.
