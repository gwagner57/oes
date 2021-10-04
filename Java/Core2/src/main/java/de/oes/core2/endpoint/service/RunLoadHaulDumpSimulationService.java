package de.oes.core2.endpoint.service;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.Map.Entry;
import java.util.function.Consumer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.AutowireCapableBeanFactory;
import org.springframework.stereotype.Component;

import de.oes.core2.activities.rANGE;
import de.oes.core2.activities.rESOURCEpOOL;
import de.oes.core2.activities.rESOURCEsTATUS;
import de.oes.core2.dto.ExperimentsStatisticsDTO;
import de.oes.core2.dto.SimulationSettingsDTO;
import de.oes.core2.lib.MathLib;
import de.oes.core2.lib.SimulatorLogs;
import de.oes.core2.loadhauldump.Dump;
import de.oes.core2.loadhauldump.GoBackToLoadingSite;
import de.oes.core2.loadhauldump.GoHome;
import de.oes.core2.loadhauldump.GoToLoadingSite;
import de.oes.core2.loadhauldump.Haul;
import de.oes.core2.loadhauldump.HaulRequest;
import de.oes.core2.loadhauldump.Load;
import de.oes.core2.loadhauldump.Truck;
import de.oes.core2.loadhauldump.WheelLoader;
import de.oes.core2.sim.ActivityStat;
import de.oes.core2.sim.Model;
import de.oes.core2.sim.Scenario;
import de.oes.core2.sim.Simulator;
import de.oes.core2.sim.Time;
import de.oes.core2.sim.TimeUnit;
import de.oes.core2.sim.eXPERIMENTtYPE;

@Component
public class RunLoadHaulDumpSimulationService {
	
	/**
	 * Factory for spring component injection (needed to persist objects in DB)
	 */
	@Autowired
	private AutowireCapableBeanFactory autowireCapableBeanFactory;
	
	
	/**
	 * Runs the load-haul-dump simualtion model
	 * @param dto - simulation settings defined by client
	 * @param m - Thymeleaf model v
	 */
	public void run(SimulationSettingsDTO dto, org.springframework.ui.Model m) {
		Model model = initializeModel();
		Simulator sim = new Simulator();
		Scenario scenario = new Scenario();
		
		if(dto.getInit() == 0) { // (0) Basic scenario
			scenario = initScenario(sim);
		} else { // (1) Model variant
			scenario = initAltScenario(sim);
		}
		
		setStatisticVariables(model, sim);
		
		initSimulation(model, sim, scenario);
		
		if(dto.getType() == 0) { // (0) Standalone scenario
			runStandaloneScenario(sim, dto.isSimulationLog());
			m.addAttribute("stat", sim.getStat().getSimpleStat());
			calculateResUtil(sim.getStat().getActTypes().values(), sim);
			m.addAttribute("actStat", sim.getStat().getActTypes());
			if(dto.isSimulationLog()) m.addAttribute("logs", SimulatorLogs.getLogs());
		} else { // (1) Simple Experiment with 10 replications, each running for 1000 min.
			eXPERIMENTtYPE expType = defineExperimentType(model, scenario);
			ExperimentsStatisticsDTO resutlDTO = runExperiment(sim, expType, dto.isSimulationLog());
			m.addAttribute("stat", resutlDTO);
		}
	}


	/**
	 * Calculate resource utilization for activity types
	 * @param activityStats - collected activity statistics
	 * @param sim - current simulation
	 */
	private void calculateResUtil(Collection<ActivityStat> activityStats, Simulator sim) {
		for (ActivityStat activityStat : activityStats) {
			activityStat.getResUtil().replaceAll((k,v) -> MathLib.round(v.doubleValue() / sim.getTime()));
		}
	}

	/**
	 * Runs simulation scenario with replications (as experiment)
	 * @param sim - current simulation
	 * @param expType - type of the experiment
	 * @param logs - defines if simulation steps must be logged
	 * @return
	 */
	private ExperimentsStatisticsDTO runExperiment(Simulator sim, eXPERIMENTtYPE expType, boolean logs) {
		autowireCapableBeanFactory.autowireBean(sim);
		sim.setExperimentType(expType);
		return sim.runExperiment(logs);
	}



