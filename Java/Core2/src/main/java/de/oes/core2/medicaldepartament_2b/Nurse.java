package de.oes.core2.medicaldepartament_2b;

import de.oes.core2.activities.rESOURCE;
import de.oes.core2.activities.rESOURCEpOOL;
import de.oes.core2.activities.rESOURCEsTATUS;
import de.oes.core2.sim.Simulator;

public class Nurse extends rESOURCE {

	public Nurse(Integer id, String name, Simulator sim, rESOURCEpOOL resourcePool, rESOURCEsTATUS status) {
		super(id, name, sim, resourcePool, status);
	}

}
