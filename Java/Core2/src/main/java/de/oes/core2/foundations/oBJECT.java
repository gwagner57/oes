package de.oes.core2.foundations;

import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class oBJECT {
	private Integer id;
	private String name;
	private Simulator sim;
	
	public oBJECT(Integer id, String name, Simulator sim) {
		super();
		this.id = id;
		this.name = name;
		this.sim = sim;
		this.sim.getObjects().put(this.id, this);
	}
	
	public oBJECT(String name, Simulator sim) {
		super();
		this.name = name;
		this.sim = sim;
		this.id = sim.getScenario().incrementIdCounter();
		this.sim.getObjects().put(this.id, this); // TODO: different types
	}
}
