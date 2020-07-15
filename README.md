geomag-map
=====

Demo: [https://geomag-map.herokuapp.com/]

A visualisation of the world magnetic model for 2020-2024 onwards.

# Installation 
```
npm install 
```

# Data
Data is calculated in the geomag_api repository. A contour file has been generated for each year, which the map will request according to the browsers date.

Detailed clicks send requests to the geomag_api with info about the location & time of the click event. 

# Usage

## Local 
Run the server using
```
npm start 
```
