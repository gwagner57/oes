package de.oes.core2;

import java.util.List;
import java.util.Set;
import java.util.Map.Entry;
import java.util.function.Consumer;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.AutowireCapableBeanFactory;
import org.springframework.boot.test.context.SpringBootTest;

import de.oes.core2.makeanddeliver.OrderCall;
import de.oes.core2.makeanddeliver.OrderTaker;
import de.oes.core2.makeanddeliver.PizzaMaker;
import de.oes.core2.makeanddeliver.TakeOrder;
import de.oes.core2.activities.rANGE;
import de.oes.core2.activities.rESOURCEpOOL;
import de.oes.core2.activities.rESOURCEsTATUS;
import de.oes.core2.makeanddeliver.DeliverPizza;
import de.oes.core2.makeanddeliver.MakePizza;
import de.oes.core2.sim.ActivityStat;
import de.oes.core2.sim.Model;
import de.oes.core2.sim.Scenario;
import de.oes.core2.sim.Simulator;
import de.oes.core2.sim.Time;
import de.oes.core2.sim.TimeUnit;
import de.oes.core2.sim.eXPERIMENTtYPE;

@SpringBootTest
public class MakeAndDeliverTest {

	@Autowired
	private  AutowireCapableBeanFactory autowireCapableBeanFactory;
	
	@Test
	public void testSuccess() throws Exception {
		//FIXME: add newInstance()
		Model model = new Model();
		model.setName("Make-and-Deliver-Pizza-1");
		model.setTime(Time.CONT);
		model.setTimeUnit(TimeUnit.min);
		
		model.setObjectTypes(List.of(OrderTaker.class, PizzaMaker.class));
		model.setEventTypes(List.of(OrderCall.class));
		model.setActivityTypes(Set.of("TakeOrder","MakePizza","DeliverPizza"));
		/*******************************************************
		 Simulation Scenario
		 ********************************************************/
		Simulator sim = new Simulator();
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
		/*******************************************************
		 Statistics variables
		********************************************************/
		Consumer<Simulator> setupStatistics = s -> {
			 s.getStat().getSimpleStat().put("deliveredPizzas", Integer.valueOf(0));
		};
		model.setSetupStatistics(setupStatistics);
		/*******************************************************
		 Define an experiment (type)
		********************************************************/
		eXPERIMENTtYPE expType = new eXPERIMENTtYPE(
				model,
				"Simple Experiment with 10 replications, each running for "  + scenario.getDurationInSimTime() + " " + model.getTimeUnit(),
				100, // nmrOfReplications
				null, // parameterDef
				new Integer[] {123, 234, 345, 456, 567, 678, 789, 890, 901, 1012} // seeds
				);
		expType.setStoreExpResults(true);
		
		sim.setExperimentType(expType);
		sim.setModel(model);
		sim.setScenario(scenario);
		//test
		autowireCapableBeanFactory.autowireBean(sim);
		sim.runStandaloneScenario(true);
		System.out.println("FINAL STAT");
		for (Entry<String, Number> e : sim.getStat().getSimpleStat().entrySet()) {
			System.out.println(e.getKey() + " : " + e.getValue());
		}
		for (Entry<String, ActivityStat> e : sim.getStat().getActTypes().entrySet()) {
			System.out.println(e.getKey() + " : " + e.getValue());
		}
	}
}
