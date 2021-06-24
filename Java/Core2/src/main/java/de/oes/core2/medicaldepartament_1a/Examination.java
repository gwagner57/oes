package de.oes.core2.medicaldepartament_1a;

import java.util.ArrayList;
import java.util.List;

import de.oes.core2.foundations.ExogenousEvent;
import de.oes.core2.foundations.eVENT;
import de.oes.core2.lib.Rand;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Examination extends ExogenousEvent {

	private MedicalDepartment medicalDepartment;
	
	public Examination(Simulator sim, Number occTime, Number delay, Number startTime, Number duration,
			MedicalDepartment medicalDepartment) {
		super(sim, occTime, delay, startTime, duration);
		this.medicalDepartment = medicalDepartment;
	}
	
	@Override
	public List<eVENT> onEvent() {
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		MedicalDepartment medDep = this.medicalDepartment;
		
		return null;
	}

	@Override
	public String getSuccessorActivity() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Number reccurence() {
		return Rand.exponential(0.3);
	}

	@Override
	public eVENT createNextEvent() {
		// TODO Auto-generated method stub
		return null;
	}

}
