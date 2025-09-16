async function performFetchMeteo(latitude = 52.52, longitude = 13.41) {
  const baseUrl = "https://api.open-meteo.com/v1/forecast";
  const params = new URLSearchParams({
    latitude: latitude,
    longitude: longitude,
    current: "temperature_2m,wind_speed_10m,weather_code",
    daily: "sunrise,sunset",
    // hourly: "temperature_2m,relative_humidity_2m,wind_speed_10m"
  });
  
  const url = `${baseUrl}?${params}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

performFetchMeteo(40.693037688727834, -73.98712870610134) // New York coordinates
  .then(data => {console.log(JSON.stringify(data));
    displayWeather(data); 
    let word = "Temperature: " + data.current.temperature_2m + "°C, Wind Speed: " + data.current.wind_speed_10m + " km/h, VMO: " + data.current.weather_code + ", Time: " + data.current.time + ", Sunrise: " + data.daily.sunrise[0] + ", Sunset: " + data.daily.sunset[0];
    askReplicate(word, {x: window.innerWidth/2, y: window.innerHeight/2})});

function displayWeather(data) {
    const meteoDiv = document.createElement('div');

    meteoDiv.className = 'meteoDiv';
    meteoDiv.innerHTML = `
        <h2>Current Weather at 370 Jay Street</h2>
        <p>Temperature: ${data.current.temperature_2m}°C</p>
        <p>Wind Speed: ${data.current.wind_speed_10m} km/h</p>
        `;
        // <p>VMO: ${data.current.weather_code}</p>
        // <p>Time: ${data.current.time}</p>
        // <ul>
        //     <li>Sunrise: ${data.daily.sunrise[0]}</li>
        //     <li>Sunset: ${data.daily.sunset[0]}</li>
        // </ul>
       
    // ` ;
    
    document.body.appendChild(meteoDiv);
}

async function askReplicate(word, location) {
    const url = "https://itp-ima-replicate-proxy.web.app/api/create_n_get";
    //Get Auth Token from: https://itp-ima-replicate-proxy.web.app/
    let authToken = "";

    let prompt = "create a visual representation of what New York City Jay Street Metrotech would look like in the following weather forecast conditions based on the data provided: " + word + "the VMO can be interpreted using the following VMO codes: WMO Weather interpretation codes. Code Description 0	Clear sky 1, 2, 3	Mainly clear, partly cloudy, and overcast 45, 48	Fog and depositing rime fog 51, 53, 55	Drizzle: Light, moderate, and dense intensity 56, 57	Freezing Drizzle: Light and dense intensity 61, 63, 65	Rain: Slight, moderate and heavy intensity 66, 67	Freezing Rain: Light and heavy intensity71, 73, 75	Snow fall: Slight, moderate, and heavy intensity 77	Snow grains 80, 81, 82	Rain showers: Slight, moderate, and violent 85, 86	Snow showers slight and heavy 95 *	Thunderstorm: Slight or moderate 96, 99 *	Thunderstorm with slight and heavy hail";
    document.body.style.cursor = "progress";
    const data = {
        model: "leonardoai/lucid-origin",
        input: {
            prompt: prompt,
        },
    };
    console.log("Making a Fetch Request", data);
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: 'application/json',
            'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(data),
    };
    const raw_response = await fetch(url, options);
    //turn it into json
    const json_response = await raw_response.json();

    console.log("json_response", json_response);
    console.log("json_response.output", json_response.output[0]);
    displayImage(json_response.output[0]);
    document.body.style.cursor = "auto";
    let parsedResponse = JSON.parse(json_response.output.join(""));
    let responseCount = parsedResponse.length;
    let orbit = { x: 0, y: 0 };
    for (let i = 0; i < responseCount; i++) {
        let textResponse = parsedResponse[i];
        let radius = 100;
        orbit.x = location.x + radius * Math.cos(i * 2 * Math.PI / responseCount);
        orbit.y = location.y + radius * Math.sin(i * 2 * Math.PI / responseCount);
        drawWord(textResponse, orbit);
    }
    inputBoxDirectionX = 1;
    inputBoxDirectionY = 1;
}

function displayImage(imaageURL) {
    const img = document.createElement('img');
    img.src = imaageURL;
    img.style.position = 'absolute';
    img.style.top = '50%';
    img.style.left = '50%';
    img.style.transform = 'translate(-50%, -50%)';
    img.style.maxWidth = '80%';
    img.style.maxHeight = '80%';
    img.style.border = '2px solid #000';
    img.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    document.body.appendChild(img);

    setTimeout(() => {
        displayMessage("YOU CANT TRUST WHAT YOU SEE SO TRUST AI TO SEE FOR YOU?");
    }, 5000);


}


function displayMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'messageDiv';
    messageDiv.style.position = 'absolute';
    messageDiv.style.top = '50%';
    messageDiv.style.left = '50%';
    messageDiv.style.fontFamily = 'boldFont, sans-serif';
    messageDiv.style.transform = 'translate(-50%, -50%)';
    messageDiv.style.fontSize = '4.5em';
    messageDiv.style.color = 'red';
    messageDiv.innerHTML = `<p>${message}</p>`;
    document.body.appendChild(messageDiv);
    
}