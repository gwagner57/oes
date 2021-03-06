package de.oes.core0.inventorymanagment;

import java.util.ArrayList;
import java.util.List;

import de.oes.core0.foundations.eVENT;
import de.oes.core0.lib.MathLib;
import de.oes.core0.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Delivery extends eVENT {
	private Integer quantity;
	private SingleProductShop receiver;
	public Delivery(Simulator sim, Long occTime, Long delay, Integer quantity, SingleProductShop receiver) {
		super(sim, occTime, delay);
		this.quantity = quantity;
		this.receiver = receiver;
	}
	@Override
	public List<eVENT> onEvent() {
		this.receiver.setQuantityInStock(this.receiver.getQuantityInStock() + this.quantity);
	    // schedule another Delivery if stock level is not raised above reorder level
		if(this.receiver.getQuantityInStock() <= this.receiver.getReorderLevel()) {
			return List.of(
					new Delivery(this.getSim(), 
							null, // no occ. time
							Delivery.leadTime().longValue(), 
							this.receiver.getTargetInventory() - this.receiver.getQuantityInStock(), 
							this.receiver)
					); 
		}
		return new ArrayList<eVENT>(); // no follow-up events
	}
	public static Integer leadTime() {
		int r = MathLib.getUniformRandomInteger(0,99);
		if (r < 25) return 1; // probability 0.25
		else if (r < 85) return 2; // probability 0.60
		else return 3; // probability 0.15
	}
	
	@Override
	public String toString() {
		return this.getClass().getSimpleName() + "{quant : " + this.quantity + "} @" + this.getOccTime();
	}
}
