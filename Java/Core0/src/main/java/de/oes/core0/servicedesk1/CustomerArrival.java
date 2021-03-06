package de.oes.core0.servicedesk1;

import java.util.ArrayList;
import java.util.List;

import de.oes.core0.foundations.ExogenousEvent;
import de.oes.core0.foundations.eVENT;
import de.oes.core0.lib.MathLib;
import de.oes.core0.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerArrival extends ExogenousEvent {
	
	private ServiceDesk serviceDesk;
	
	public CustomerArrival(Simulator sim, Long occTime, Long delay, ServiceDesk serviceDesk) {
		super(sim, occTime, delay);
		this.serviceDesk = serviceDesk;
	}

	@Override
	public List<eVENT> onEvent() {
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		Simulator sim = this.getSim();
		 // increment queue length due to newly arrived customer
		sim.getModel().incrementStat("queueLength", 1);
		Number queueLength = sim.getModel().getV().get("queueLength");
		// update statistics
		sim.incrementStat("arrivedCustomers", 1);
		if(queueLength.intValue() > sim.getStat().get("maxQueueLength").intValue()) {
			sim.updateStatValue("maxQueueLength", queueLength);
		}
		// if the service desk is not busy, start service and schedule departure
		if(queueLength.intValue() == 1) {
			followupEvents.add(new CustomerDeparture(sim, null, sim.getModel().getF().get("serviceTime").get().longValue(), this.serviceDesk));
		}
		return followupEvents;
	}
	@Override
	public CustomerArrival createNextEvent() {
		return new CustomerArrival(this.getSim(), null, this.reccurence(), this.serviceDesk);
	}

	@Override
	public Long reccurence() {
		return (long) MathLib.getUniformRandomInteger(1, 6);
	}

}
