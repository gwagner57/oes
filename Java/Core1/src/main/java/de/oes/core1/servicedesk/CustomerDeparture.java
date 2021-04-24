package de.oes.core1.servicedesk;

import java.util.ArrayList;

import java.util.List;

import de.oes.core1.foundations.eVENT;
import de.oes.core1.lib.MathLib;
import de.oes.core1.sim.Simulator;

public class CustomerDeparture extends eVENT{

	private ServiceDesk serviceDesk;
	
	public CustomerDeparture(Simulator sim, Long occTime, Double delay, ServiceDesk serviceDesk) {
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
		sim.incrementStat("cumulativeTimeInSystem", 
				MathLib.round(this.getOccTime().doubleValue() - departingCustomer.getArrivalTime().doubleValue()));
		// remove customer from map of simulation objects
		sim.getObjects().remove(departingCustomer.getId());
		// update statistics
		sim.incrementStat("departedCustomers", 1);
		// decrement queue length due to departure
		Number queueLength = this.serviceDesk.getWaitingCustomers().size();
		if(queueLength.intValue() > 0) {
			followupEvents.add(new CustomerDeparture(sim, null, 
					(ServiceDesk.serviceDuration()),
					this.serviceDesk));
		}
		return followupEvents;
	}

}
