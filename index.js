const express = require('express')
require('dotenv').config();
const cors = require('cors');
const { geoData } = require('./data/geo.js');
const weatherData = require('./data/weather.js');
const app = express();
const port = process.env.PORT || 3000;

// End point
app.get('/', (req, res) => {
  res.send('HELLLLOOOOOOOOOOOO WORLD!')
})

// Another end point
// Need to go to localhost:3000/coffee to see res.send msg. console logs are in console.
app.get('/coffee', (req, res) => {
    console.log('I like coffee.');
    console.log(req.headers);
    res.send('Coffee is awesome!')
})

// Query params exercise 
// respond with a string that uses some query params
app.get('/params', (req, res) => {
    console.log(req.query.username);
    console.log(req.query.password);

    // res.send(`Hello, ${req.query.username}! Your password is ${req.query.password}.`)
    res.json({
        name: req.query.username,
        code: req.query.password
    })
})

// let things talk to each other 
app.use(cors());
app.use(express.static('public'));

// get lat/long function. takes in a city and returns the lat long of city
function getLatLong(cityName) {
    // make an api call...it's hard coded right now.
    const city = geoData[0];

    // munge the data so it has the correct properties 
    return {
        formatted_query: city.display_name,
        latitude: city.lat,
        longitude: city.lon,
    }
}

function getWeather(lat, lon){
    //pretend to make api call to get the weather for the lat lon
    const data = weatherData.data;

    const forecastArr = data.map((weatherItem) => {
        return {
            forecast: weatherItem.weather.description,
            // convert to seconds
            time: new Date(weatherItem.ts * 1000),
        }
    })
    return forecastArr;
}

//location endpoint
app.get('/location', (req, res) => {
    //try this
    try {
    //user search
    const userInput = req.query.search

    // callback 
    const mungedData = getLatLong(userInput);
    //json response
    res.json(mungedData)
    // give error message if there is an error
    } catch (e) {
        //error message 
        res.status(500).json({ error: e.message})
    }
})

//weather endpoint
// goes into data and gets an array of obj with properties of forecast and time objs.
app.get('/weather', (req, res) => {
    try {
        //user search
        const userInput = req.query.search

        const userLat = req.query.latitude
        const userLon = req.query.longitude

        // get the forecast and time for those lat and lon
        const mungedData = getWeather(userLat, userLon);
        //json response
        res.json(mungedData)
    } catch(e) {
        //error message 
        res.status(500).json({ error: e.message})
    }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})