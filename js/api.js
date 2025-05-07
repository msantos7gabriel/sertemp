const apiKey = "a9e2ff3f71b34d60bbc6694971bc3eaa";

async function getWeatherData(city) {
  const apiWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=pt_br`;

  try {
    const response = await fetch(apiWeatherURL);
    const data = await response.json();

    // Atualiza os elementos da cidade
    document.querySelector("#temp").innerText = `${Math.round(
      data.main.temp
    )}°C`;
    document.querySelector("#humidity").innerText = `${data.main.humidity}%`;
    document.querySelector("#wind").innerText = `${data.wind.speed} km/h`;
    document.querySelector("#feels-like").innerText = `${Math.round(
      data.main.feels_like
    )}°C`;

    const iconElement = document.querySelector("#weather-icon");
    const descriptionElement = document.querySelector("#description");

    iconElement.setAttribute(
      "src",
      `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`
    );

    descriptionElement.innerText = data.weather[0].description;
  } catch (error) {
    console.error("Erro ao obter dados da API:", error);
  }
}

// Chama a função com a cidade desejada
getWeatherData("Morrinhos");
