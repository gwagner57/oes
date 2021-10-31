package de.oes.core2;

import java.util.List;

import java.util.Set;
import java.util.Map.Entry;
import java.util.function.Consumer;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.AutowireCapableBeanFactory;
import org.springframework.boot.test.context.SpringBootTest;

import de.oes.core2.activities.rANGE;
import de.oes.core2.activities.rESOURCEpOOL;
import de.oes.core2.activities.rESOURCEsTATUS;
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

@SpringBootTest
public class LoadHaulDumpTest {

	@Autowired
	private  AutowireCapableBeanFactory autowireCapableBeanFactory;
	
	@Test
	public void testSuccess() throws Exception {
		Model model = new Model();
		model.setName("Load-Haul-Dump-1");
		model.setTime(Time.CONT);
		model.setTimeUnit(TimeUnit.min);
		model.setObjectTypes(List.of(Truck.class, WheelLoader.class));
		model.setEventTypes(List.of(HaulRequest.class));
		model.setActivityTypes(Set.of("GoToLoadingSite","Load","Haul","Dump","GoBackToLoadingSite","GoHome"));
		/*******************************************************
		 Default Scenario
		 ********************************************************/
		/* Do not define a fixed simulation duration since a simulation run ends,
		   when the job is done (i.e., when the simulator runs out of future events).
		 */
		Simulator sim = new Simulator();
		sim.getAClasses().put("GoToLoadingSite", new GoToLoadingSite(sim,0,0,null));
		sim.getAClasses().put("Load", new Load(sim,0,0,null));
		sim.getAClasses().put("Haul", new Haul(sim,0,0,null));
		sim.getAClasses().put("GoBackToLoadingSite", new GoBackToLoadingSite(sim,0,0,null));
		sim.getAClasses().put("GoHome", new GoHome(sim,0,0,null));
		sim.getAClasses().put("Dump", new Dump(sim,0,0,null));
		Scenario scenario = new Scenario();
		scenario.setTitle("The default scenario has 5 trucks (with IDs 1-5) and one wheel loader (with ID 11).");
//		scenario.setDurationInSimTime(300l);
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
		
		/*******************************************************
		 Alternative Scenarios
		 ********************************************************/
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
		/*******************************************************
		 Statistics variables
		********************************************************/
		Consumer<Simulator> setupStatistics = s -> {
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
		sim.setScenario(altScenario);
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
