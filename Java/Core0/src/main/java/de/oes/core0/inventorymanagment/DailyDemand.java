package de.oes.core0.inventorymanagment;

import java.util.ArrayList;
import java.util.List;

import de.oes.core0.foundations.ExogenousEvent;
import de.oes.core0.foundations.eVENT;
import de.oes.core0.lib.MathLib;
import de.oes.core0.sim.Simulator;

public class DailyDemand extends ExogenousEvent {
	private Integer quantity;
	private SingleProductShop shop;
	
	public DailyDemand(Simulator sim, Long occTime, Integer quantity, SingleProductShop shop) {
		super(sim, occTime, null);
		this.shop = shop;
		this.quantity = quantity;
	}

	@Override
	public List<eVENT> onEvent() {
		Integer q = this.quantity;
		Integer prevStockLevel = this.shop.getQuantityInStock();
		if(q > prevStockLevel) {
			this.getSim().incrementStat("nmrOfStockOuts", 1);
			this.getSim().incrementStat("lostSales", q - prevStockLevel);
		}
		this.shop.setQuantityInStock(Math.max(prevStockLevel - q, 0));
		if(prevStockLevel > this.shop.getReorderLevel() &&
			prevStockLevel - q <= this.shop.getReorderLevel()) {
			return List.of(
					new Delivery(this.getSim(), 
							null, // no occ. time
							Delivery.leadTime().longValue(), 
							this.shop.getTargetInventory() - this.shop.getQuantityInStock(), 
							this.shop)
					); 
		}
		return new ArrayList<eVENT>();
	}

	
	public static Integer quantity() {
		return MathLib.getUniformRandomInteger(5, 30);
	}
	
	public Long reccurence() {
		return 1l;
	}
	
	public DailyDemand createNextEvent() {
		return new DailyDemand(
				this.getSim(), 
				this.getOccTime().longValue() +  this.reccurence(), 
				DailyDemand.quantity(), 
				this.shop);
	}
	
	@Override
	public String toString() {
		return this.getClass().getSimpleName() + "{quant : " + this.quantity + "} @" + this.getOccTime();
	}
}
