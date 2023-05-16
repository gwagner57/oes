/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Lemonade-Stand-2";
sim.model.time = "discrete"; // implies using only discrete random variables
sim.model.timeUnit = "h";

sim.model.otherCodeFiles = ["../lib/RingBuffer"];  // used for history data
sim.model.objectTypes = ["SingleProductCompany", "ItemType", "InputItemType", "OutputItemType",
    "ProductCategory", "DailyDemandMarket", "LemonadeMarket"];
sim.model.eventTypes = ["StartOfDay", "DailyProduction", "Delivery", "DailyDemand", "EndOfDay"];

/*******************************************************
 Simulation Configuration
 ********************************************************/
sim.config.visualize = true;
sim.config.ui.obs.type = "SVG";  // the type of observation user interface
sim.config.stepDuration = 500;  // the duration of one simulation step in ms
sim.config.userInteractive = true;

sim.config.ui.artworkCredits = "Weather icons by https://icons8.com";

//sim.config.userInteractive = true;

/*******************************************************
 Default Scenario
 ********************************************************/
sim.scenario.durationInSimTime = 10*24;  // 40 days
sim.scenario.description = "The default scenario runs for 40 days.";
sim.scenario.setupInitialState = function () {
  const iit1 = new InputItemType({id:3, name: "Lemon",
    quantityUnit: "pc",  // piece(s)
    supplyUnit: "bag",
    quantityPerSupplyUnit: 5,  // pieces per bag
    stockQuantity: 200,
    purchasePrice: 2,  // per bag
    targetInventory: 200,
    reorderPeriod: 2  // every 2 days
  });
  const iit2 = new InputItemType({id:4, name: "Water",
    quantityUnit: "ltr",
    supplyUnit: "bottle",
    quantityPerSupplyUnit: 1.5,  // litre
    stockQuantity: 120,
    purchasePrice: 0.5,  // per bottle
    targetInventory: 120,
    reorderPoint: 60
  });
  const iit3 = new InputItemType({id:5, name: "IceCubes",
    quantityUnit: "pc",  // piece(s)
    supplyUnit: "bag",
    quantityPerSupplyUnit: 100,  // pieces per bag
    stockQuantity: 0,
    purchasePrice: 2,  // per bag
    justInTime: true
  });
  const iit4 = new InputItemType({id:6, name: "Sugar",
    quantityUnit: "kg",
    supplyUnit: "bag",
    quantityPerSupplyUnit: 1,  // kg per bag
    stockQuantity: 20,
    purchasePrice: 1,  // for a bag
    targetInventory: 20,
    reorderPeriod: 3  // every 3 days
  });
  const iit5 = new InputItemType({id:7, name: "PaperCup",
    quantityUnit: "pc",
    supplyUnit: "box",
    quantityPerSupplyUnit: 100,  // pieces per box
    stockQuantity: 500,
    purchasePrice: 2.5,  // for a box
    targetInventory: 1000,
    reorderPoint: 500
  });
  const lm = new LemonadeMarket({id:8, name:"lemonadeMarket", weatherState: WeatherStateEL.PARTLY_CLOUDY});
  const pc = new ProductCategory({id:9, name: "lemonade", market: lm});
  const oit = new OutputItemType({id:2, name: "Lemona",
    quantityUnit: "ltr",
    supplyUnit: "cup",
    quantityPerSupplyUnit: 0.25,  /// in quantity units (ltr)
    productCategory: pc,
    salesPrice: 1.5,  // e.g., USD
    batchSize: 3.5,  // in quantity units (1 pitcher = 3.5 liters)
    bomItems: {"Lemon": 3, "Water": 2.5, "IceCubes": 20, "Sugar": 0.3},
    packItemsPerSupplyUnit: {"PaperCup": 1},  // 1 paper cup per cup of lemonade
    stockQuantity: 0  // in quantity units
  });
  const ls = new SingleProductCompany({id:1, name: "lemonadeStand",
    productType: oit,  // Lemonade
    liquidity: 100,
    fixedCostPerDay: 50
  });
  // Schedule initial events
  sim.schedule( new StartOfDay({occTime: 8, company: ls}));
}
/*******************************************************
 Statistics variables
********************************************************/
sim.model.setupStatistics = function () {
  sim.stat.lostSales = 0;
  sim.stat.dailyCosts = 0;
  sim.stat.dailyRevenue = 0;
  sim.stat.dailyProfit = 0;
  sim.stat.totalRevenue = 0;
  sim.stat.totalCosts = 0;
};
sim.model.computeFinalStatistics = function () {
  sim.stat.totalProfit = sim.stat.totalRevenue - sim.stat.totalCosts;
}
sim.config.ui.stat.excludeFromTable = ["dailyCosts","dailyRevenue","dailyProfit"];

