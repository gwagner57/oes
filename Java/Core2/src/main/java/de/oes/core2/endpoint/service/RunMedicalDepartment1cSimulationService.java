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
import de.oes.core2.medicaldepartament_1c.Doctor;
import de.oes.core2.medicaldepartament_1c.Examination;
import de.oes.core2.medicaldepartament_1c.NewCase;
import de.oes.core2.sim.ActivityStat;
import de.oes.core2.sim.Model;
import de.oes.core2.sim.Scenario;
import de.oes.core2.sim.Simulator;
import de.oes.core2.sim.Time;
import de.oes.core2.sim.TimeUnit;
import de.oes.core2.sim.eXPERIMENTtYPE;

@Component
public class RunMedicalDepartment1cSimulationService {

	@Autowired
	private  AutowireCapableBeanFactory autowireCapableBeanFactory;
	
	public void run(SimulationSettingsDTO dto, org.springframework.ui.Model m) {
		Model model = initializeModel();
		Simulator sim = new Simulator();
		Scenario scenario = new Scenario();
		
		scenario = initScenario(sim);
		
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
		};
		model.setSetupStatistics(setupStatistics);
	}

	/*******************************************************
	 Simulation Scenario
	 ********************************************************/
	private Scenario initScenario(Simulator sim) {
		sim.getAClasses().put("Examination", new Examination(sim,0,0,0));
		Scenario scenario = new Scenario();
		scenario.setIdCounter(11); // start value of auto IDs
		scenario.setTitle("Basic scenario with one medical department");
		scenario.setDurationInSimTime(1000l);
		// Initial State
		Consumer<Simulator> setupInitialState = s -> {
			Doctor d1 = new Doctor(1, "d1", s, null, rESOURCEsTATUS.AVAILABLE);
			Doctor d2 = new Doctor(2, "d2", s, null, rESOURCEsTATUS.AVAILABLE);
			Doctor d3 = new Doctor(3, "d3", s, null, rESOURCEsTATUS.AVAILABLE);
			
			// Create initial objects
			rANGE range = new rANGE();
			rESOURCEpOOL rp = new rESOURCEpOOL(s, "doctors", range, 3, List.of(d1,d2,d3));
			d1.setResourcePool(rp);
			d2.setResourcePool(rp);
			d3.setResourcePool(rp);
			// Schedule initial events
			s.getResourcepools().put("doctors", rp);
			Examination.resRoles.get("doctor").setResPool(rp);
			s.getFEL().add(new NewCase(s, 1l, null, null, null));
		};
		scenario.setSetupInitialState(setupInitialState);
		return scenario;
	}

	
	/*******************************************************
	 Simulation Model
	********************************************************/
	private Model initializeModel() {
		Model model = new Model();
		model.setName("Medical-Department-1c");
		model.setTime(Time.CONT);
		model.setTimeUnit(TimeUnit.min);
		
		model.setEventTypes(List.of(NewCase.class));
		model.setActivityTypes(Set.of("Examination"));
		return model;
	}
}
