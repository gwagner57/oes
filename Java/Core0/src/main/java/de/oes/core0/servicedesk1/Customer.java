package de.oes.core0.servicedesk1;

import de.oes.core0.foundations.oBJECT;
import de.oes.core0.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Customer extends oBJECT{
	private Number arrivalTime;
	
	public Customer(String name, Simulator sim, Long arrivalTime) {
		super(name, sim);
		this.arrivalTime = arrivalTime;
	}

}
