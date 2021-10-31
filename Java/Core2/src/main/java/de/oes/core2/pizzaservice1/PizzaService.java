package de.oes.core2.pizzaservice1;

import de.oes.core2.foundations.oBJECT;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PizzaService extends oBJECT{

	private Integer queueLength;
	private boolean busy;
	
	public PizzaService(Integer id, String name, Simulator sim,
			Integer queueLength, boolean busy) {
		super(id, name, sim);
		this.queueLength = queueLength;
		this.busy = busy;
	}

}
