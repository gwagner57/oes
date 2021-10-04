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
import de.oes.core2.makeanddeliver.DeliverPizza;
import de.oes.core2.makeanddeliver.MakePizza;
import de.oes.core2.makeanddeliver.OrderCall;
import de.oes.core2.makeanddeliver.OrderTaker;
import de.oes.core2.makeanddeliver.PizzaMaker;
import de.oes.core2.makeanddeliver.TakeOrder;
import de.oes.core2.sim.ActivityStat;
import de.oes.core2.sim.Model;
import de.oes.core2.sim.Scenario;
import de.oes.core2.sim.Simulator;
import de.oes.core2.sim.Time;
import de.oes.core2.sim.TimeUnit;
import de.oes.core2.sim.eXPERIMENTtYPE;

@Component
public class RunMakeAndDeliverPizzaSimulationService {

	@Autowired
	private  AutowireCapableBeanFactory autowireCapableBeanFactory;
	
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


	private Scenario initAltScenario(Simulator sim) {
		sim.getAClasses().put("MakePizza", new MakePizza(sim,0,0,0));
		sim.getAClasses().put("TakeOrder", new TakeOrder(sim,0,0,0));
		sim.getAClasses().put("DeliverPizza", new DeliverPizza(sim,0,0,0));
		Scenario scenario = new Scenario();
		scenario.setDurationInSimTime(300l);
		// Initial State
		Consumer<Simulator> setupInitialState = s -> {
			 // Create initial objects
			OrderTaker ot1 = new OrderTaker(1, "ot1", sim, rESOURCEsTATUS.AVAILABLE);
			OrderTaker ot2 = new OrderTaker(2, "ot2", sim, rESOURCEsTATUS.AVAILABLE);
			PizzaMaker pm1 = new PizzaMaker(11, "pm1", sim, rESOURCEsTATUS.AVAILABLE);
			PizzaMaker pm2 = new PizzaMaker(12, "pm2", sim, rESOURCEsTATUS.AVAILABLE);
			PizzaMaker pm3 = new PizzaMaker(13, "pm3", sim, rESOURCEsTATUS.AVAILABLE);
			PizzaMaker pm4 = new PizzaMaker(14, "pm4", sim, rESOURCEsTATUS.AVAILABLE);
			PizzaMaker pm5 = new PizzaMaker(15, "pm5", sim, rESOURCEsTATUS.AVAILABLE);
			PizzaMaker pm6 = new PizzaMaker(16, "pm6", sim, rESOURCEsTATUS.AVAILABLE);
			 // Initialize the individual resource pools
			rANGE range = new rANGE();
			
			rESOURCEpOOL rp1 = new rESOURCEpOOL(s, "orderTakers", range, 2, List.of(ot1, ot2));
			ot1.setResourcePool(rp1);
			ot2.setResourcePool(rp1);
			
			rESOURCEpOOL rp2 = new rESOURCEpOOL(s, "pizzaMakers", range, 6, List.of(pm1,pm2,pm3,pm4,pm5,pm6));
			pm1.setResourcePool(rp2);
			pm2.setResourcePool(rp2);
			pm3.setResourcePool(rp2);
			pm4.setResourcePool(rp2);
			pm5.setResourcePool(rp2);
			pm6.setResourcePool(rp2);
			s.getResourcepools().put("orderTakers", rp1);
			s.getResourcepools().put("pizzaMakers", rp2);
			// Initialize the count pools
			rESOURCEpOOL rp3 = new rESOURCEpOOL(s, "ovens", range, 3, null);
			rESOURCEpOOL rp4 = new rESOURCEpOOL(s, "scooters", range, 10, null);
			s.getResourcepools().put("ovens", rp3);
			s.getResourcepools().put("scooters", rp4);
			// Schedule initial events
			
			// Schedule initial events
			s.getFEL().add(new OrderCall(s, 1l, null));
			
			TakeOrder.resRoles.get("orderTaker").setResPool(rp1);
			MakePizza.resRoles.get("pizzaMakers").setResPool(rp2);
			MakePizza.resRoles.get("oven").setResPool(rp3);
			DeliverPizza.resRoles.get("scooter").setResPool(rp4);
			//***** Model Variant ********************************************
			TakeOrder.resRoles.get("orderTaker").setAlternativeResourceTypes(rp2);
			
		};
		scenario.setSetupInitialState(setupInitialState);
		return scenario;
	}


	private void calculateResUtil(Collection<ActivityStat> activityStats, Simulator sim) {
		for (ActivityStat activityStat : activityStats) {
			activityStat.getResUtil().replaceAll((k,v) -> MathLib.round(v.doubleValue() / sim.getTime()));
		}
	}

	private ExperimentsStatisticsDTO runExperiment(Simulator sim, eXPERIMENTtYPE expType, boolean logs) {
		autowireCapableBeanFactory.autowireBean(sim);
		sim.setExperimentType(expType);
		return sim.runExperiment(logs);
	}



