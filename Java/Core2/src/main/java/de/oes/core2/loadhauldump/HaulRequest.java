package de.oes.core2.loadhauldump;

import java.util.ArrayList;
import java.util.List;

import de.oes.core2.activities.aCTIVITYsTART;
import de.oes.core2.activities.rESOURCE;
import de.oes.core2.foundations.eVENT;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HaulRequest extends eVENT {
	private Integer quantity;
	
	public HaulRequest(Simulator sim, Number occTime, Number delay,  Integer quantity) {
		super(sim, occTime, delay, null, null);
		this.quantity = quantity;
	}

	@Override
	public List<eVENT> onEvent() {
		Simulator sim = this.getSim();
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		List<rESOURCE> allocatedTrucks = sim.getResourcepools().get("trucks").allocateAll();
		sim.getModel().getV().put("nmrOfLoads", Math.ceil(this.quantity / Truck.capacity));
		for (rESOURCE t : allocatedTrucks) {
			GoToLoadingSite goActy = new GoToLoadingSite(sim, null, null, null);
			// assign required resource
			goActy.getResources().get("trucks").add(t);
			followupEvents.add(new aCTIVITYsTART(sim, null, null, goActy));
		}
		
		return followupEvents;
	}

	@Override
	public String getSuccessorActivity() {
		return null;
	}

}
