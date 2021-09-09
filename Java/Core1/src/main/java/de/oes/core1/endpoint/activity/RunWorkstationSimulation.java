package de.oes.core1.endpoint.activity;

import java.util.List;
import java.util.function.Consumer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.AutowireCapableBeanFactory;
import org.springframework.stereotype.Component;

import de.oes.core1.endpoint.ui.ExperimentsStatisticsDTO;
import de.oes.core1.endpoint.ui.SimulationSettingsDTO;
import de.oes.core1.sim.Model;
import de.oes.core1.sim.Scenario;
import de.oes.core1.sim.Simulator;
import de.oes.core1.sim.SimulatorUI;
import de.oes.core1.sim.Time;
import de.oes.core1.sim.TimeUnit;
import de.oes.core1.sim.eXPERIMENTtYPE;
import de.oes.core1.workstation.PartArrival;
import de.oes.core1.workstation.ProcessingEnd;
import de.oes.core1.workstation.ProcessingStart;
import de.oes.core1.workstation.WorkStation;

@Component
public class RunWorkstationSimulation {

	@Autowired
	private  AutowireCapableBeanFactory autowireCapableBeanFactory;
	
	public void run(SimulationSettingsDTO dto, org.springframework.ui.Model m) {
		//prepare
		Simulator sim = new Simulator();
		Model model = initModel();
		
		Scenario scenario = null;
		switch ((int) dto.getInit()) {
			case 0:
				scenario = initScenarion(sim);
				break;
			case 1:
				scenario = initAltScenario1(sim);
				break;
			case 3:
				scenario = initAltScenario2(sim);
				break;
			default:
				break;
		}
		
		setupStatisticVariables(model);
		initSimulation(sim, model, scenario);
		
		if(dto.getType() == 0) { // (0) Standalone scenario
			sim.runStandaloneScenario(dto.isSimulationLog());
			m.addAttribute("stat", sim.getStat());
			if(dto.isSimulationLog()) m.addAttribute("logs", SimulatorUI.getLogs());
		} else {  // (1) Simple Experiment with 10 replications, each running for 1000 min.
			eXPERIMENTtYPE expType = defineExpType(model, scenario);
			ExperimentsStatisticsDTO resutlDTO = runExperiment(sim, expType, dto.isSimulationLog());
			m.addAttribute("stat", resutlDTO);
		}
		
	}

	private void initSimulation(Simulator sim, Model model, Scenario scenario) {
		sim.setModel(model);
		sim.setScenario(scenario);
	}

	private ExperimentsStatisticsDTO runExperiment(Simulator sim, eXPERIMENTtYPE expType, boolean logs) {
		autowireCapableBeanFactory.autowireBean(sim);
		sim.setExperimentType(expType);
		return sim.runExperiment(logs);
	}
	
	/*******************************************************
	 Define an experiment (type)
	********************************************************/
	private eXPERIMENTtYPE defineExpType(Model model, Scenario scenario) {
		eXPERIMENTtYPE expType = new eXPERIMENTtYPE(
		model,
		"Simple Experiment with 10 replications, each running for "  + scenario.getDurationInSimTime() + " " + model.getTimeUnit(),
		10, // nmrOfReplications
		null, // parameterDef
		new Integer[] {123, 234, 345, 456, 567, 678, 789, 890, 901, 1012} // seeds
		);
		return expType;
	}

	/*******************************************************
	 Statistics variables
	********************************************************/
	private void setupStatisticVariables(Model model) {
		Consumer<Simulator> setupStatistics = s -> {
			 s.getStat().put("arrivedParts", Integer.valueOf(0));
			 s.getStat().put("departedParts", Integer.valueOf(0));
			 s.getStat().put("maxQueueLength", Integer.valueOf(0));
		};
		model.setSetupStatistics(setupStatistics);
	}

	private Scenario initAltScenario2(Simulator sim) {
		Scenario altScenario2 = new Scenario();
		altScenario2.setScenarioNo(2l);
		altScenario2.setTitle("Scenario with only 3 PartArrival events");
		altScenario2.setIdCounter(11);
		altScenario2.setDurationInSimTime(168l * 60);
		altScenario2.setSetupInitialState(s -> {
			 // Create initial objects
			WorkStation ws = new WorkStation(1, "WorkStation", sim, 0l, "AVAILABLE");
			// Schedule initial events
			s.getFEL().add(new PartArrival(s, 1l, null, ws));
			PartArrival.setMaxNmrOfEvents(3l);
		});
		return altScenario2;
	}

	private Scenario initAltScenario1(Simulator sim) {
		Scenario altScenario1 = new Scenario();
		altScenario1.setScenarioNo(1l);
		altScenario1.setTitle("Scenario with two workstations");
		altScenario1.setIdCounter(11);
		altScenario1.setDurationInSimTime(168l * 60);
		altScenario1.setSetupInitialState(s -> {
			 // Create initial objects
			WorkStation ws1 = new WorkStation(1, "WorkStation1", sim, 0l, "AVAILABLE");
			WorkStation ws2 = new WorkStation(2, "WorkStation2", sim, 0l, "AVAILABLE");
			// Schedule initial events
			s.getFEL().add(new PartArrival(s, 1l, null, ws1));
			s.getFEL().add(new PartArrival(s, 2l, null, ws2));
		});
		return altScenario1;
	}

	/*******************************************************
	 Simulation Scenario
	 ********************************************************/
	private Scenario initScenarion(Simulator sim) {
		Scenario scenario = new Scenario();
		scenario.setTitle("Basic scenario with one service desk");
		scenario.setDurationInSimTime(168l * 60);// 168 hours
		scenario.setIdCounter(11);// start value of auto IDs
		// Initial State
		Consumer<Simulator> setupInitialState = s -> {
			 // Create initial objects
			WorkStation ws = new WorkStation(1, "WorkStation", sim, 0l, "AVAILABLE");
			// Schedule initial events
			s.getFEL().add(new PartArrival(s, 1.0, null, ws));
		};
		scenario.setSetupInitialState(setupInitialState);
		return scenario;
	}

	/*******************************************************
	 Simulation Model
	********************************************************/
	private Model initModel() {
		Model model = new Model();
		model.setName("Workstation");
		model.setTime(Time.CONT);
		model.setTimeUnit(TimeUnit.min);
		model.setObjectTypes(List.of(WorkStation.class));
		model.setEventTypes(List.of(PartArrival.class, ProcessingEnd.class, ProcessingStart.class));
		return model;
	}
}