	/**
	 * Run simulation as a simple scenario without replications
	 * @param sim - current simulation
	 * @param logs - defines if simulation steps must be logged
	 */
	private void runStandaloneScenario(Simulator sim, boolean logs) {
		sim.runStandaloneScenario(logs);
		System.out.println("FINAL STAT");
		for (Entry<String, Number> e : sim.getStat().getSimpleStat().entrySet()) {
			System.out.println(e.getKey() + " : " + e.getValue());
		}
	}



	/**
	 * @param model
	 * @param sim
	 * @param scenario
	 */
	private void initSimulation(Model model, Simulator sim, Scenario scenario) {
		sim.setModel(model);
		sim.setScenario(scenario);
	}



	
	/**
	 * Definition of experiment type for the given model
	 * @param model - simulation model
	 * @param scenario - current simulation scenario
	 * @return
	 */
	private eXPERIMENTtYPE defineExperimentType(Model model, Scenario scenario) {
		eXPERIMENTtYPE expType = new eXPERIMENTtYPE(
			model,
			"Simple Experiment with 10 replications, each running for "  + scenario.getDurationInSimTime() + " " + model.getTimeUnit(),
			10, // nmrOfReplications
			null, // parameterDef
			new Integer[] {123, 234, 345, 456, 567, 678, 789, 890, 901, 1012} // seeds
			);
		expType.setStoreExpResults(true);
		return expType;
	}


	
	/**
	 * Initialization of statistic variables
	 * @param model - simulation model
	 * @param sim - current simulation
	 */
	private void setStatisticVariables(Model model, Simulator sim) {
		Consumer<Simulator> setupStatistics = s -> {
		};
		model.setSetupStatistics(setupStatistics);
	}
	
	/**
	 * Initialization of alternative simulation scenario
	 * @param sim - current simulation
	 * @return initialized simulation scenario object
	 */
	public Scenario initAltScenario(Simulator sim) {
		sim.getAClasses().put("GoToLoadingSite", new GoToLoadingSite(sim,0,0,null));
		sim.getAClasses().put("Load", new Load(sim,0,0,null));
		sim.getAClasses().put("Haul", new Haul(sim,0,0,null));
		sim.getAClasses().put("GoBackToLoadingSite", new GoBackToLoadingSite(sim,0,0,null));
		sim.getAClasses().put("GoHome", new GoHome(sim,0,0,null));
		sim.getAClasses().put("Dump", new Dump(sim,0,0,null));
		Scenario altScenario = new Scenario();
		altScenario.setScenarioNo(1l);
		altScenario.setTitle("Scenario with 2 wheel loaders");
		altScenario.setDescription(
			"Based on the default scenario (with 5 trucks and 1 wheel loader), "
		+ "this scenario has a second wheel loader. As a consequence, <i>Load</i> activities are performed twice as fast.");
		Consumer<Simulator> setupInitialStateAlt = s -> {
			 // Create initial objects
			Truck t1 = new Truck(1, "t1", sim, rESOURCEsTATUS.AVAILABLE);
			Truck t2 = new Truck(2, "t2", sim, rESOURCEsTATUS.AVAILABLE);
			Truck t3 = new Truck(3, "t3", sim, rESOURCEsTATUS.AVAILABLE);
			Truck t4 = new Truck(4, "t4", sim, rESOURCEsTATUS.AVAILABLE);
			Truck t5 = new Truck(5, "t5", sim, rESOURCEsTATUS.AVAILABLE);
			WheelLoader wl1 = new WheelLoader(11, "wl1", sim, rESOURCEsTATUS.AVAILABLE);
			WheelLoader wl2 = new WheelLoader(12, "wl2", sim, rESOURCEsTATUS.AVAILABLE);
			 // Initialize the individual resource pools
			rANGE range = new rANGE();
			
			rESOURCEpOOL rp1 = new rESOURCEpOOL(s, "trucks", range, 5, List.of(t1, t2, t3, t4, t5));
			t1.setResourcePool(rp1);
			t2.setResourcePool(rp1);
			t3.setResourcePool(rp1);
			t4.setResourcePool(rp1);
			t5.setResourcePool(rp1);
			
			rESOURCEpOOL rp2 = new rESOURCEpOOL(s, "wheelLoaders", range, 2, List.of(wl1, wl2));
			wl1.setResourcePool(rp2);
			wl2.setResourcePool(rp2);
			
			s.getResourcepools().put("trucks", rp1);
			s.getResourcepools().put("wheelLoaders", rp2);
			
			GoToLoadingSite.resRoles.get("trucks").setResPool(rp1);
			Load.resRoles.get("trucks").setResPool(rp1);
			Load.resRoles.get("wheelLoaders").setResPool(rp2);
			Haul.resRoles.get("trucks").setResPool(rp1);
			GoHome.resRoles.get("trucks").setResPool(rp1);
			Dump.resRoles.get("trucks").setResPool(rp1);
			GoBackToLoadingSite.resRoles.get("trucks").setResPool(rp1);
			// Schedule initial events
			s.getFEL().add(new HaulRequest(s, 1l, null, 990));
			
		};
		altScenario.setSetupInitialState(setupInitialStateAlt);
		sim.getScenarios().add(altScenario);
		return altScenario;
	}


