package de.oes.core0.foundations;

import java.util.List;
import java.util.Objects;

import de.oes.core0.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class eVENT {
	
	private Simulator sim;
	private Long occTime;
	private Long delay;
	
	public eVENT(Simulator sim, Long occTime, Long delay) {
		super();
		this.sim = sim;
		
		if(!Objects.isNull(occTime)) {
			this.occTime = occTime;
		} else if(!Objects.isNull(delay)) {
			this.occTime = sim.getTime() + delay;
		}
	}
	
	public eVENT(Simulator sim) {
		super();
		this.sim = sim;
		this.occTime = sim.getTime() + sim.getNextMomentDeltaT();
	}
	
	public abstract List<eVENT> onEvent();
	
	@Override
	public String toString() {
		return this.getClass().getSimpleName() + "@" + this.occTime;
	}
}
