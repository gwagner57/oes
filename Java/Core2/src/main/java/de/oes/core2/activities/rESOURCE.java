package de.oes.core2.activities;

import de.oes.core2.foundations.oBJECT;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class rESOURCE extends oBJECT{

	private rESOURCEsTATUS status;
	private aCTIVITYsTATE activityState;
	private rESOURCEpOOL resourcePool;
	
	public rESOURCE(Integer id, String name, Simulator sim, rESOURCEpOOL resourcePool, rESOURCEsTATUS status) {
		super(id, name, sim);
		this.resourcePool = resourcePool;
		this.status = status;
	}

	@Override
	public String toString() {
		return this.getClass().getSimpleName() + "-" + this.getId() + "{ st:" + this.getStatus() +", act:" + this.getActivityState() +"}";
	}
	
}
