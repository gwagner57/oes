package de.oes.core2.activities;

import de.oes.core2.sim.Simulator;

public abstract class SuccAT extends aCTIVITY {

	public SuccAT(Simulator sim, Number id, Number occTime, Number startTime, Number duration, Number enqueueTime) {
		super(sim, id, occTime, startTime, duration, enqueueTime);
	}
}
