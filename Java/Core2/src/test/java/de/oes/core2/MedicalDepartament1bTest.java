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
import de.oes.core2.medicaldepartament_1b.Examination;
import de.oes.core2.medicaldepartament_1b.NewCase;
import de.oes.core2.sim.ActivityStat;
import de.oes.core2.sim.Model;
import de.oes.core2.sim.Scenario;
import de.oes.core2.sim.Simulator;
import de.oes.core2.sim.Time;
import de.oes.core2.sim.TimeUnit;
import de.oes.core2.sim.eXPERIMENTtYPE;

@SpringBootTest
public class MedicalDepartament1bTest {

	@Autowired
	private  AutowireCapableBeanFactory autowireCapableBeanFactory;
	
	@Test
	public void testSuccess() throws Exception {
		Model model = new Model();
		model.setName("Medical-Department-1b");
		model.setTime(Time.CONT);
		model.setTimeUnit(TimeUnit.min);
		
		model.setEventTypes(List.of(NewCase.class));
		model.setActivityTypes(Set.of("Examination"));
		/*******************************************************
		 Simulation Scenario
		 ********************************************************/
		Simulator sim = new Simulator();
		sim.getAClasses().put("Examination", new Examination(sim,0,0,0));
		Scenario scenario = new Scenario();
		scenario.setIdCounter(11); // start value of auto IDs
		scenario.setTitle("Basic scenario with one medical department");
		scenario.setDurationInSimTime(1000l);
		// Initial State
		Consumer<Simulator> setupInitialState = s -> {
			 // Create initial objects
			rANGE range = new rANGE();
			rESOURCEpOOL rp = new rESOURCEpOOL(s, "doctors", range, 3, null);
			// Schedule initial events
			Examination.resRoles.get("doctors").setCountPoolName("doctors");
			Examination.resRoles.get("doctors").setResPool(rp);
			s.getFEL().add(new NewCase(s, 1l, null, null, null));
		};
		scenario.setSetupInitialState(setupInitialState);
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
		expType.setStoreExpResults(false);
		
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
