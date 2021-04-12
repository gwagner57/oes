package de.oes.core1.servicedesk;

import java.util.LinkedList;

import java.util.Queue;
import java.util.stream.Collectors;

import org.apache.tomcat.util.buf.StringUtils;

import de.oes.core1.foundations.oBJECT;
import de.oes.core1.lib.MathLib;
import de.oes.core1.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ServiceDesk extends oBJECT{

	private Queue <Customer> waitingCustomers = new LinkedList<Customer>();
	private Long queueLenght;
	public ServiceDesk(Integer id, String name, Simulator sim, Long queueLenght) {
		super(id, name, sim);
		this.queueLenght = queueLenght;
	}

	public static double serviceDuration() {
		return MathLib.getUniformRandomNumber(0.5, 5);
	}
	
	public void pushCustomer(Customer c) {
		this.waitingCustomers.add(c);
	}
	
	@Override
	public String toString() {
		return "ServiceDesk-" + this.getId() + "{ queue: [" + 
				StringUtils.join( // represent list of customers as comma separated list (string)
						waitingCustomers. // list of all waiting customers
						stream().
						map(Customer::getId). //get only ID for representation
						map(Object::toString). // Integer -> String
						collect(Collectors.toList()), ',') // comma separated list
				+ "]}";
	}
}
