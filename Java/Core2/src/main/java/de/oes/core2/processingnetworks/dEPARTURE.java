package de.oes.core2.processingnetworks;

import java.util.ArrayList;
import java.util.List;

import de.oes.core2.foundations.eVENT;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public abstract class dEPARTURE extends eVENT {

	private ExitNode exitNode;
	
	public dEPARTURE(Simulator sim) {
		super(sim);
	}

	@Override
	public List<eVENT> onEvent() {
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		 // pop processing object from the input queue
		pROCESSINGoBJECT procOBj = this.exitNode.getInputBuffer().remove(0);
		// update statistics
		this.exitNode.setNmrOfDepartedObjects(this.exitNode.getNmrOfDepartedObjects() + 1);
		this.exitNode.setCumulativeTimeInSystem(this.exitNode.getCumulativeTimeInSystem() + this.getOccTime().doubleValue() - procOBj.getArrivalTime().doubleValue());
		// invoke onDeparture event rule method
		followupEvents = this.exitNode.getOnDeparture().get();
		this.getSim().getObjects().remove(procOBj.getId());
		return followupEvents;
	}

}
