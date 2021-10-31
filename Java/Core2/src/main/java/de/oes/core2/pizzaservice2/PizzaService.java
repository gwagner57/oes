package de.oes.core2.pizzaservice2;

import de.oes.core2.activities.rESOURCE;
import de.oes.core2.activities.rESOURCEsTATUS;

import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PizzaService extends rESOURCE {

	public PizzaService(Integer id, String name, Simulator sim,  rESOURCEsTATUS status) {
		super(id, name, sim, null,  status);
	}

}
