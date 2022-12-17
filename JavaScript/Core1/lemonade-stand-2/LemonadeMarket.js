const WeatherStateEL = new eNUMERATION( "WeatherStateEL",
    ["sunny", "partly cloudy", "cloudy", "rainy"] );

class LemonadeMarket extends DailyDemandMarket {
  constructor({id, name, weatherState}) {
    super({id, name});
    this.weatherState = new RingBuffer({itemType: WeatherStateEL});
    // add initial weather state
    if (weatherState) this.weatherState.add( weatherState);
    this.temperatureHistory = new RingBuffer();
    // add initial temperature
    this.temperatureHistory.add( 25);
    this.dailyDemandQuantity = new RingBuffer();
  }
  getDailyDemandQuantity() {
    var demQty=0;
    // first update the "weather"
    this.updateWeather();
    const lastTemperature = this.temperatureHistory.getLast(),
          lastWeatherState = this.weatherState.getLast();
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
    switch (this.weatherState.getLast()) {
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
    this.weatherState.add( newWeatherState);
    // make sure the temperature is in the range [15,35]
    newTemperature = Math.min( Math.max( 15, newTemperature), 35);
    this.temperatureHistory.add( newTemperature);
  }
}
LemonadeMarket.labels = {"className":"LemMarket", "weatherState":"ws"};
