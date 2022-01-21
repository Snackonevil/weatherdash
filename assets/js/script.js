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

// Pulls history from local storage

function handleHistory(city) {
    var searchHistory = JSON.parse(localStorage.getItem("history"));
    // if empty, adds city,
    if (searchHistory == null) {
        searchHistory = [city];
        // if not searched before, adds to front
    } else if (searchHistory.indexOf(city) === -1) {
        searchHistory.unshift(city);
    } else {
        // if searched before, removes from current index and adds it to front of list to be retrieved first,
        searchHistory.splice(searchHistory.indexOf(city), 1);
        searchHistory.unshift(city);
    }

    localStorage.setItem("history", JSON.stringify(searchHistory));
    loadHistory();
}

// Render history in dropdown menu
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
    var uvColor = "";
    if (curr.uvi < 3) {
        uvColor = "success";
    } else if (curr.uvi >= 3 && curr.uvi <= 5) {
        uvColor = "warning";
    } else {
        uvColor = "danger";
    }
    // Today's forecast populated with data using string interolation
    current.html(`
    <h3>Temperature: ${Math.floor(curr.temp)}F | Feels like: ${Math.floor(
        curr.feels_like
    )}F</h3>
    <div class="row"><img class="col-md-3 col-sm-12"src="https://openweathermap.org/img/wn/${
        curr.weather[0].icon
    }@4x.png" />
    <div class="col-md-3 col-sm-12 p-5">
        <h4>${curr.humidity}% humidity</h4>
        <h4>${Math.floor(curr.wind_speed)} mph winds</h4>
        <h4>UV Index: <span class="text-${uvColor}">${curr.uvi}
</span></h4>
<h3>${curr.weather[0].description}</h3> 
    </div>
    </div>`);

    // Five-day forecast; generate HTML cards
    // Init variable to hold HTML
    var output = "";
    // Iterate through 5 days
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
        // Five-day markup appended to output variable
        output += `<div class="col-lg col-md-12 col-sm-12 p-3 m-1 border rounded text-center">${date}
            <img src="https://openweathermap.org/img/wn/${
                weatherInfo.icon
            }@2x.png"/>
            <h4>${temp}F</h4>
            <h5>${day[i].humidity}% Humidity</h5>
            <h5>${Math.floor(day[i].wind_speed)} mph winds</h5>
            <p>${weatherInfo.description}</p>
        </div>`;
    }
    // Render HTML
    fiveDay.html(output);
};

// OneCall Weather API fetch by Coordinates
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

// Geocode: OneCall Weather API fetch by city to retrieve city coordinates
let fetchCoords = city => {
    fetch(`${apiRootUrl}data/2.5/forecast?q=${city}&appid=${apiKey}`)
        .then(response => {
            if (response.status === 404) {
                $("#mainContent section h1").text(`"${city}" not found`);
                $("#mainContent div h1").text("please enter city");
                $("#current").html("");
                $("#five-day").html("");
                return;
            }
            return response.json();
        })
        .then(data => {
            $("#mainContent section h1").text(
                `Now in ${data.city.name}, ${data.city.country}`
            );
            $("#mainContent div h1").text("5-Day Forecast");
            fetchWeather(data.city.coord);
            handleHistory(city.replace("+", " "));
        })
        .catch(err => {
            console.log(err);
        });
};

// Events

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
    window.location.reload();
});

// Navigator API to use device location
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

// Populate page with weather from device location and retrieves history
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

// Initilize on load
pageLoad();
