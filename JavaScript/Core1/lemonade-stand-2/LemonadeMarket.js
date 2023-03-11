const WeatherStateEL = new eNUMERATION( "WeatherStateEL",
    ["sunny", "partly cloudy", "cloudy", "rainy"] );

class LemonadeMarket extends DailyDemandMarket {
  constructor({id, name, weatherState=2, temperature=25}) {
    super({id, name});
    this.weatherState = weatherState;
    this.weatherStateHistory = new RingBuffer({itemType: WeatherStateEL});
    this.weatherStateHistory.add( weatherState);
    this.temperature = temperature;
    this.temperatureHistory = new RingBuffer();
    this.temperatureHistory.add( temperature);
    this.dailyDemandHistory = new RingBuffer();
  }
  getDailyDemandQuantity() {
    var demQty=0;
    // first update the "weather"
    this.updateWeather();
    const lastTemperature = this.temperatureHistory.getLast(),
          lastWeatherState = this.weatherStateHistory.getLast();
    switch (lastWeatherState) {
    case WeatherStateEL.SUNNY:
      demQty = 300 + (lastTemperature - 20) * 10 ;
      break;
    case WeatherStateEL.PARTLY_CLOUDY:
      demQty = 250 + (lastTemperature - 15) * 10 ;
      break;
    case WeatherStateEL.CLOUDY:
      demQty = 200 + (lastTemperature - 15) * 10 ;
      break;
    case WeatherStateEL.RAINY:
      demQty = 150 + (lastTemperature - 15) * 10 ;
      break;
    }
    demQty = Math.round( demQty);  // positive integer
    //console.log("lastWeathSt: "+ lastWeatherState +" | lastTemp: "+ lastTemperature +" | demQty: "+ demQty);
    return demQty;
  }
  updateWeather() {
    var newWeatherState = 0,
        newTemperature = this.temperatureHistory.getLast();
    const r = rand.uniformInt( 0, 99);
    switch (this.weatherStateHistory.getLast()) {
    case WeatherStateEL.SUNNY:
      if (r < 50) {
        newWeatherState = WeatherStateEL.SUNNY;
        newTemperature += rand.uniformInt( -1, 1);
      } else {
        newWeatherState = WeatherStateEL.PARTLY_CLOUDY;
        newTemperature += rand.uniformInt( -3, -1);
      }
      break;
    case WeatherStateEL.PARTLY_CLOUDY:
      if (r < 25) {
        newWeatherState = WeatherStateEL.SUNNY;
        newTemperature += rand.uniformInt( 1, 3);
      } else if (r < 75) {
        newWeatherState = WeatherStateEL.PARTLY_CLOUDY;
        newTemperature += rand.uniformInt( -1, 1);
      } else {
        newWeatherState = WeatherStateEL.CLOUDY;
        newTemperature += rand.uniformInt( -3, -1);
      }
      break;
    case WeatherStateEL.CLOUDY:
      if (r < 25) {
        newWeatherState = WeatherStateEL.PARTLY_CLOUDY;
        newTemperature += rand.uniformInt( 1, 3);
      } else if (r < 75) {
        newWeatherState = WeatherStateEL.CLOUDY;
        newTemperature += rand.uniformInt( -1, 1);
      } else {
        newWeatherState = WeatherStateEL.RAINY;
        newTemperature += rand.uniformInt( -3, -1);
      }
      break;
    case WeatherStateEL.RAINY:
      if (r < 50) {
        newWeatherState = WeatherStateEL.CLOUDY;
        newTemperature += rand.uniformInt( 1, 3);
      } else {
        newWeatherState = WeatherStateEL.RAINY;
        newTemperature += rand.uniformInt( -1, 1);
      }
      break;
    }
    this.weatherState = newWeatherState;
    this.weatherStateHistory.add( newWeatherState);
    // make sure the temperature is in the range [15,35]
    newTemperature = Math.min( Math.max( 15, newTemperature), 35);
    this.temperature = newTemperature;
    this.temperatureHistory.add( newTemperature);
  }
}
LemonadeMarket.labels = {"className":"LemMarket", "weatherState":"ws"};
