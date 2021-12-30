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
const apiKey = "9eae40a4431a1836c424f06650dd3e9d";

function handleHistory(city) {
    var searchHistory = JSON.parse(localStorage.getItem("history"));

    if (searchHistory == null) {
        searchHistory = [city];
    } else if (searchHistory.indexOf(city) === -1) {
        searchHistory.unshift(city);
    } else {
        searchHistory.splice(searchHistory.indexOf(city), 1);
        searchHistory.unshift(city);
    }

    localStorage.setItem("history", JSON.stringify(searchHistory));
    loadHistory();
}

// Render history in dropdown
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
};

// Render weather forecast cards
let writeData = data => {
    // Current weather
    var curr = data.current;
    current.html(`
    <h3>Temperature: ${Math.floor(curr.temp)} | Feels like: ${Math.floor(
        curr.feels_like
    )}</h3>
    <h3>${
        curr.weather[0].description
    }</h3> <img src="http://openweathermap.org/img/wn/${
        curr.weather[0].icon
    }@4x.png" />`);

    // Five-day forecast
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

        output += `<div class="col p-3 m-1 border rounded text-center">${date}
            <img src="http://openweathermap.org/img/wn/${weatherInfo.icon}@2x.png"/>
            <h4>${temp}</h4>
            <p>${weatherInfo.description}</p>
        </div>`;
    }
    fiveDay.html(output);
};

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
            console.log(data);
        })
        .catch(err => {
            console.log(err);
        });
};

// Geocode
let fetchCoords = city => {
    fetch(`${apiRootUrl}data/2.5/forecast?q=${city}&appid=${apiKey}`)
        .then(response => {
            if (response.status === 404) {
                $("#mainContent section h1").text(`${city} not found`);
                return;
            }
            return response.json();
        })
        .then(data => {
            $("#mainContent section h1").text(
                `Today in ${data.city.name}, ${data.city.country}`
            );
            fetchWeather(data.city.coord);
            handleHistory(city.replace("+", " "));
        })
        .catch(err => {
            console.log(err);
        });
};

//Events

// Search for user input
searchBtn.click(e => {
    e.preventDefault();
    if (searchInput.val() === "") {
        return;
    }
    var city = searchInput.val().replace(" ", "+");
    fetchCoords(city);
    searchInput.val(""); // Empty input field
});

// Recall city from history dropdown
recentSearches.click(e => {
    fetchCoords($(e.target).text());
});

// Clear 'history' key from storage
clearBtn.click(e => {
    e.preventDefault();
    localStorage.removeItem("history");
    loadHistory();
});

//Navigator API to use device location
let defaultCity = () => {
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        let coordObj = {
            lat: latitude,
            lon: longitude,
        };
        fetchWeather(coordObj);
    });
};

let pageLoad = () => {
    defaultCity();
    var searchHistory = JSON.parse(localStorage.getItem("history"));
    if (searchHistory == null) {
        return;
    } else {
        var output = "";
        searchHistory.forEach(i => {
            output += `<li><a class="dropdown-item" href="#">${i}</a></li>`;
        });
        recentSearches.html(output);
        // fetchCoords(searchHistory[0]);
    }
};

pageLoad();
