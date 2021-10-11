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
import de.oes.core2.medicaldepartament_2b.Doctor;
import de.oes.core2.medicaldepartament_2b.Examination;
import de.oes.core2.medicaldepartament_2b.NewCase;
import de.oes.core2.medicaldepartament_2b.Nurse;
import de.oes.core2.medicaldepartament_2b.WalkToRoom;
import de.oes.core2.sim.ActivityStat;
import de.oes.core2.sim.Model;
import de.oes.core2.sim.Scenario;
import de.oes.core2.sim.Simulator;
import de.oes.core2.sim.Time;
import de.oes.core2.sim.TimeUnit;
import de.oes.core2.sim.eXPERIMENTtYPE;

@SpringBootTest
public class MedicalDepartment2bTest {
	
	@Autowired
	private  AutowireCapableBeanFactory autowireCapableBeanFactory;
	
	@Test
	public void testSuccess() throws Exception {
		Model model = new Model();
		model.setName("Medical-Department-2a");
		model.setTime(Time.CONT);
		model.setTimeUnit(TimeUnit.min);
		
		model.setObjectTypes(List.of(Nurse.class, Doctor.class));
		model.setEventTypes(List.of(NewCase.class));
		model.setActivityTypes(Set.of("Examination", "WalkToRoom"));
		/*******************************************************
		 Simulation Scenario
		 ********************************************************/
		Simulator sim = new Simulator();
		sim.getAClasses().put("Examination", new Examination(sim,0,0,0));
		sim.getAClasses().put("WalkToRoom", new WalkToRoom(sim,0,0,0));
		Scenario scenario = new Scenario();
		scenario.setIdCounter(11); // start value of auto IDs
		scenario.setDurationInSimTime(1000l);
		// Initial State
		Consumer<Simulator> setupInitialState = s -> {
			Doctor d1 = new Doctor(1, "d1", s, null, rESOURCEsTATUS.AVAILABLE);
			Doctor d2 = new Doctor(2, "d2", s, null, rESOURCEsTATUS.AVAILABLE);
			Doctor d3 = new Doctor(3, "d3", s, null, rESOURCEsTATUS.AVAILABLE);
			Nurse n1 = new Nurse(11, "n1", s, null, rESOURCEsTATUS.AVAILABLE);
			Nurse n2 = new Nurse(12, "n2", s, null, rESOURCEsTATUS.AVAILABLE);
			Nurse n3 = new Nurse(13, "n3", s, null, rESOURCEsTATUS.AVAILABLE);
			Nurse n4 = new Nurse(14, "n4", s, null, rESOURCEsTATUS.AVAILABLE);
			Nurse n5 = new Nurse(15, "n5", s, null, rESOURCEsTATUS.AVAILABLE);
			Nurse n6 = new Nurse(16, "n6", s, null, rESOURCEsTATUS.AVAILABLE);
			Nurse n7 = new Nurse(17, "n7", s, null, rESOURCEsTATUS.AVAILABLE);
			
			
			// Initialize the individual resource pools
			rANGE range = new rANGE();
			rESOURCEpOOL rp = new rESOURCEpOOL(s, "doctors", range, 3, List.of(d1,d2,d3));
			d1.setResourcePool(rp);
			d2.setResourcePool(rp);
			d3.setResourcePool(rp);
			
			rESOURCEpOOL rp2 = new rESOURCEpOOL(s, "nurses", range, 7, List.of(n1,n2,n3,n4,n5,n6,n7));
			n1.setResourcePool(rp2);
			n2.setResourcePool(rp2);
			n3.setResourcePool(rp2);
			n4.setResourcePool(rp2);
			n5.setResourcePool(rp2);
			n6.setResourcePool(rp2);
			n7.setResourcePool(rp2);
			
			  // Initialize the count pools
			rESOURCEpOOL rp3 = new rESOURCEpOOL(s, "rooms", range, 4, null);
			
			// Schedule initial events
			// TODO is it needed?
			s.getResourcepools().put("doctors", rp);
			s.getResourcepools().put("rooms", rp3);
			
			Examination.resRoles.get("doctor").setResPool(rp);
			Examination.resRoles.get("nurse").setResPool(rp2);
			Examination.resRoles.get("room").setResPool(rp3);
			
			WalkToRoom.resRoles.get("nurse").setResPool(rp2);
			WalkToRoom.resRoles.get("room").setResPool(rp3);
			
			//Schedule initial events
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
