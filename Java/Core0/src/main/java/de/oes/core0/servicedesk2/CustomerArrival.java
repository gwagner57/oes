package de.oes.core0.servicedesk2;

import java.util.ArrayList;
import java.util.List;

import de.oes.core0.foundations.ExogenousEvent;
import de.oes.core0.foundations.eVENT;
import de.oes.core0.lib.MathLib;
import de.oes.core0.servicedesk1.Customer;
import de.oes.core0.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerArrival extends ExogenousEvent {
	private ServiceDesk serviceDesk;
	private Customer customer;
	
	public CustomerArrival(Simulator sim, Long occTime, Long delay, ServiceDesk serviceDesk) {
		super(sim, occTime, delay);
		this.serviceDesk = serviceDesk;
		this.customer = null; // is assigned on occurrence
	}

	@Override
	public List<eVENT> onEvent() {
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		Simulator sim = this.getSim();
		this.customer = new Customer(null, sim, this.getOccTime().longValue());
		// push new customer to the queue
		this.getServiceDesk().pushCustomer(this.customer);
		// update statistics
		sim.incrementStat("arrivedCustomers", 1);
		
		int queueLength = this.getServiceDesk().getWaitingCustomers().size();
		if(queueLength > sim.getStat().get("maxQueueLength").intValue()) {
			sim.updateStatValue("maxQueueLength", queueLength);
		}
		// if the service desk is not busy, start service and schedule departure
		if(queueLength == 1) {
			followupEvents.add(new CustomerDeparture(sim, null, 
					ServiceDesk.serviceDuration(), //FIXME 
					serviceDesk)); 
		}
		return followupEvents;
	}

	@Override
	public Long reccurence() {
		return (long) MathLib.getUniformRandomInteger(1, 6);
	}

	@Override
	public eVENT createNextEvent() {
		return new CustomerArrival(this.getSim(), null, this.reccurence(), this.serviceDesk);
	}

}
