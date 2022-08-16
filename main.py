import os
from http.server import HTTPServer, SimpleHTTPRequestHandler

API_URL = "https://cphapp.rema1000.dk/api/v1/catalog/store/1/departments"
DIRECTORY = "./public"
PORT = 8000

def import_api():
    os.system("curl {api_url} > ./public/file.json".format(api_url=API_URL))

class StaticServer(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, StaticServer)
    print("Serving files on localhost:{port}".format(port=PORT))
    httpd.serve_forever()

def main():
    import_api();
    run();

if __name__ == "__main__":
    main()
