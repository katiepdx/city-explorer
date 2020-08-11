const express = require('express')
require('dotenv').config();
const cors = require('cors');
const request = require('superagent');
// const { geoData } = require('./data/geo.js');
// const weatherData = require('./data/weather.js');
const app = express();
const PORT = process.env.PORT || 3000;

// let things talk to each other 
app.use(cors());
app.use(express.static('public'));

// Deconstruct 
const {
    GEOCODE_API_KEY,
    WEATHER_API_KEY
} = process.env;

// get lat/long function. takes in a city and returns the lat long of city
async function getLatLong(cityName) {
    // make an api call...using cityName for location
    const response = await request.get(`https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${cityName}&format=json`);

    //get the first city from response
    const city = response.body[0];

    // munge the data so it has the correct properties 
    return {
        formatted_query: city.display_name,
        latitude: city.lat,
        longitude: city.lon,
    };
}

//location endpoint - make async
app.get('/location', async (req, res) => {
    //try this
    try {
    //user search
    const userInput = req.query.search

    // since getLatLong is async, now need to AWAIT it
    const mungedData = await getLatLong(userInput);
    //json response
    res.json(mungedData)
    // give error message if there is an error
    } catch (e) {
        //error message 
        res.status(500).json({ error: e.message})
    }
})

async function getWeather(lat, lon){
    //pretend to make api call to get the weather for the lat lon
    const response = await request.get(`https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lon}&key=${WEATHER_API_KEY}`)

    let data = response.body.data;
    //get 8 days
    data = data.slice(0, 8)
    const forecastArr = data.map((weatherItem) => {
        return {
            forecast: weatherItem.weather.description,
            // convert to seconds
            time: new Date(weatherItem.ts * 1000),
        }
    })
    return forecastArr;
}

//weather endpoint
// goes into data and gets an array of obj with properties of forecast and time objs.
app.get('/weather', async (req, res) => {
    try {
        const userLat = req.query.latitude
        const userLon = req.query.longitude

        // get the forecast and time for those lat and lon
        const mungedData = await getWeather(userLat, userLon);
        //json response
        res.json(mungedData)
    } catch(e) {
        //error message 
        res.status(500).json({ error: e.message})
    }
})

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})