// Geocode http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}

// Geocode by Zip http://api.openweathermap.org/geo/1.0/zip?zip={zip code},{country code}&appid={API key}

// One Call https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}

// 5day 3 hour forecast data/2.5/forecast?q={city name}&appid=

// Icon Source http://openweathermap.org/img/wn/10d@2x.png

// unix to UTC conversion
// const unixTimestamp = 1575909015
// const milliseconds = 1575909015 * 1000 // 1575909015000
// const dateObject = new Date(milliseconds)
// const humanDateFormat = dateObject.toLocaleString() //2019-12-9 10:30:15
var searchInput = $("#searchInput");
const searchBtn = $("#searchBtn");
const mainContent = $("#mainContent");
var recentSearches = $("#recents");

const apiRootUrl = "https://api.openweathermap.org/";
const apiKey = "19f6c11012fcd19bbfc2f0188a37308e";
var city = "atlanta";

let writeData = (data) => {
  var currTemp = data.current;
  console.log(currTemp);
  for (let i = 0; i < 5; i++) {
    var day = data.daily;
    console.log(day[i].temp);
  }
  console.log(data);
};

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

// One Call
let fetchWeather = (coordObj) => {
  fetch(
    `${apiRootUrl}data/2.5/onecall?lat=${coordObj.lat}&lon=${coordObj.lon}&exclude=hourly,minutely&units=imperial&appid=${apiKey}`
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      writeData(data);
    })
    .catch((err) => {
      console.log(err);
    });
};

// Geocode
let fetchCoords = (city) => {
  fetch(`${apiRootUrl}data/2.5/forecast?q=${city}&appid=${apiKey}`)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      fetchWeather(data.city.coord);
    })
    .catch((err) => {
      console.log(err);
    });
};

searchBtn.click((e) => {
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
