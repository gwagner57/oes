package de.oes.core0.inventorymanagment;

import de.oes.core0.foundations.oBJECT;
import de.oes.core0.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SingleProductShop extends oBJECT{

	private Integer quantityInStock;
	private Integer reorderLevel;
	private Integer targetInventory;
	
	public SingleProductShop(Integer id, String name, Simulator sim, int quantityInStock, int reorderLevel, int targetInventory) {
		super(id, name, sim);
		this.quantityInStock = quantityInStock;
		this.reorderLevel = reorderLevel;
		this.targetInventory = targetInventory;
	}

	@Override
	public String toString() {
		return this.getClass().getSimpleName() + "{stock : " + this.getQuantityInStock() + "}";
	}
}
