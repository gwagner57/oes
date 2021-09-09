package de.oes.core1.inventorymanagment;


import de.oes.core1.foundations.oBJECT;
import de.oes.core1.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SingleProductShop extends oBJECT{

	private Integer quantityInStock;
	private Integer reorderPoint; // for continuous review policy
	private Integer targetInventory;
	private Integer reorderInterval; // for periodic review policy
	
	public SingleProductShop(Integer id, String name, Simulator sim, int quantityInStock, int reorderPoint, int targetInventory,  int reorderInterval) {
		super(id, name, sim);
		this.quantityInStock = quantityInStock;
		this.reorderPoint = reorderPoint;
		this.targetInventory = targetInventory;
		this.reorderInterval = reorderInterval;
	}

	@Override
	public String toString() {
		return this.getClass().getSimpleName() + "{stock : " + this.getQuantityInStock() + "}";
	}
}
