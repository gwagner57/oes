package de.oes.core2.foundations;

import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class rESOURCE extends oBJECT{

	public rESOURCE(Integer id, String name, Simulator sim, rESOURCEpOOL resourcePool, rESOURCEsTATUS status) {
		super(id, name, sim);
		this.resourcePool = resourcePool;
		this.status = status;
	}
	private rESOURCEsTATUS status;
	private aCTIVITYsTATE activityState;
	private rESOURCEpOOL resourcePool;
}
