package de.oes.core2.medicaldepartament_1a;

import java.util.ArrayList;
import java.util.List;

import de.oes.core2.activities.aCTIVITY;
import de.oes.core2.foundations.oBJECT;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class MedicalDepartment extends oBJECT{

	private Integer nmrOfAvailDoctors;
	private List<aCTIVITY> plannedExaminations;
	
	public MedicalDepartment(Integer id, String name, Simulator sim, Integer nmrOfAvailDoctors) {
		super(id, name, sim);
		this.nmrOfAvailDoctors = nmrOfAvailDoctors;
		this.plannedExaminations = new ArrayList<aCTIVITY>();
	}
	
	public boolean isDoctorAvailable() {
		return this.nmrOfAvailDoctors > 0;
	}
	
	public void allocateDoctor() {
		this.nmrOfAvailDoctors--;
	}
	
	public void releaseDoctor() {
		this.nmrOfAvailDoctors++;
	}
}
