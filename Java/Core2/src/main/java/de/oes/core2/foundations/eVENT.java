package de.oes.core2.foundations;

import java.util.Comparator;

import java.util.List;
import java.util.Objects;
import java.util.function.Consumer;

import de.oes.core2.lib.MathLib;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public abstract class eVENT {
	
	private Simulator sim;
	private Number occTime;
	private Number delay;
	private Integer priority;
	private Number startTime;
	private Number duration;
	
	public eVENT(Simulator sim, Number occTime, Number delay, Number startTime, Number duration) {
		super();
		this.sim = sim;
		
		if(Objects.nonNull(occTime)) {
			this.occTime = occTime;
		} else if(Objects.nonNull(delay)) {
			this.occTime = MathLib.round(sim.getTime().doubleValue() + delay.doubleValue());
		} else if(Objects.nonNull(startTime)) { // e.g., an activity
			if(startTime.doubleValue() > 0) { // a meaningful startTime
				this.startTime = startTime;
				if(Objects.nonNull(duration)) {
					this.duration = duration;
					this.occTime = startTime.doubleValue() + duration.doubleValue();
				}
		}
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
	public abstract String getSuccessorActivity();
	
	@Override
	public String toString() {
		return this.getClass().getSimpleName() + "@" + this.occTime;
	}
	
	public static Comparator<eVENT> rank() {
		return Comparator.comparing(eVENT::getPriority);
	}
}
