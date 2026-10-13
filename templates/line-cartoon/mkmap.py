#!/usr/bin/env python3
"""Thailand province map -> simplified SVG paths in a 1000-wide frame (map.json).

Source: geoBoundaries THA ADM1 (CC BY 3.0 IGO). Download once:
  curl -L -o tha-adm1.geojson \\
    https://github.com/wmgeolab/geoBoundaries/raw/main/releaseData/gbOpen/THA/ADM1/geoBoundaries-THA-ADM1.geojson
  python3 mkmap.py tha-adm1.geojson

Flags the Isan (north-east) provinces and Nakhon Ratchasima, and stores two named points
used by the example video. Change ISAN / HIGHLIGHT / POINTS for your own story; never
invent a border, always cite the source on the end card.
"""
import json, math, sys

if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help"):
    print(__doc__); sys.exit(0 if len(sys.argv) > 1 else 1)
g = json.load(open(sys.argv[1]))
ISAN = {'Amnat Charoen','Bueng Kan','Buri Ram','Chaiyaphum','Kalasin','Khon Kaen','Loei','Maha Sarakham','Mukdahan','Nakhon Phanom','Nakhon Ratchasima','Nong Bua Lam Phu','Nong Khai','Roi Et','Sakon Nakhon','Si Sa Ket','Surin','Ubon Ratchathani','Udon Thani','Yasothon'}
HIGHLIGHT = 'Nakhon Ratchasima'
POINTS = {'korat': (102.1017, 14.9675), 'nonsung': (102.2500, 15.1800)}  # lon, lat
def polys(geom): return geom['coordinates'] if geom['type']=='MultiPolygon' else [geom['coordinates']]
pts=[c for f in g['features'] for p in polys(f['geometry']) for r in p for c in r]
lo0,lo1=min(p[0] for p in pts),max(p[0] for p in pts); la0,la1=min(p[1] for p in pts),max(p[1] for p in pts)
k=math.cos(math.radians((la0+la1)/2)); S=1000/((lo1-lo0)*k)
P=lambda x,y:(round((x-lo0)*k*S),round((la1-y)*S))
def path(rings,th=3.0,minlen=6):
    d=[]
    for ring in rings:
        seg=[];last=None
        for x,y in ring:
            px,py=P(x,y)
            if last and abs(px-last[0])+abs(py-last[1])<th: continue
            seg.append(f"{px} {py}");last=(px,py)
        if len(seg)>=minlen: d.append("M"+"L".join(seg)+"Z")
    return "".join(d)
out={'w':1000,'h':round((la1-la0)*S),'prov':[],'pts':{},'source':'geoBoundaries THA ADM1 (CC BY 3.0 IGO)'}
names=set()
for f in g['features']:
    n=f['properties']['shapeName'].replace(' Province','');names.add(n)
    rings=[r for p in polys(f['geometry']) for r in p]
    out['prov'].append({'n':n,'isan':n in ISAN,'korat':n==HIGHLIGHT,'d':path(rings)})
print('missing isan:',ISAN-names)
for name,(lon,lat) in POINTS.items(): out['pts'][name]=P(lon,lat)
json.dump(out,open('map.json','w'),separators=(',',':'))
print(out['h'],len(out['prov']),sum(p['isan'] for p in out['prov']),out['pts'])