	private void runStandaloneScenario(Simulator sim, boolean logs) {
		sim.runStandaloneScenario(logs);
		System.out.println("FINAL STAT");
		for (Entry<String, Number> e : sim.getStat().getSimpleStat().entrySet()) {
			System.out.println(e.getKey() + " : " + e.getValue());
		}
	}



	private void initSimulation(Model model, Simulator sim, Scenario scenario) {
		sim.setModel(model);
		sim.setScenario(scenario);
	}



	/*******************************************************
	 Define an experiment (type)
	********************************************************/
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


	/*******************************************************
	 Statistics variables
	********************************************************/
	private void setStatisticVariables(Model model, Simulator sim) {
		Consumer<Simulator> setupStatistics = s -> {
			 s.getStat().getSimpleStat().put("deliveredPizzas", Integer.valueOf(0));
		};
		model.setSetupStatistics(setupStatistics);
	}

	/*******************************************************
	 Simulation Scenario
	 ********************************************************/
	private Scenario initScenario(Simulator sim) {
		sim.getAClasses().put("MakePizza", new MakePizza(sim,0,0,0));
		sim.getAClasses().put("TakeOrder", new TakeOrder(sim,0,0,0));
		sim.getAClasses().put("DeliverPizza", new DeliverPizza(sim,0,0,0));
		Scenario scenario = new Scenario();
		scenario.setDurationInSimTime(300l);
		// Initial State
		Consumer<Simulator> setupInitialState = s -> {
			 // Create initial objects
			OrderTaker ot1 = new OrderTaker(1, "ot1", sim, rESOURCEsTATUS.AVAILABLE);
			OrderTaker ot2 = new OrderTaker(2, "ot2", sim, rESOURCEsTATUS.AVAILABLE);
			PizzaMaker pm1 = new PizzaMaker(11, "pm1", sim, rESOURCEsTATUS.AVAILABLE);
			PizzaMaker pm2 = new PizzaMaker(12, "pm2", sim, rESOURCEsTATUS.AVAILABLE);
			PizzaMaker pm3 = new PizzaMaker(13, "pm3", sim, rESOURCEsTATUS.AVAILABLE);
			PizzaMaker pm4 = new PizzaMaker(14, "pm4", sim, rESOURCEsTATUS.AVAILABLE);
			PizzaMaker pm5 = new PizzaMaker(15, "pm5", sim, rESOURCEsTATUS.AVAILABLE);
			PizzaMaker pm6 = new PizzaMaker(16, "pm6", sim, rESOURCEsTATUS.AVAILABLE);
			 // Initialize the individual resource pools
			rANGE range = new rANGE();
			
			rESOURCEpOOL rp1 = new rESOURCEpOOL(s, "orderTakers", range, 2, List.of(ot1, ot2));
			ot1.setResourcePool(rp1);
			ot2.setResourcePool(rp1);
			
			rESOURCEpOOL rp2 = new rESOURCEpOOL(s, "pizzaMakers", range, 6, List.of(pm1,pm2,pm3,pm4,pm5,pm6));
			pm1.setResourcePool(rp2);
			pm2.setResourcePool(rp2);
			pm3.setResourcePool(rp2);
			pm4.setResourcePool(rp2);
			pm5.setResourcePool(rp2);
			pm6.setResourcePool(rp2);
			s.getResourcepools().put("orderTakers", rp1);
			s.getResourcepools().put("pizzaMakers", rp2);
			// Initialize the count pools
			rESOURCEpOOL rp3 = new rESOURCEpOOL(s, "ovens", range, 3, null);
			rESOURCEpOOL rp4 = new rESOURCEpOOL(s, "scooters", range, 10, null);
			s.getResourcepools().put("ovens", rp3);
			s.getResourcepools().put("scooters", rp4);
			// Schedule initial events
			
			// Schedule initial events
			s.getFEL().add(new OrderCall(s, 1l, null));
			
			TakeOrder.resRoles.get("orderTaker").setResPool(rp1);
			MakePizza.resRoles.get("pizzaMakers").setResPool(rp2);
			MakePizza.resRoles.get("oven").setResPool(rp3);
			DeliverPizza.resRoles.get("scooter").setResPool(rp4);
			
		};
		scenario.setSetupInitialState(setupInitialState);
		return scenario;
	}

	
	/*******************************************************
	 Simulation Model
	********************************************************/
	private Model initializeModel() {
		Model model = new Model();
		model.setName("Make-and-Deliver-Pizza-1");
		model.setTime(Time.CONT);
		model.setTimeUnit(TimeUnit.min);
		
		model.setObjectTypes(List.of(OrderTaker.class, PizzaMaker.class));
		model.setEventTypes(List.of(OrderCall.class));
		model.setActivityTypes(Set.of("TakeOrder","MakePizza","DeliverPizza"));
		return model;
	}
}
