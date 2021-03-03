package de.oes.core0.servicedesk1;

import java.util.ArrayList;
import java.util.List;

import de.oes.core0.foundations.eVENT;
import de.oes.core0.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerDeparture extends eVENT {
	private ServiceDesk serviceDesk;
	
	public CustomerDeparture(Simulator sim, Long occTime, Long delay, ServiceDesk serviceDesk) {
		super(sim, occTime, delay);
		this.serviceDesk = serviceDesk;
	}

	@Override
	public List<eVENT> onEvent() {
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		Simulator sim = this.getSim();
		// decrement queue length due to departure
		sim.getModel().incrementStat("queueLength", -1);
		Number queueLength = sim.getModel().getV().get("queueLength");
		// update statistics
		sim.incrementStat("departedCustomers", 1);
		if(queueLength.intValue() > 0) {
			followupEvents.add(new CustomerDeparture(sim, null, sim.getModel().getF().get("serviceTime").get().longValue(), this.serviceDesk));
		}
		return followupEvents;
	}

}
