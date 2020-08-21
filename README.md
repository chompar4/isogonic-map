isogonic-map
=====

An accurate presentation of current isogonic lines for the date set in the browser. 
Isogonic lines are displayed for the 6th of June in the current year.

Detailed clicks send requests to the isogonic-api with info about the location & time of the click event. 

<img src="assets/map-example.png">

Live: [https://geomag-map.herokuapp.com/]

# About 
The earths magnetic field drifts with time by varying amounts depending on the location of consideration.
Precise navigation is affected over time
by this drift, to the tune of up to 2 degrees every 5 years. The map displays the
current contours and values for magnetic declination to two significant figures, 
calculated using the world magnetic model.

<img src="assets/drift.png">

# Installation 
```
npm install 
```

## Local 
Run the server using
```
npm start 
```
