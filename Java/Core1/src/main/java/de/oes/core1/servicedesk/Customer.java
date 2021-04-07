package de.oes.core1.servicedesk;

import de.oes.core1.foundations.oBJECT;
import de.oes.core1.sim.Simulator;
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
