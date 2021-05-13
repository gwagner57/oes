package de.oes.core1.inventorymanagment;

import java.util.ArrayList;
import java.util.List;

import de.oes.core1.foundations.ExogenousEvent;
import de.oes.core1.foundations.eVENT;
import de.oes.core1.lib.MathLib;
import de.oes.core1.sim.Simulator;


public class DailyDemand extends ExogenousEvent {
	private Integer quantity;
	private SingleProductShop shop;
	
	public DailyDemand(Simulator sim, Number occTime, Number delay, Integer quantity, SingleProductShop shop) {
		super(sim, occTime, delay);
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
		if((this.getSim().getModel().getP().get("reviewPolicy")).equals("continuous")) {
			if(prevStockLevel > this.shop.getReorderPoint() &&
					prevStockLevel -q <= this.shop.getReorderPoint()) {
				return List.of(
						new Delivery(
								this.getSim(), 
								null, // no occ. time
								Delivery.leadTime().longValue(), 
								this.shop.getTargetInventory() - this.shop.getQuantityInStock(), 
								this.shop)
						); 
			} else return new ArrayList<eVENT>();
		} else { // periodic
			 // periodically schedule new Delivery events
			if((this.getSim().getTime() % this.shop.getReorderInterval()) == 0) {
				return List.of(
						new Delivery(
								this.getSim(), 
								null, // no occ. time
								Delivery.leadTime().longValue(), 
								this.shop.getTargetInventory() - this.shop.getQuantityInStock(), 
								this.shop)
						); 
			} else return new ArrayList<eVENT>();
		}
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
				null, // occ. time
				this.reccurence(), // delay
				DailyDemand.quantity(), 
				this.shop);
	}
	
	@Override
	public String toString() {
		return this.getClass().getSimpleName() + "{quant : " + this.quantity + "} @" + this.getOccTime();
	}
}