sim.model.timeSeries = {
  "dailyRevenue": {statisticsVariable:"dailyRevenue"},
  "dailyProfit": {statisticsVariable:"dailyProfit"},
  //"liquidity": {objectId:1, attribute:"liquidity"},
};

/*******************************************************
 Define an experiment (type)
********************************************************/
sim.experimentTypes[0] = {
  id: 0,
  title: `Simple Experiment with 10 replications, each running for ${sim.scenario.durationInSimTime} ${sim.model.timeUnit}.`,
  nmrOfReplications: 10,
  seeds: [123, 234, 345, 456, 567, 678, 789, 890, 901, 1012]
};

/*******************************************************
 Define the observation UI
 ********************************************************/
sim.config.ui.obs.type = "SVG";
sim.config.ui.obs.canvas.width = 600;
sim.config.ui.obs.canvas.height = 320;
//Allows background styling (not needed here)
//sim.config.ui.observation.canvas.style = "background-color:yellow";
sim.config.ui.obs.fixedElements = {
  "lemonadeStandTable": {
    shapeName: "polygon",  // an SVG shape name
    // defining fixed values for the attributes of an SVG shape
    shapeAttributes: {points: "400,200 400,210 350,210 350,310 340,310 340,210 240,210 240,310 230,310 230,210 180,210 180,200"},
    // CSS style rules for the SVG element
    style: "fill:brown; stroke-width:0"
  },
  "lemonadePitcher": {
    shapeName: "polyline",
    shapeAttributes: {points: "200,125 200,200 250,200 250,125"},
    style: "fill:none; stroke:black; stroke-width:3"
  }
};
/*
 A view is defined for a specific object, when the view name denotes an object name,
 or for all objects of an object type, when the view name denotes an object type name.
 It specifies a list of visualization attributes and a list of view items being SVG elements.
 */
sim.config.ui.obs.objectViews = {
  "lemonadeStand": {  // a view for the object "lemonadeStand"
    visualizationAttributes: ["productType.stockQuantity","dailyProfit"],
    attributesViewItemsRecords: [
      { attributes:["productType.stockQuantity"],
        viewItems: [  // a list of view item definition records for the given object and attribute
          {shapeName: "rect",  // an SVG shape name
            style: "fill:yellow; stroke-width:0",  // CSS style rules for the SVG element
            // attribute-value slots of an SVG shape, using fixed values or expressions
            shapeAttributes: {
              // defining fixed values for the attributes of an SVG shape
              x: 205, width: 40,
              // using expressions for defining the values of shape attributes
              y: stand => 195 - stand.productType.stockQuantity,
              // the parameter "stand" represents a LemonadeStand object
              height: stand => stand.productType.stockQuantity
            }
          },
          {shapeName: "text",  // text elements are treated like shapes
            style:"font-size:10px; text-anchor:middle",  // CSS text style rules
            shapeAttributes: {
              x: 225, y: 195,  // coordinates for positioning the text
              textContent: stand => stand.productType.stockQuantity + " L"
            }
          },
          {shapeName: "text",  // text elements are treated like shapes
            style:"font-size:20px; text-anchor:middle",  // CSS text style rules
            shapeAttributes: {
              x: 50, y: 50,  // coordinates for positioning the text
              textContent: () => sim.time ? "Day "+ Math.ceil( sim.time / 24) : ""
            }
          }
        ]
      },
      { attributes:["dailyProfit"],
        viewItems: [
          {shapeName: "rect",
            style:"stroke-width:0",
            fillPatternImage:{id:"fp1", file:"Dollar-Coin.svg"},
            shapeAttributes: { x: 300, width: 60,
              y: stand =>  195 - Math.floor( stand.dailyProfit / 2),
              height: stand =>  Math.floor( stand.dailyProfit / 2)
            }
          },
          {shapeName: "text",
            style:"font-size:10px; text-anchor:middle",  // CSS text style rules
            shapeAttributes: {
              x: 375, y: 195,
              textContent: stand => stand.dailyProfit > 0 ? "$"+ Math.floor( stand.dailyProfit) : ""
            }
          }
        ]
      }
    ]
  },
  // a view consisting of a map of enum attributes to lists of visualization items with an optional canvasBackgroundColor
  "lemonadeMarket": {
    visualizationAttributes: ["weatherState"],
    attributesViewItemsRecords: [
      { enumAttribute:"weatherState",
        viewItems: [  // an array list mapping enum indexes to visualization items
          {shapeName:"image", shapeAttributes:{ file:"icons8-Summer-96.png",
            x:450, y:0, width:96, height:96}, canvasBackgroundColor:"lightyellow"},
          {shapeName:"image", shapeAttributes:{ file:"icons8-Partly-Cloudy-Day-96.png",
            x:450, y:0, width:96, height:96}, canvasBackgroundColor:"oldlace"},  // or ivory?
          {shapeName:"image", shapeAttributes:{ file:"icons8-Cloud-128.png",
            x:450, y:0, width:128, height:128}, canvasBackgroundColor:"lightgray"},
          {shapeName:"image", shapeAttributes:{ file:"icons8-Rain-128.png",
            x:450, y:0, width:128, height:128}, canvasBackgroundColor:"silver"},
        ]
      }
    ]
  }
};
sim.config.ui.obs.eventAppearances = {
  /* duration  If the sound source is a file and if no duration is specified, then the entire file is played.
               If deal with a sound file and a duration is specified with a value lower than the sound file duration
               then only the "duration" time is played from that file. If the source is a note sequence and no duration
               is specified, then the duration is computed as the sum of all note durations. If the source is a
               note sequence and a duration is defined then the duration of each note from sequence is multiplied
               with a factor that ensures that the total notes duration equals with the value of the @duration attribute.
   soundSource The source can be a note sequence or a sound file (identified by its extension (.mp3 or ...).
               If it's a file it is first searched in the project directory under "media/sounds". If the file is not found,
               then it is searched in the global media/sounds folder. If still not found, then no sound is played.
               Note that the path is relativ to "media/sounds". So a value @introSoundFile="/mySounds/background.mid"
               will be searched in "media/sounds/mySounds/background.mid".
               A note sequence is a list of note/duration/volume triples where the note is an integer between 0
               (corresponding to a low C) and 127 (in half-tones) and the duration (in ms) and volume (in range 0 = mute
               to 127 = MAX_VOLUME) are positive integers. An example is "12/300/80 14/200/90"
   instrumentNo (or instrumentName) ???
   */
  "DailyDemand": {
    //sound: {duration: 1000, source:"12/300/80 14/200/90"},
    view: {  // an event view is a web animation of a DOM element
      imageFile: "customers.svg",
      style: "width:300px; height:300px; position:absolute; left:-100%; bottom:3%;",
      keyframes: [{left:'-30%'}, {left:'90%'}],
      duration: 1000,  // ms
      //iterations: Infinity,
      //fill:
    }
  },
  "EndOfDay": {
    view: {  // an event view is a web animation of a DOM element
      domElem: () => sim.config.ui.canvasContainerEl,  // the visualization container element
      keyframes: [{backgroundColor:'lightgray'}, {backgroundColor:'darkslategrey'}],
      duration: 1000  // ms
    }
  }
};
/*******************************************************
 Define User Interactions
 ********************************************************/
