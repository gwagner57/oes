package de.oes.core1;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.function.Consumer;

import org.assertj.core.util.Arrays;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import de.oes.core1.endpoint.activity.RunWorkstationSimulation;
import de.oes.core1.endpoint.ui.SimulationSettingsDTO;
import de.oes.core1.sim.Model;
import de.oes.core1.sim.Scenario;
import de.oes.core1.sim.Simulator;
import de.oes.core1.sim.Time;
import de.oes.core1.sim.TimeUnit;
import de.oes.core1.sim.eXPERIMENTtYPE;
import de.oes.core1.workstation.PartArrival;
import de.oes.core1.workstation.ProcessingEnd;
import de.oes.core1.workstation.ProcessingStart;
import de.oes.core1.workstation.WorkStation;

@SpringBootTest
public class WorkingStationTest {

	@Autowired
	private RunWorkstationSimulation workDesk;
	
	/**
	* <pre>
	* Description:
	* 
	* Prepare:
	* 
	* Mocks:
	* 
	* Test:
	* 
	* Check:
	* 
	* </pre>
	* @throws Exception
	*/
	@Test
	public void testSuccess() throws Exception {

		//prepare

		//mocks
		SimulationSettingsDTO dto = SimulationSettingsDTO.builder().init(0).type(0).simulationLog(false).build();
		org.springframework.ui.Model m = new org.springframework.ui.Model() {
			
			@Override
			public org.springframework.ui.Model mergeAttributes(Map<String, ?> attributes) {
				// TODO Auto-generated method stub
				return null;
			}
			
			@Override
			public Object getAttribute(String attributeName) {
				// TODO Auto-generated method stub
				return null;
			}
			
			@Override
			public boolean containsAttribute(String attributeName) {
				// TODO Auto-generated method stub
				return false;
			}
			
			@Override
			public Map<String, Object> asMap() {
				// TODO Auto-generated method stub
				return null;
			}
			
			@Override
			public org.springframework.ui.Model addAttribute(String attributeName, Object attributeValue) {
				// TODO Auto-generated method stub
				return null;
			}
			
			@Override
			public org.springframework.ui.Model addAttribute(Object attributeValue) {
				// TODO Auto-generated method stub
				return null;
			}
			
			@Override
			public org.springframework.ui.Model addAllAttributes(Map<String, ?> attributes) {
				// TODO Auto-generated method stub
				return null;
			}
			
			@Override
			public org.springframework.ui.Model addAllAttributes(Collection<?> attributeValues) {
				// TODO Auto-generated method stub
				return null;
			}
		};
		//test
		workDesk.run(dto, m);

	}
	@Test
	public void testSuccessExperiment() throws Exception {
		//prepare
		/*******************************************************
		 Simulation Model
		********************************************************/
		Model model = new Model();
		model.setName("Workstation");
		model.setTime(Time.CONT);
		model.setTimeUnit(TimeUnit.min);
		model.setObjectTypes(List.of(WorkStation.class));
		model.setEventTypes(List.of(PartArrival.class, ProcessingEnd.class, ProcessingStart.class));
		
		/*******************************************************
		 Simulation Scenario
		 ********************************************************/
		Simulator sim = new Simulator();
		Scenario scenario = new Scenario();
		scenario.setTitle("Basic scenario with one service desk");
		scenario.setDurationInSimTime(168l * 60);// 168 hours
		scenario.setIdCounter(11);// start value of auto IDs
		// Initial State
		Consumer<Simulator> setupInitialState = s -> {
			 // Create initial objects
			WorkStation ws = new WorkStation(1, "WorkStation", sim, 0l, "AVAILABLE");
			// Schedule initial events
			s.getFEL().add(new PartArrival(s, 1l, null, ws));
		};
		scenario.setSetupInitialState(setupInitialState);
		
		/*******************************************************
		 Alternative Scenarios
		 ********************************************************/
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
		
		sim.getScenarios().add(altScenario1);
		sim.getScenarios().add(altScenario2);
		
		/*******************************************************
		 Statistics variables
		********************************************************/
		Consumer<Simulator> setupStatistics = s -> {
			 s.getStat().put("arrivedParts", Integer.valueOf(0));
			 s.getStat().put("departedParts", Integer.valueOf(0));
			 s.getStat().put("maxQueueLength", Integer.valueOf(0));
		};
		model.setSetupStatistics(setupStatistics);
		
		/*******************************************************
		 Define an experiment (type)
		********************************************************/
		
		
		eXPERIMENTtYPE expType = new eXPERIMENTtYPE(
		model,
		"Simple Experiment with 10 replications, each running for "  + scenario.getDurationInSimTime() + " " + model.getTimeUnit(),
		10, // nmrOfReplications
		null, // parameterDef
		Arrays.array(123, 234, 345, 456, 567, 678, 789, 890, 901, 1012) // seeds
		);
		
		sim.setExperimentType(expType);
		sim.setModel(model);
		sim.setScenario(scenario);
		//test
		
		// standalone
		sim.runStandaloneScenario(true);
		System.out.println("FINAL STAT");
		for (Entry<String, Number> e : sim.getStat().entrySet()) {
			System.out.println(e.getKey() + " : " + e.getValue());
		}
		
		//experiment
//		sim.runExperiment(true);
	}
}
