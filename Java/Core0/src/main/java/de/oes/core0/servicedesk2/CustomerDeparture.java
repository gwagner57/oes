package de.oes.core0.servicedesk2;

import java.util.ArrayList;

import java.util.List;

import de.oes.core0.foundations.eVENT;
import de.oes.core0.servicedesk1.Customer;
import de.oes.core0.sim.Simulator;

public class CustomerDeparture extends eVENT{

	private ServiceDesk serviceDesk;
	
	public CustomerDeparture(Simulator sim, Long occTime, Long delay, ServiceDesk serviceDesk) {
		super(sim, occTime, delay);
		this.serviceDesk = serviceDesk;
	}

	@Override
	public List<eVENT> onEvent() {
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		Simulator sim = this.getSim();
		// remove/pop customer from FIFO queue
		Customer departingCustomer = this.serviceDesk.getWaitingCustomers().remove();
		// add the time the customer has spent in the system
		sim.incrementStat("cumulativeTimeInSystem", this.getOccTime() - departingCustomer.getArrivalTime());
		// remove customer from map of simulation objects
		sim.getObjects().remove(departingCustomer.getId()); // TODO used for? 
		// update statistics
		sim.incrementStat("departedCustomers", 1);
		// decrement queue length due to departure
		Number queueLength = this.serviceDesk.getWaitingCustomers().size();
		if(queueLength.intValue() > 0) {
			followupEvents.add(new CustomerDeparture(sim, null, 
					((long) ServiceDesk.serviceDuration()), //FIXME
					this.serviceDesk));
		}
		return followupEvents;
	}

}