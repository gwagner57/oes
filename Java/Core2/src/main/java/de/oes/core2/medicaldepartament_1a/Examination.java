package de.oes.core2.medicaldepartament_1a;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import de.oes.core2.activities.aCTIVITY;
import de.oes.core2.activities.aCTIVITYsTART;
import de.oes.core2.activities.rESOURCE;
import de.oes.core2.activities.rESOURCErOLE;
import de.oes.core2.activities.tASKqUEUE;
import de.oes.core2.foundations.eVENT;
import de.oes.core2.lib.Rand;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Examination extends aCTIVITY {

	private MedicalDepartment medicalDepartment;
	private static tASKqUEUE tasks;
	public Map<String, List<rESOURCE>> resources = new HashMap <String, List<rESOURCE>>();
	public static Map<String, rESOURCErOLE> resRoles = new HashMap<String, rESOURCErOLE>();
	
	public Examination(Simulator sim, Number id, Number startTime, Number duration,
			MedicalDepartment medicalDepartment) {
		super(sim, id, null, startTime, duration, null);
		this.medicalDepartment = medicalDepartment;
		this.durationFunc = this::duration;
		this.onActivityEnd = this::onActivityEnd;
	}

	public Examination(Simulator sim, MedicalDepartment medicalDepartment) {
		super(sim, null, null, null, null, null);
		this.medicalDepartment = medicalDepartment;
		this.durationFunc = this::duration;
		this.onActivityEnd = this::onActivityEnd;
	}

	private Number duration() {
		return Rand.uniform(5,10);
	}
	
	public List<eVENT> onActivityEnd() {
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		MedicalDepartment medDep = this.medicalDepartment;
		Simulator sim = this.getSim();
		// update statistics
		sim.incrementStat("departedPatients", 1);
		// if there are still planned examinations (waiting patients) 
		if(medDep.getPlannedExaminations().size() > 0) {
			// dequeue next planned exam;
			Examination plannedExam = medDep.getPlannedExaminations().remove(0);
			 // start next examination at the same department
			plannedExam.setMedicalDepartment(this.medicalDepartment);
			followupEvents.add(new aCTIVITYsTART(getSim(), null, null, plannedExam));
		} else {
			medDep.releaseDoctor();
		}
		return followupEvents;
	}
	
	@Override
	public tASKqUEUE getTasks() {
		return Examination.tasks;
	}

	@Override
	public void setTasks(tASKqUEUE t) {
		 Examination.tasks = t;
	}

	@Override
	public Map<String, List<rESOURCE>> getResources() {
		return this.resources;
	}

	@Override
	public void setResources(Map<String, List<rESOURCE>> res) {
		this.resources = res;
	}

	@Override
	public Map<String, rESOURCErOLE> getResourceRoles() {
		return Examination.resRoles;
	}

	@Override
	public void setResourceRoles(Map<String, rESOURCErOLE> resRoles) {
		Examination.resRoles = resRoles;
	}

	@Override
	public List<rESOURCE> get(String resRoleName) {
		return this.resources.get(resRoleName);
	}

	@Override
	public void put(List<rESOURCE> rESOURCEs, String resRoleName) {
		this.resources.put(resRoleName, rESOURCEs);
	}

	@Override
	public void delete(String resRoleName) {
		this.resources.remove(resRoleName);
	}

	@Override
	public String getSuccessorActivity() {
		return null;
	}

	@Override
	public aCTIVITY newInstance() {
		return new Examination(this.getSim(), this.medicalDepartment);
	}

	@Override
	public List<eVENT> onEvent() {
		// TODO Auto-generated method stub
		return null;
	}

}
