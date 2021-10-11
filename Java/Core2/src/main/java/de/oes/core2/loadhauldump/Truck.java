package de.oes.core2.loadhauldump;

import de.oes.core2.activities.rESOURCE;
import de.oes.core2.activities.rESOURCEpOOL;
import de.oes.core2.activities.rESOURCEsTATUS;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Truck extends rESOURCE{
	public Truck(Integer id, String name, Simulator sim, rESOURCEsTATUS status) {
		super(id, name, sim, null, status);
	}

	public static Integer capacity = 15;
	
}
