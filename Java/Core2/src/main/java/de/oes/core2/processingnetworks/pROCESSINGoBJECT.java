package de.oes.core2.processingnetworks;

import de.oes.core2.foundations.oBJECT;
import de.oes.core2.sim.Simulator;
import lombok.Setter;
import lombok.Getter;


/**
 * Processing Objects are generic objects that arrive at an entry node of a PN
 * and are processed at one or more processing nodes before they leave the
 * PN at an exit node.
 */
@Getter
@Setter
public class pROCESSINGoBJECT extends oBJECT {
	private Number arrivalTime;
	
	public pROCESSINGoBJECT(Integer id, String name, Simulator sim, Number arrivalTime) {
		super(id, name, sim);
		this.arrivalTime = arrivalTime;
	}
	
	public pROCESSINGoBJECT(String name, Simulator sim, Number arrivalTime) {
		super(name, sim);
		this.arrivalTime = arrivalTime;
	}
}
