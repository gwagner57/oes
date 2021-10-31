package de.oes.core2.medicaldepartament_1a;

import java.util.ArrayList;
import java.util.List;

import de.oes.core2.activities.aCTIVITYsTART;
import de.oes.core2.foundations.ExogenousEvent;
import de.oes.core2.foundations.eVENT;
import de.oes.core2.lib.Rand;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NewCase extends ExogenousEvent {

	private MedicalDepartment medicalDepartment;
	
	public NewCase(Simulator sim, Number occTime, Number delay, Number startTime, Number duration,
			MedicalDepartment medicalDepartment) {
		super(sim, occTime, delay, startTime, duration);
		this.medicalDepartment = medicalDepartment;
	}
	
	@Override
	public List<eVENT> onEvent() {
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		MedicalDepartment medDep = this.medicalDepartment;
		Simulator sim = this.getSim();
		// update statistics
		sim.incrementStat("arrivedPatients", 1);
		
		if(medDep.getPlannedExaminations().size() > 
		sim.getStat().getSimpleStat().get("maxQueueLength").intValue()) {
			sim.updateStatValue("maxQueueLength", medDep.getPlannedExaminations().size());
		}
		
		if(medDep.isDoctorAvailable()) {
			// allocate resources
			medDep.allocateDoctor();
			// start next examination
			followupEvents.add(new aCTIVITYsTART(sim, null, null, 
			new Examination(sim, null, null, null, medDep)));
		} else { // queue up next planned examination
			medDep.getPlannedExaminations().add(new Examination(sim, null));
		}
		return followupEvents;
	}

	@Override
	public String getSuccessorActivity() {
		return null;
	}

	@Override
	public Number reccurence() {
		return Rand.exponential(0.3);
	}

	@Override
	public eVENT createNextEvent() {
		return new NewCase(this.getSim(), null, this.reccurence(), null, null, this.medicalDepartment);
	}

}