sim.scenario.userInteractions = {
  "StartOfDay": {  // triggering event type
    // a UIA may be triggered by an event satisfying a condition
    condition: function (e) {
      return (e.company.id === 1);
    },
    title: "Plan production and sales price (at start of day)",
    outputFields: {
      "dailyDemandHistory": {
        label: "Demand history (cups)",
        hint: "How many cups of lemonade have been sold in the past days",
        // defining the value of an output field
        value: () => sim.namedObjects["lemonadeMarket"]?.dailyDemandHistory.toString()
      },
      "weatherStateHistory": {
        label: "Weather history",
        hint: "How the weather was in the past days",
        value: () => sim.namedObjects["lemonadeMarket"]?.weatherStateHistory.toString()
      },
      "temperatureHistory": {
        label: "Temperature history (°C)",
        hint: "How the temperature was in the past days",
        value: () => sim.namedObjects["lemonadeMarket"]?.temperatureHistory.toString()
      },
      "forecastWeatherState": {
        label: "Weather forecast",
        hint: "The weather forecast for today",
        value: () => WeatherStateEL.labels[sim.namedObjects["lemonadeMarket"]?.forecastWeatherState - 1]
      },
      "forecastTemperature": {
        label: "Temperature forecast",
        hint: "The temperature forecast for today",
        value: () => sim.namedObjects["lemonadeMarket"]?.forecastTemperature.toString()
      }
    },
    inputFields: {
      "planProdQty": {
        range: "PositiveInteger", default: 12, label: "Planned prod. quantity",
        hint: "How many pitchers of lemonade to produce?", suffixLabel: "pitchers (3.5 l)"
      },
      "planSalesPrice": {
        range: "Amount", decimalPlaces: 2, default: 2.00, label: "Planned sales price ($)",
        hint: "For how many $ is a cup to be sold?", suffixLabel: "per cup"
      }
    },
    // a list of fields or field groups (sub-arrays) defining the ordering/grouping of UI fields
    fieldOrder: ["dailyDemandHistory", "weatherStateHistory", "temperatureHistory",
      ["forecastWeatherState", "forecastTemperature"], "planProdQty", "planSalesPrice"],
    waitForUserInput: true
  }
};
