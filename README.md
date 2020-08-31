# Restaurant Review App

## Run The Project

To run this project locally

- Download and extract the contents from the zip file

- Open `index.html` with a text editor

- From the `script` tag on `line 204` replace the string 'API_KEY' with a valid Google Maps API key

- Open the `js` folder

- Find and open the file `api-config.js`

- On `line 8` replace the string '**API_KEY**' with a valid Google Maps API key

- From the extracted folder start up a simple local HTTP server to serve up the site files on your local computer.
  
  ###### Using VS Code Live Server Extension (RECOMMENDED):
  
  - If you have VS Code installed, install the live server extension
    by Ritwick Dey.
    by and launch the project from within VS Code.
  - The extension and any other information can be found
    [here](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
  
  ###### Using Python:
  
  - Launch your command line terminal
  - Confirm the version of Python you have using the command: `python -V`.
  - For Python version `2.x`, start the server with the command:
    `python -m SimpleHTTPServer 8000` (or some other port/your
    preferred port number, if
    port 8000 is already in use.)
  - For Python version `3.x`, you can use the command `python3 -m http.server 8000`
  - If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.
  
  ###### Using live-server
  
  - Install [Nodejs](https://nodejs.org)
  
  - Instructions for live-server can be found [here](https://www.npmjs.com/package/live-server)

- With your local server running, visit the site: `http://localhost:{portNumber}` in Chrome or in your preferred browser.
