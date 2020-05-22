import csv
import json
import http.server
import socketserver

countyData = {}
data = {}

with open('Summary.csv') as csvFile:
   csvReader = csv.DictReader(csvFile)
   for row in csvReader:
      countyData[row['County']] = {
         'Tested' : row['Individuals Tested'],
         'Positive' : row['Individuals Positive'],
         'Recovered' : row['Total Recovered'],
         'Deaths' : row['Total Deaths'],
         'Active' : int(row['Individuals Positive']) - (int(row['Total Recovered']) + int(row['Total Deaths']))
      }
#need to download this
with open("IA_COVID19_Cases.geojson", "r") as read_file:
    data = json.load(read_file)

for county in data['features']:
   name = county['properties']['Name']
   if name == 'Obrien':
      name = 'O\'Brien'
   try:
      props = countyData[name]
      county['properties']['Recovered'] = int(props['Recovered'])
      county['properties']['Active'] = int(props['Active'])
      county['properties']['Deaths'] = int(props['Deaths'])
      county['properties']['Confirmed'] = int(props['Positive'])
      county['properties']['Tested'] = int(props['Tested'])
   except:
      county['properties']['Active'] = None
      county['properties']['Tested'] = None

with open("data_file.geojson", "w") as write_file:
    json.dump(data, write_file)


class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', '*')
        http.server.SimpleHTTPRequestHandler.end_headers(self)

PORT = 31338
Handler = CORSHTTPRequestHandler
httpd = socketserver.TCPServer(("", PORT), Handler)

print ("serving at port", PORT)
httpd.serve_forever()