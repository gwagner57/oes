package de.oes.core2.loadhauldump;

import de.oes.core2.activities.rESOURCE;
import de.oes.core2.activities.rESOURCEpOOL;
import de.oes.core2.activities.rESOURCEsTATUS;
import de.oes.core2.sim.Simulator;

public class WheelLoader extends rESOURCE{

	public WheelLoader(Integer id, String name, Simulator sim, rESOURCEsTATUS status) {
		super(id, name, sim, null, status);
	}
}
