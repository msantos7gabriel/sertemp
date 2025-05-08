const apiKey = "a9e2ff3f71b34d60bbc6694971bc3eaa";
const locals = ["guanambi"];

async function getWeatherData(city) {
  const apiWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=pt_br`;

  try {
    const response = await fetch(apiWeatherURL);
    const data = await response.json();
    const icon = `${city}-icon`;
    const description = `${city}-description`;
 
    const iconElement = document.getElementsByClassName(icon);
    const descriptionElement = document.getElementsByClassName(description);

    for (const element of iconElement) {
      element.setAttribute("src", `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`);
    }
    for (const element of descriptionElement) {
      element.setAttribute("alt", data.weather[0].description);
    }

  } catch (error) {
    console.error("Erro ao obter dados da API:", error); 
  }
}

for (const local of locals) {
  getWeatherData(local);
}

