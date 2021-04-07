package de.oes.core1.workstation;

import de.oes.core1.foundations.oBJECT;
import de.oes.core1.lib.Rand;
import de.oes.core1.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkStation extends oBJECT {

	private Long inputBufferLength = 0l;
	private String status = "AVAILABLE";
	
	public WorkStation(Integer id, String name, Simulator sim, Long inputBufferLength, String status) {
		super(id, name, sim);
		this.inputBufferLength = inputBufferLength;
		this.status = status;
	}
	
	public static Number processingTime() {
		return Rand.triangular(3, 8, 4); // min,max,mode
	}
	
	public void incrementBufferLength() {
		this.inputBufferLength++;
	}
	
	public void decrementBufferLength() {
		this.inputBufferLength--;
	}
	
	@Override
	public String toString() {
		return this.getName() + "{ bufLen: " + this.inputBufferLength +", st: " + this.status +"}";
	}

}
