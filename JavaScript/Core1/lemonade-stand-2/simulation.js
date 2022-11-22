/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Lemonade-Stand-2";
sim.model.time = "discrete"; // implies using only discrete random variables
sim.model.timeUnit = "h";

sim.model.otherCodeFiles = ["../lib/RingBuffer"];
sim.model.objectTypes = ["SingleProductCompany", "ItemType", "InputItemType", "OutputItemType",
    "ProductCategory", "DailyDemandMarket", "LemonadeMarket"];
sim.model.eventTypes = ["StartOfDay", "DailyProduction", "Delivery", "DailyDemand", "EndOfDay"];

/*******************************************************
 Default Scenario
 ********************************************************/
sim.scenario.durationInSimTime = 40*24;  // 40 days
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
  const lm = new LemonadeMarket({id:8, name:"LemonadeMarket", weatherState: WeatherStateEL.PARTLY_CLOUDY});
  const pc = new ProductCategory({id:9, name: "Lemonade", market: lm});
  const oit = new OutputItemType({id:2, name: "Lemonade",
    quantityUnit: "ltr",
    supplyUnit: "cup",
    quantityPerSupplyUnit: 0.25,  /// in quantity units (ltr)
    productCategory: pc,
    salesPrice: 1.5,  // e.g., USD
    batchSize: 3.5,  // in quantity units (1 pitcher = 3.5 liters)
    bomItems: {"Lemon": 3, "Water": 2.5, "IceCubes": 20, "Sugar": 0.3},
    packItemsPerSupplyUnit: {"PaperCup": 1},
    stockQuantity: 0  // in quantity units
  });
  const ls = new SingleProductCompany({id:1, name: "LemonadeStand",
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
sim.model.timeSeries = {
  "liquidity": {objectId:1, attribute:"liquidity"},
  "dailyProfit": {statisticsVariable:"dailyProfit"},
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
sim.config.ui.obs.canvas.height = 300;
//Allows background styling (not needed here)
//sim.config.ui.observation.canvas.style = "background-color:yellow";
sim.config.ui.obs.fixedElements = {
  "LemonadeStandTable": {
    shapeName: "polygon",  // an SVG shape name
    // defining fixed values for the attributes of an SVG shape
    shapeAttributes: {points: "400,150 400,160 350,160 350,260 340,260 340,160 240,160 240,260 230,260 230,160 180,160 180,150"},
    // CSS style rules for the SVG element
    style: "fill:brown; stroke-width:0"
  },
  "LemonadePitcher": {
    shapeName: "polyline",
    shapeAttributes: {points: "200,100 200,150 250,150 250,100"},
    style: "fill:none; stroke:black; stroke-width:3"
  }
};
sim.config.ui.obs.objectViews = {
  "LemonadeStand": [  // a view consisting of a group of SVG elements
    {shapeName: "rect",  // an SVG shape name
      // CSS style rules for the SVG element
      style: "fill:yellow; stroke-width:0",
      // attribute-value slots of an SVG shape, using fixed values or expressions
      shapeAttributes: {
        // defining fixed values for the attributes of an SVG shape
        x: 205, width: 40,
        // using expressions for defining the values of shape attributes
        y: function (stand) {return 145 - stand.productType.stockQuantity;},
        height: function (stand) {return stand.productType.stockQuantity;}
      }
    },
    {shapeName: "text",  // text elements are treated like shapes
      style:"font-size:10px; text-anchor:middle",  // CSS text style rules
      shapeAttributes: {
        x: 225, y: 145,  // coordinates for positioning the text
        textContent: function (stand) {return stand.productType.stockQuantity;}
      }
    },
    /*
  {shapeName: "rect",  // dailyRevenue
   style:"stroke-width:0",
   fillPatternImage:{id:"fp1", file:"Dollar-Coin.svg"},
   shapeAttributes: { x: 300, width: 60,
     y: function (stand) {return 145 - parseInt( stand.dailyRevenue);},
     height: function (stand) {return parseInt( stand.dailyRevenue);}
   }
  },*/
    {shapeName: "text",  // text element for dailyRevenue
      style:"font-size:10px; text-anchor:middle",  // CSS text style rules
      shapeAttributes: {
        x: 375, y: 145,
        textContent: function (stand) {return stand.dailyRevenue ? stand.dailyRevenue : "";}
      }
    }
  ],
  "Market": {  // a view consisting of a map of enum attributes to lists of visualization items with an optional canvasBackgroundColor
    "weatherState": [  // an array list mapping enum indexes to visualization items
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
      style: "width:300px; height:300px; position:absolute; left:-30%; top:135px;",
      keyframes: [{left:'-30%'}, {left:'80%'}],
      duration: 1000,  // ms
      //iterations: Infinity,
      //fill:
    }
  },
  "EndOfDay": {
    view: {  // an event view is a web animation of a DOM element
      domElem: function () {return sim.visualEl;},  // the visualization container element
      keyframes: [{backgroundColor:'lightgray'}, {backgroundColor:'darkslategrey'}],
      duration: 1000  // ms
    }
  }
};
