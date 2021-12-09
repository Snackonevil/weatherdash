// Geocode http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}

// Geocode by Zip http://api.openweathermap.org/geo/1.0/zip?zip={zip code},{country code}&appid={API key}

// One Call https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}

// 5day 3 hour forecast data/2.5/forecast?q={city name}&appid=

// Icon Source http://openweathermap.org/img/wn/10d@2x.png

// Selectors
var searchInput = $("#searchInput");
const searchBtn = $("#searchBtn");
const mainContent = $("#mainContent");
var recentSearches = $("#recents");
const current = $("#current");
const fiveDay = $("#five-day");
const clearBtn = $("#clearBtn");

// Global Variables
const apiRootUrl = "https://api.openweathermap.org/";
const apiKey = "19f6c11012fcd19bbfc2f0188a37308e";
var searchHistory = ["atlanta", "san diego", "virginia beach"];

let handleHistory = city => {
    var searchHistory = JSON.parse(localStorage.getItem("history"));
    console.log(searchHistory.indexOf(city));
};

let loadHistory = () => {
    var searchHistory = JSON.parse(localStorage.getItem("history"));
    if (searchHistory == null) {
        return;
    }
    var output = "";
    searchHistory.forEach(i => {
        output += `<li><a class="dropdown-item" href="#">${i}</a></li>`;
    });
    recentSearches.html(output);
    fetchCoords(searchHistory[0]);
};

let writeData = data => {
    var curr = data.current;
    console.log(curr);
    current.html(`
    <h3>Temperature: ${Math.floor(curr.temp)} | Feels like: ${Math.floor(
        curr.feels_like
    )}</h3>
    <h3>${
        curr.weather[0].description
    }</h3> <img src="http://openweathermap.org/img/wn/${
        curr.weather[0].icon
    }@4x.png" />`);

    var output = "";
    for (let i = 1; i < 6; i++) {
        var day = data.daily;
        var temp = Math.floor(day[i].temp.max);
        // Reformat date from Unix
        var weatherInfo = day[i].weather[0];
        var unixMillisec = day[i].dt * 1000;
        var dateObject = new Date(unixMillisec);
        var date = dateObject.toLocaleString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        });

        output += `<div class="col p-3 m-1 border rounded text-center">${date}<img src="http://openweathermap.org/img/wn/${weatherInfo.icon}@2x.png"/><h4>${temp}</h4><p>${weatherInfo.description}</p></div>`;
        console.log(day[i].temp.max);
    }
    fiveDay.html(output);
    console.log(data);
};
{
    /* <img src="http://openweathermap.org/img/wn/${curr.weather[0].icon}.png /> */
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
            $("#mainContent section h1").text(
                `Today in ${data.city.name}, ${data.city.country}`
            );
            fetchWeather(data.city.coord);
        })
        .catch(err => {
            console.log(err);
        });
};

searchBtn.click(e => {
    if (searchInput.val() === "") {
        return;
    }
    e.preventDefault();
    //   console.log(typeof searchInput.val());
    //   if (typeof searchInput.val() == "number") {
    //     var zip = searchInput.val();
    //     fetchFromZip(zip);
    //   } else {
    // console.log(searchInput.val());
    var city = searchInput.val().replace(" ", "+");
    fetchCoords(city);
    searchInput.val("");
});

recentSearches.click(e => {
    handleHistory($(e.target).text());
    // fetchCoords($(e.target).text());
    // city = e.target.val()
    // fetchCoords(e.target.text());
});

clearBtn.click(e => {
    e.preventDefault();
    localStorage.clear();
    loadHistory();
});

loadHistory();
// dateObject.toLocaleString("en-US", {weekday: "long", month: "long", day: "numeric"}) // Monday
// dateObject.toLocaleString("en-US", {month: "long"}) // December
// dateObject.toLocaleString("en-US", {day: "numeric"}) // 9
// dateObject.toLocaleString("en-US", {year: "numeric"}) // 2019
// dateObject.toLocaleString("en-US", {hour: "numeric"}) // 10 AM
// dateObject.toLocaleString("en-US", {minute: "numeric"}) // 30
// dateObject.toLocaleString("en-US", {second: "numeric"}) // 15
// dateObject.toLocaleString("en-US", {timeZoneName: "short"}) // 12/9/2019, 10:30:15 AM CST
