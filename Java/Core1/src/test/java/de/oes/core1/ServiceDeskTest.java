package de.oes.core1;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import java.util.function.Supplier;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.AutowireCapableBeanFactory;
import org.springframework.boot.test.context.SpringBootTest;

import de.oes.core1.endpoint.activity.RunServiceDeskSimulation;
import de.oes.core1.endpoint.ui.SimulationSettingsDTO;
import de.oes.core1.lib.MathLib;
import de.oes.core1.servicedesk.Customer;
import de.oes.core1.servicedesk.CustomerArrival;
import de.oes.core1.servicedesk.CustomerDeparture;
import de.oes.core1.servicedesk.ServiceDesk;
import de.oes.core1.sim.eXPERIMENTtYPE;
import de.oes.core1.sim.Model;
import de.oes.core1.sim.Scenario;
import de.oes.core1.sim.Simulator;
import de.oes.core1.sim.Time;
import de.oes.core1.sim.TimeUnit;

@SpringBootTest
public class ServiceDeskTest {
	
	@Autowired
	private  AutowireCapableBeanFactory autowireCapableBeanFactory;
	
	@Autowired
	private RunServiceDeskSimulation sim;
	
	@Test
	public void testSuccess() throws Exception {
		SimulationSettingsDTO dto = new SimulationSettingsDTO();
		dto.setInit(0);
		dto.setType(1);
		dto.setSimulationLog(true);
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
		sim.run(dto, m);
	}
	
	@Test
	public void testSuccessExperiment() throws Exception {
		//prepare
		/*******************************************************
		 Simulation Model
		********************************************************/
		Model model = new Model();
		model.setName("Service-Desk-1");
		model.setTime(Time.CONT);
		model.setTimeUnit(TimeUnit.min);
		model.setObjectTypes(List.of(ServiceDesk.class, Customer.class));
		model.setEventTypes(List.of(CustomerArrival.class, CustomerDeparture.class));
		Supplier<Integer> serviceTime = new Supplier<Integer>() {
			@Override
			public Integer get() {
				  Integer r = MathLib.getUniformRandomInteger( 0, 99);
				  if ( r < 30) return 2;         // probability 0.30
				  else if ( r < 80) return 3;    // probability 0.50
				  else return 4;                 // probability 0.20
			}
		};
		model.setF(Map.of("serviceTime", serviceTime));
		
		
		
		Simulator sim = new Simulator();
		
		/*******************************************************
		 Simulation Scenario
		 ********************************************************/
		Scenario scenario = new Scenario();
		scenario.setTitle("Basic scenario with one service desk");
		scenario.setDurationInSimTime(1000l);
//		scenario.setDurationInSimSteps(1000l);
//		scenario.setDurationInCpuTime(1000l); //seconds
		
		scenario.setIdCounter(11);// start value of auto IDs
		// Initial State
		Consumer<Simulator> setupInitialState = s -> {
			 // Create initial objects
			ServiceDesk sd = new ServiceDesk(1, "serviceDesk", sim, 0l);
			// Schedule initial events
			s.getFEL().add(new CustomerArrival(s, 1l, null, sd));
		};
		scenario.setSetupInitialState(setupInitialState);
		
		/*******************************************************
		 Alternative Scenarios
		 ********************************************************/
		Scenario altScenario = new Scenario();
		altScenario.setScenarioNo(1l);
		altScenario.setTitle("Scenario with two service desks");
		Consumer<Simulator> setupInitialStateAlt = s -> {
			 // Create initial objects
			ServiceDesk sd1 = new ServiceDesk(1, "serviceDesk1", sim, 0l);
			ServiceDesk sd2 = new ServiceDesk(2, "serviceDesk2", sim, 0l);
			// Schedule initial events
			s.getFEL().add(new CustomerArrival(s, 1l, null, sd1));
			s.getFEL().add(new CustomerArrival(s, 2l, null, sd2));
		};
		altScenario.setSetupInitialState(setupInitialStateAlt);
		sim.getScenarios().add(altScenario);
		
		/*******************************************************
		 Statistics variables
		********************************************************/
		Consumer<Simulator> computeFinalStatistics = s -> {
			 s.getStat().put("meanTimeInSystem", MathLib.round(Double.valueOf(sim.getStat().get("cumulativeTimeInSystem").doubleValue() / sim.getStat().get("departedCustomers").doubleValue())));
		};
		model.setComputeFinalStatisctics(computeFinalStatistics);
		
		Consumer<Simulator> setupStatistics = s -> {
			 s.getStat().put("arrivedCustomers", Integer.valueOf(0));
			 s.getStat().put("departedCustomers", Integer.valueOf(0));
			 s.getStat().put("cumulativeTimeInSystem", Double.valueOf(0));
			 s.getStat().put("meanTimeInSystem", Double.valueOf(0));
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
		new Integer[] {123, 234, 345, 456, 567, 678, 789, 890, 901, 1012} // seeds
		);
		expType.setStoreExpResults(true);
		
		sim.setExperimentType(expType);
		sim.setModel(model);
		sim.setScenario(scenario);
		//test
		
		// standalone
//		sim.runStandaloneScenario(true);
//		System.out.println("FINAL STAT");
//		for (Entry<String, Number> e : sim.getStat().entrySet()) {
//			System.out.println(e.getKey() + " : " + e.getValue());
//		}
		
		//experiment
		autowireCapableBeanFactory.autowireBean(sim);
		sim.runExperiment(true);
	}
}
