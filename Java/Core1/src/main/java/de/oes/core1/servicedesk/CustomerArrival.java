package de.oes.core1.servicedesk;

import java.util.ArrayList;
import java.util.List;

import de.oes.core1.foundations.ExogenousEvent;
import de.oes.core1.foundations.eVENT;
import de.oes.core1.lib.MathLib;
import de.oes.core1.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerArrival extends ExogenousEvent {
	private ServiceDesk serviceDesk;
	private Customer customer;
	
	public CustomerArrival(Simulator sim, Number occTime, Number delay, ServiceDesk serviceDesk) {
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
		this.serviceDesk.pushCustomer(this.customer);
		// update statistics
		sim.incrementStat("arrivedCustomers", 1);
		
		int queueLength = this.getServiceDesk().getWaitingCustomers().size();
		if(queueLength > sim.getStat().get("maxQueueLength").intValue()) {
			sim.updateStatValue("maxQueueLength", queueLength);
		}
		// if the service desk is not busy, start service and schedule departure
		if(queueLength == 1) {
			followupEvents.add(new CustomerDeparture(sim, null, 
					ServiceDesk.serviceDuration(),
					serviceDesk)); 
		}
		return followupEvents;
	}

	@Override
	public Double reccurence() {
		return MathLib.round(MathLib.getUniformRandomNumber(1.0, 6.0));
	}

	@Override
	public eVENT createNextEvent() {
		return new CustomerArrival(this.getSim(), null, this.reccurence(), this.serviceDesk);
	}

}
