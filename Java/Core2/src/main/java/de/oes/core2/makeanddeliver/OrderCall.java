package de.oes.core2.makeanddeliver;

import java.util.ArrayList;
import java.util.List;

import de.oes.core2.foundations.ExogenousEvent;
import de.oes.core2.foundations.eVENT;
import de.oes.core2.lib.Rand;
import de.oes.core2.sim.Simulator;

public class OrderCall extends ExogenousEvent {

	public OrderCall(Simulator sim, Number occTime, Number delay) {
		super(sim, occTime, delay);
	}
	
	// arrival rates per minute (for a daily operation for 5 hours)
	public static final List<Double> arrivalRates = List.of(1.0/6.0, 1.5, 1.0/1.5, 1.0/6.0, 1.0/12.0);
	
	@Override
	public String getSuccessorActivity() {
		return "TakeOrder";
	}

	@Override
	public Number reccurence() {
		int hour = (int) Math.floor(this.getSim().getTime() / 60.0);
		if(hour == 5) {
			//FIXME
			return Rand.exponential(OrderCall.arrivalRates.get(0));
		}
		return Rand.exponential(OrderCall.arrivalRates.get(hour));
	}

	@Override
	public eVENT createNextEvent() {
		return new OrderCall(this.getSim(), null, this.reccurence());
	}

	@Override
	public List<eVENT> onEvent() {
		return new ArrayList<eVENT>();
	}

}