	/**
	 * Initialization of a basic simulation scenario
	 * @param sim - current simulation
	 * @return initialized simulation scenario object
	 */
	private Scenario initScenario(Simulator sim) {
		sim.getAClasses().put("GoToLoadingSite", new GoToLoadingSite(sim,0,0,null));
		sim.getAClasses().put("Load", new Load(sim,0,0,null));
		sim.getAClasses().put("Haul", new Haul(sim,0,0,null));
		sim.getAClasses().put("GoBackToLoadingSite", new GoBackToLoadingSite(sim,0,0,null));
		sim.getAClasses().put("GoHome", new GoHome(sim,0,0,null));
		sim.getAClasses().put("Dump", new Dump(sim,0,0,null));
		Scenario scenario = new Scenario();
		scenario.setTitle("The default scenario has 5 trucks (with IDs 1-5) and one wheel loader (with ID 11).");
		// Initial State
		Consumer<Simulator> setupInitialState = s -> {
			 // Create initial objects
			Truck t1 = new Truck(1, "t1", sim, rESOURCEsTATUS.AVAILABLE);
			Truck t2 = new Truck(2, "t2", sim, rESOURCEsTATUS.AVAILABLE);
			Truck t3 = new Truck(3, "t3", sim, rESOURCEsTATUS.AVAILABLE);
			Truck t4 = new Truck(4, "t4", sim, rESOURCEsTATUS.AVAILABLE);
			Truck t5 = new Truck(5, "t5", sim, rESOURCEsTATUS.AVAILABLE);
			WheelLoader wl1 = new WheelLoader(11, "wl1", sim, rESOURCEsTATUS.AVAILABLE);
			 // Initialize the individual resource pools
			rANGE range = new rANGE();
			
			rESOURCEpOOL rp1 = new rESOURCEpOOL(s, "trucks", range, 5, List.of(t1, t2, t3, t4, t5));
			t1.setResourcePool(rp1);
			t2.setResourcePool(rp1);
			t3.setResourcePool(rp1);
			t4.setResourcePool(rp1);
			t5.setResourcePool(rp1);
			
			rESOURCEpOOL rp2 = new rESOURCEpOOL(s, "wheelLoaders", range, 1, List.of(wl1));
			wl1.setResourcePool(rp2);
			
			s.getResourcepools().put("trucks", rp1);
			s.getResourcepools().put("wheelLoaders", rp2);
			
			GoToLoadingSite.resRoles.get("trucks").setResPool(rp1);
			Load.resRoles.get("trucks").setResPool(rp1);
			Load.resRoles.get("wheelLoaders").setResPool(rp2);
			Haul.resRoles.get("trucks").setResPool(rp1);
			GoHome.resRoles.get("trucks").setResPool(rp1);
			Dump.resRoles.get("trucks").setResPool(rp1);
			GoBackToLoadingSite.resRoles.get("trucks").setResPool(rp1);
			// Schedule initial events
			s.getFEL().add(new HaulRequest(s, 1l, null, 990));
			
		};
		scenario.setSetupInitialState(setupInitialState);
		return scenario;
	}

	
	
	/**
	 * Initialization of simulation model parameters
	 * @return initialized simulation model object
	 */
	private Model initializeModel() {
		Model model = new Model();
		model.setName("Load-Haul-Dump-1");
		model.setTime(Time.CONT);
		model.setTimeUnit(TimeUnit.min);
		model.setObjectTypes(List.of(Truck.class, WheelLoader.class));
		model.setEventTypes(List.of(HaulRequest.class));
		model.setActivityTypes(Set.of("GoToLoadingSite","Load","Haul","Dump","GoBackToLoadingSite","GoHome"));
		return model;
	}
}
