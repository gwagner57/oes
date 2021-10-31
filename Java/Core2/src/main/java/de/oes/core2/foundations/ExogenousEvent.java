package de.oes.core2.foundations;

import de.oes.core2.sim.Simulator;

public abstract class ExogenousEvent extends eVENT {

	public ExogenousEvent(Simulator sim) {
		super(sim);
	}
	
	public ExogenousEvent(Simulator sim, Number occTime, Number delay) {
		super(sim, occTime, delay, null, null);
	}
	
	
	public ExogenousEvent(Simulator sim, Number occTime, Number delay, 	Number startTime, Number duration) {
		super(sim, occTime, delay, startTime, duration);
	}


	public abstract Number reccurence();
	
	public abstract  eVENT createNextEvent();

}
