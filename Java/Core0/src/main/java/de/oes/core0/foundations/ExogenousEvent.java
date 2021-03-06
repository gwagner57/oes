package de.oes.core0.foundations;

import de.oes.core0.sim.Simulator;

public abstract class ExogenousEvent extends eVENT {

	public ExogenousEvent(Simulator sim) {
		super(sim);
	}
	
	public ExogenousEvent(Simulator sim, Long occTime, Long delay) {
		super(sim, occTime, delay);
	}

	public abstract Long reccurence();
	
	public abstract  eVENT createNextEvent();

}
