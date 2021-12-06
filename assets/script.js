// Geocode http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}

// Geocode by Zip http://api.openweathermap.org/geo/1.0/zip?zip={zip code},{country code}&appid={API key}

// One Call https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}

// 5day 3 hour forecast data/2.5/forecast?q={city name}&appid=

// Icon Source http://openweathermap.org/img/wn/10d@2x.png

var searchInput = $("#searchInput");
const searchBtn = $("#searchBtn");
const mainContent = $("#mainContent");
var recentSearches = $("#recents");
const current = $("#current");
const fiveDay = $("#five-day");

const apiRootUrl = "https://api.openweathermap.org/";
const apiKey = "19f6c11012fcd19bbfc2f0188a37308e";

let writeData = data => {
    var currTemp = data.current;
    console.log(currTemp);
    current.html(`
    <h3>Temperature: ${Math.floor(currTemp.temp)} | Feels like: ${Math.floor(
        currTemp.feels_like
    )}</h3>
    <h3>${
        currTemp.weather[0].description
    }</h3> <img src="http://openweathermap.org/img/wn/${
        currTemp.weather[0].icon
    }@4x.png" />`);

    var output = "";
    for (let i = 0; i < 5; i++) {
        var day = data.daily;
        var temp = Math.floor(day[i].temp.max);
        var weatherInfo = day[i].weather[0];
        var unixMillisec = day[i].dt * 1000;
        var dateObject = new Date(unixMillisec);
        var date = dateObject.toLocaleString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        });

        output += `<div class="col-12 p-1 m-1 border rounded"><h4>${date}</h4>${temp}<img src="http://openweathermap.org/img/wn/${weatherInfo.icon}.png" /><p>${weatherInfo.description}</div>`;
        console.log(day[i].temp.max);
    }
    fiveDay.html(output);
    console.log(data);
};
{
    /* <img src="http://openweathermap.org/img/wn/${currTemp.weather[0].icon}.png /> */
}
// let fetchFromZip = (zip) => {
//   fetch(`${apiRootUrl}geo/1.0/zip?zip=${zip}&appid=${apiKey}`)
//     .then((response) => {
//       return response.json();
//     })
//     .then((data) => {
//       console.log(data);
//       fetchWeather(data.city.coord);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

// OneCall Weather
let fetchWeather = coordObj => {
    fetch(
        `${apiRootUrl}data/2.5/onecall?lat=${coordObj.lat}&lon=${coordObj.lon}&exclude=hourly,minutely&units=imperial&appid=${apiKey}`
    )
        .then(response => {
            return response.json();
        })
        .then(data => {
            writeData(data);
        })
        .catch(err => {
            console.log(err);
        });
};

// Geocode
let fetchCoords = city => {
    fetch(`${apiRootUrl}data/2.5/forecast?q=${city}&appid=${apiKey}`)
        .then(response => {
            return response.json();
        })
        .then(data => {
            console.log(data);
            fetchWeather(data.city.coord);
        })
        .catch(err => {
            console.log(err);
        });
};

searchBtn.click(e => {
    e.preventDefault();
    //   console.log(typeof searchInput.val());
    //   if (typeof searchInput.val() == "number") {
    //     var zip = searchInput.val();
    //     fetchFromZip(zip);
    //   } else {
    // console.log(searchInput.val());
    var city = searchInput.val().replace(" ", "+");
    fetchCoords(city);
});

// dateObject.toLocaleString("en-US", {weekday: "long", month: "long", day: "numeric"}) // Monday
// dateObject.toLocaleString("en-US", {month: "long"}) // December
// dateObject.toLocaleString("en-US", {day: "numeric"}) // 9
// dateObject.toLocaleString("en-US", {year: "numeric"}) // 2019
// dateObject.toLocaleString("en-US", {hour: "numeric"}) // 10 AM
// dateObject.toLocaleString("en-US", {minute: "numeric"}) // 30
// dateObject.toLocaleString("en-US", {second: "numeric"}) // 15
// dateObject.toLocaleString("en-US", {timeZoneName: "short"}) // 12/9/2019, 10:30:15 AM CST
