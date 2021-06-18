package de.oes.core2.makeanddeliver;

import de.oes.core2.activities.rESOURCE;
import de.oes.core2.activities.rESOURCEsTATUS;
import de.oes.core2.sim.Simulator;

public class PizzaMaker extends rESOURCE{

	public PizzaMaker(Integer id, String name, Simulator sim, rESOURCEsTATUS status) {
		super(id, name, sim, null, status);
	}

}
