import urllib.request
import json
import ssl

def test_jupem_api():
    url = "https://kom.kul.jupem.gov.my/data/select/ekadas/CSRS.NDCDBLOT:NEGERI,DAERAH,MUKIM,SEKSYEN,LOT,UPI,PA,TARIKH_KEMASKINI,MI_PRINX,GEOLOC?$geometryFormat=geojson&$limit=10"
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
            print("Status Code:", response.getcode())
            data = response.read().decode('utf-8')
            print("Response:", data[:500])
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test_jupem_api()
