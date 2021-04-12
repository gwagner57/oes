package de.oes.core1.foundations;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;

import de.oes.core1.lib.MathLib;
import de.oes.core1.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class eVENT {
	
	private Simulator sim;
	private Number occTime;
	private Number delay;
	private Integer priority;
	
	public eVENT(Simulator sim, Number occTime, Number delay) {
		super();
		this.sim = sim;
		
		if(!Objects.isNull(occTime)) {
			this.occTime = occTime;
		} else if(!Objects.isNull(delay)) {
			this.occTime = MathLib.round(sim.getTime().doubleValue() + delay.doubleValue());
		} else {
			this.occTime =  MathLib.round(sim.getTime() + sim.getNextMomentDeltaT());
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
	
	public static Comparator<eVENT> rank() {
		return Comparator.comparing(eVENT::getPriority);
	}
}
