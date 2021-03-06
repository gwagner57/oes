package de.oes.core0.tests;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Consumer;
import java.util.function.Supplier;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import de.oes.core0.foundations.oBJECT;
import de.oes.core0.lib.MathLib;
import de.oes.core0.servicedesk1.CustomerArrival;
import de.oes.core0.servicedesk1.CustomerDeparture;
import de.oes.core0.servicedesk1.ServiceDesk;
import de.oes.core0.sim.ExperimentType;
import de.oes.core0.sim.Model;
import de.oes.core0.sim.Scenario;
import de.oes.core0.sim.Simulator;
import de.oes.core0.sim.Time;
import de.oes.core0.sim.TimeUnit;

@SpringBootTest
public class ServiceDesk1Test {

	@Test
	public void testSuccess() throws Exception {
		//prepare
		Model model = new Model();
		model.setTime(Time.DISCR);
		model.setTimeUnit(TimeUnit.min);
		model.setObjectTypes(new ArrayList<Class<? extends oBJECT>>());
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
		
		Consumer<Simulator> setupStatistics = s -> {
			 s.getStat().put("arrivedCustomers", Integer.valueOf(0));
			 s.getStat().put("departedCustomers", Integer.valueOf(0));
			 s.getStat().put("maxQueueLength", Integer.valueOf(0));
		};
		model.setSetupStatistics(setupStatistics);
		
		Simulator sim = new Simulator();
		ServiceDesk sd = new ServiceDesk(1, "serviceDesk", sim, 0l);
		
		Scenario scenario = new Scenario();
		scenario.setDurationInSimTime(1000l);
		Consumer<Simulator> setupInitialState = s -> {
			s.getModel().getV().put("queueLength", Integer.valueOf(0));
			s.getFEL().add(new CustomerArrival(s, 1l, null, sd));
		};
		scenario.setSetupInitialState(setupInitialState);
		
		
		sim.setModel(model);
		sim.setScenario(scenario);
		sim.setExperimentType(new ExperimentType(1, "Simple Experiment with 10 replications, each running for "  + sim.getScenario().getDurationInSimTime() + " " + sim.getModel().getTimeUnit(), 10));
		//mocks

		//test
		sim.runStandaloneScenario();
		//check
		
		System.out.println("FINAL STAT");
		for (Entry<String, Number> e : sim.getStat().entrySet()) {
			System.out.println(e.getKey() + " : " + e.getValue());
		}
	}
	
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
	public void testSuccessExp() throws Exception {
		//prepare
		Model model = new Model();
		model.setTime(Time.DISCR);
		model.setTimeUnit(TimeUnit.min);
		model.setObjectTypes(new ArrayList<Class<? extends oBJECT>>());
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
		
		Consumer<Simulator> setupStatistics = s -> {
			 s.getStat().put("arrivedCustomers", Integer.valueOf(0));
			 s.getStat().put("departedCustomers", Integer.valueOf(0));
			 s.getStat().put("maxQueueLength", Integer.valueOf(0));
		};
		model.setSetupStatistics(setupStatistics);
		
		Simulator sim = new Simulator();
		
		Scenario scenario = new Scenario();
		scenario.setDurationInSimTime(1000l);
		Consumer<Simulator> setupInitialState = s -> {
			ServiceDesk sd = new ServiceDesk(1, "serviceDesk", sim, 0l);
			s.getModel().getV().put("queueLength", Integer.valueOf(0));
			s.getFEL().add(new CustomerArrival(s, 1l, null, sd));
		};
		scenario.setSetupInitialState(setupInitialState);
		
		
		sim.setModel(model);
		sim.setScenario(scenario);
		sim.setExperimentType(new ExperimentType(1, "Simple Experiment with 10 replications, each running for "  + sim.getScenario().getDurationInSimTime() + " " + sim.getModel().getTimeUnit(), 10));
		//mocks

		//test
		sim.runSimpleExperiment(sim.getExperimentType());

	}
}
