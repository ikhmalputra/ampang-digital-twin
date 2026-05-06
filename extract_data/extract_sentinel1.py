import urllib.request
import urllib.parse
import json
from datetime import datetime

def search_sentinel1_ampang():
    print("Searching for latest Sentinel-1 SAR imagery over Ampang...")
    print("Using Copernicus Data Space Ecosystem API (OData v1)")
    
    # Bounding box covering Ampang and central KL
    # POLYGON((min_lon min_lat, max_lon min_lat, max_lon max_lat, min_lon max_lat, min_lon min_lat))
    polygon = "POLYGON((101.65 3.10, 101.80 3.10, 101.80 3.25, 101.65 3.25, 101.65 3.10))"
    
    # Query parameters
    # Collection: SENTINEL-1
    # ProductType: GRD (Ground Range Detected - best for flood mapping)
    # Order by ContentDate desc to get the latest
    
    # Use a pre-encoded URL string that is known to work with OData
    url = (
        "https://catalogue.dataspace.copernicus.eu/odata/v1/Products"
        "?$filter=OData.CSC.Intersects(area=geography'SRID=4326;POLYGON((101.65%203.10,101.80%203.10,101.80%203.25,101.65%203.25,101.65%203.10))')"
        "%20and%20Collection/Name%20eq%20'SENTINEL-1'"
        "&$orderby=ContentDate/Start%20desc&$top=5"
    )
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            products = data.get('value', [])
            
            print(f"\nFound {len(products)} recent Sentinel-1 GRD products for Ampang:")
            
            for idx, p in enumerate(products, 1):
                print(f"\n--- Product {idx} ---")
                print(f"Name: {p.get('Name')}")
                print(f"Date: {p.get('ContentDate', {}).get('Start')}")
                print(f"Size: {int(p.get('ContentLength', 0)) / (1024*1024):.2f} MB")
                print(f"Download ID: {p.get('Id')}")
                print(f"Download URL: https://zipper.dataspace.copernicus.eu/odata/v1/Products({p.get('Id')})/$value")
                
            print("\n*** IMPORTANT NOTE ***")
            print("To actually download the large Sentinel-1 imagery (usually ~1GB each), you must:")
            print("1. Register an account at https://dataspace.copernicus.eu/")
            print("2. Generate an access token using your credentials.")
            print("3. Use the token in the 'Authorization: Bearer <token>' header when hitting the Download URLs above.")
            print("Alternatively, you can use the 'xarray-sentinel' or 'sentinelsat' python packages.")
            
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} - {e.reason}")
        print("Detailed error:", e.read().decode())
    except Exception as e:
        print(f"Error querying Sentinel-1 catalogue: {e}")

if __name__ == "__main__":
    search_sentinel1_ampang()
