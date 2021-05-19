package de.oes.core2.foundations;

import java.util.List;

import de.oes.core2.sim.Simulator;

public class SuccAT extends aCTIVITY {

	public SuccAT(Simulator sim, Number id, Number occTime, Number startTime, Number duration, Number enqueueTime) {
		super(sim, id, occTime, startTime, duration, enqueueTime);
	}
	

	@Override
	public List<eVENT> onEvent() {
		// TODO Auto-generated method stub
		return null;
	}

}
