package de.oes.core0.foundations;

import de.oes.core0.sim.Simulator;
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
	}
	
	public oBJECT(String name, Simulator sim) {
		super();
		this.name = name;
		this.sim = sim;
		this.id = sim.getScenario().getIdCounter() + 1;
	}
}
