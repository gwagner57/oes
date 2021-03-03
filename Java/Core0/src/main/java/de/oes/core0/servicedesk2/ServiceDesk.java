package de.oes.core0.servicedesk2;

import java.util.LinkedList;
import java.util.Queue;

import de.oes.core0.foundations.oBJECT;
import de.oes.core0.lib.MathLib;
import de.oes.core0.servicedesk1.Customer;
import de.oes.core0.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ServiceDesk extends oBJECT{

	private Queue <Customer> waitingCustomers = new LinkedList<Customer>();
	
	public ServiceDesk(Integer id, String name, Simulator sim) {
		super(id, name, sim);
	}

	public static double serviceDuration() {
		return MathLib.getUniformRandomNumber(0.5, 5);
	}
	
	public void pushCustomer(Customer c) {
		this.waitingCustomers.add(c);
	}
}
