package de.oes.core1.endpoint.activity;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;
import java.util.function.Consumer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.AutowireCapableBeanFactory;
import org.springframework.stereotype.Component;

import de.oes.core1.endpoint.ui.ExperimentsStatisticsDTO;
import de.oes.core1.endpoint.ui.SimulationSettingsDTO;
import de.oes.core1.inventorymanagment.DailyDemand;
import de.oes.core1.inventorymanagment.Delivery;
import de.oes.core1.inventorymanagment.SingleProductShop;
import de.oes.core1.sim.Model;
import de.oes.core1.sim.Scenario;
import de.oes.core1.sim.Simulator;
import de.oes.core1.sim.SimulatorUI;
import de.oes.core1.sim.Time;
import de.oes.core1.sim.TimeUnit;
import de.oes.core1.sim.eXPERIMENTpARAMdEF;
import de.oes.core1.sim.eXPERIMENTtYPE;

@Component
public class RunInventoryManagmentSimulation {

	@Autowired
	private  AutowireCapableBeanFactory autowireCapableBeanFactory;
	
	public void run(SimulationSettingsDTO dto, org.springframework.ui.Model m) {
		Model model = initializeModel();
		Simulator sim = new Simulator();
		Scenario scenario = new Scenario();
		setUpInitState(scenario);
		setStatisticVariables(model, sim);
		initSimulation(model, sim, scenario);
		defineExperimentTypes(sim, model);
		switch ((int) dto.getInit()) {
		case 0:
			runStandaloneScenario(sim, dto.isSimulationLog());
			m.addAttribute("stat", sim.getStat());
			if(dto.isSimulationLog()) m.addAttribute("logs", SimulatorUI.getLogs());
			break;
		case 1:
			m.addAttribute("stat", runExperiment(sim, sim.getExperimentTypes().get(0), dto.isSimulationLog()));
			break;
		case 2:
			m.addAttribute("stat", runExperiment(sim, sim.getExperimentTypes().get(1), dto.isSimulationLog()));
			break;
		case 3:
			m.addAttribute("stat", runExperiment(sim, sim.getExperimentTypes().get(2), dto.isSimulationLog()));
			break;
		default:
			break;
		}
	}
	
	/*******************************************************
	 Define experiment types
	********************************************************/
	private void defineExperimentTypes(Simulator sim, Model model) {
		List<eXPERIMENTtYPE> expTypes = new ArrayList<eXPERIMENTtYPE>();
		
		eXPERIMENTtYPE e1 = new eXPERIMENTtYPE(
				model,
				"Simple experiment with 10 replications, each running for" + sim.getScenario().getDurationInSimTime() + " " + sim.getModel().getTimeUnit(),
				10,
				null,
				new Integer[] {123, 234, 345, 456, 567, 678, 789, 890, 901, 1012}
				);
		
		
		//String name, Set <Number> values, Integer startValue, Integer endValue, Integer stepSize
		eXPERIMENTpARAMdEF eXPERIMENTpARAMdEF1_1 = new eXPERIMENTpARAMdEF(
				"reviewPolicy",
				Set.of("periodic"),
				null,
				null,
				null
				);
		eXPERIMENTpARAMdEF eXPERIMENTpARAMdEF1_2 = new eXPERIMENTpARAMdEF(
				"reorderInterval",
				Set.of(2,3,4),
				null,
				null,
				null
				);
		eXPERIMENTpARAMdEF eXPERIMENTpARAMdEF1_3 = new eXPERIMENTpARAMdEF(
				"targetInventory",
				null,
				80,
				100,
				10
				);
		
		eXPERIMENTtYPE e2 = new eXPERIMENTtYPE(
				model,
				"Parameter variation experiment for exploring reorderInterval and targetInventory",
				10,
				null,
				new Integer[] {123, 234, 345, 456, 567, 678, 789, 890, 901, 1012}
				);
		e2.setParameterDefs(List.of(eXPERIMENTpARAMdEF1_1, eXPERIMENTpARAMdEF1_2, eXPERIMENTpARAMdEF1_3));
		
		eXPERIMENTpARAMdEF eXPERIMENTpARAMdEF2_1 = new eXPERIMENTpARAMdEF(
				"reviewPolicy",
				Set.of("periodic", "continuous"),
				null,
				null,
				null
				);
		eXPERIMENTtYPE e3 = new eXPERIMENTtYPE(
				model,
				"Parameter variation experiment for comparing policies",
				10,
				null,
				null
				);
		e3.setParameterDefs(List.of(eXPERIMENTpARAMdEF2_1));
		
		expTypes.add(e1);
		expTypes.add(e2);
		expTypes.add(e3);
		sim.setExperimentTypes(expTypes);
	}
	
	private ExperimentsStatisticsDTO runExperiment(Simulator sim, eXPERIMENTtYPE expType, boolean logs) {
		autowireCapableBeanFactory.autowireBean(sim);
		sim.setExperimentType(expType);
		return sim.runExperiment(logs);
	}
	
	private void runStandaloneScenario(Simulator sim, boolean logs) {
		sim.runStandaloneScenario(logs);
		System.out.println("FINAL STAT");
		for (Entry<String, Number> e : sim.getStat().entrySet()) {
			System.out.println(e.getKey() + " : " + e.getValue());
		}
	}
	
	private void initSimulation(Model model, Simulator sim, Scenario scenario) {
		sim.setModel(model);
		sim.setScenario(scenario);
	}
	
	
	/*******************************************************
	 Simulation Model
	********************************************************/
	private Model initializeModel() {
		Model model = new Model();
		model.setName("Inventory-Management-1");
		model.setTime(Time.DISCR);
		model.setTimeUnit(TimeUnit.days);
		model.setObjectTypes(List.of(SingleProductShop.class));
		model.setEventTypes(List.of(DailyDemand.class, Delivery.class));
		
		Map<String, Object> p = new HashMap<>();
		p.put("reviewPolicy", "continuous");
		p.put("targetInventory", 100);
		p.put("reorderInterval", 3);
		model.setP(p);
		
		return model;
	}
	
	/*******************************************************
	 Initial State
	********************************************************/
	private void  setUpInitState(Scenario scenario) {
		// Initial State
		Consumer<Simulator> setupInitialState = s -> {
			 // Create initial objects
			SingleProductShop tvShop = new SingleProductShop(
					1, // id
					"TV Shop", // name
					s, // simulation
					80, // stockQuantity
					50, // reorderPoint
					100,
					3);
			// Schedule initial events
			s.getFEL().add(new DailyDemand(s, 1l, null, 25, tvShop));
		};
		scenario.setDurationInSimTime(1000l);
		scenario.setSetupInitialState(setupInitialState);
	}
	

	/*******************************************************
	 Statistics variables
	********************************************************/
	private void setStatisticVariables(Model model, Simulator sim) {
		Consumer<Simulator> computeFinalStatistics = s -> {
			 s.getStat().put("serviceLevel", Double.valueOf((s.getTime().doubleValue() - s.getStat().get("nmrOfStockOuts").doubleValue()) / s.getTime().doubleValue() * 100.0));
		};
		model.setComputeFinalStatisctics(computeFinalStatistics);
		
		Consumer<Simulator> setupStatistics = s -> {
			 s.getStat().put("nmrOfStockOuts", Integer.valueOf(0));
			 s.getStat().put("lostSales", Integer.valueOf(0));
			 s.getStat().put("serviceLevel", Double.valueOf(0));
		};
		model.setSetupStatistics(setupStatistics);
	}

}
