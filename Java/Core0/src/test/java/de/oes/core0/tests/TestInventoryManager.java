package de.oes.core0.tests;

import java.util.List;

import java.util.Map;
import java.util.Map.Entry;
import java.util.function.Consumer;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import de.oes.core0.inventorymanagment.DailyDemand;
import de.oes.core0.inventorymanagment.Delivery;
import de.oes.core0.inventorymanagment.SingleProductShop;
import de.oes.core0.sim.ExperimentType;
import de.oes.core0.sim.Model;
import de.oes.core0.sim.Scenario;
import de.oes.core0.sim.Simulator;
import de.oes.core0.sim.Time;
import de.oes.core0.sim.TimeUnit;

@SpringBootTest
public class TestInventoryManager {
	
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
		Model model = new Model();
		model.setTime(Time.DISCR);
		model.setTimeUnit(TimeUnit.days);
		model.setObjectTypes(List.of(SingleProductShop.class));
		model.setEventTypes(List.of(DailyDemand.class, Delivery.class));
		Consumer<Simulator> setupStatistics = s -> {
			 s.getStat().put("nmrOfStockOuts", Integer.valueOf(0));
			 s.getStat().put("lostSales", Integer.valueOf(0));
			 s.getStat().put("serviceLevel", Double.valueOf(0));
		};
		model.setSetupStatistics(setupStatistics);
		Consumer<Simulator> computeFinalStatistics = s -> {
			 s.getStat().put("serviceLevel", Double.valueOf((s.getTime().doubleValue() - s.getStat().get("nmrOfStockOuts").doubleValue()) / s.getTime().doubleValue() * 100.0)); //FIXME
		};
		model.setComputeFinalStatisctics(computeFinalStatistics);
		
		Scenario scenario = new Scenario();
		scenario.setDurationInSimTime(1000l);
		Consumer<Simulator> setupInitialState = s -> {
			SingleProductShop tvShop = new SingleProductShop(1, "TV Shop", s, 80, 50, 100);
//			s.setObjects(Map.of("tvShop", tvShop)); //TODO used for?
			s.getFEL().add(new DailyDemand(s, 1l, 25, tvShop));
		};
		scenario.setSetupInitialState(setupInitialState);
		
		Simulator sim = new Simulator();
		sim.setModel(model);
		sim.setScenario(scenario);
		sim.setExperimentType(new ExperimentType(1, "Simple Experiment with 10 replications, each running for "  + sim.getScenario().getDurationInSimTime() + " " + sim.getModel().getTimeUnit(), 10));
		
		
		//mocks

		//test
//		sim.runStandaloneScenario();
		sim.runSimpleExperiment(sim.getExperimentType());
		//check
		sim.getModel().getComputeFinalStatisctics().accept(sim);
		
		System.out.println("FINAL STAT");
		for (Entry<String, Number> e : sim.getStat().entrySet()) {
			System.out.println(e.getKey() + " : " + e.getValue());
		}
	}
}
