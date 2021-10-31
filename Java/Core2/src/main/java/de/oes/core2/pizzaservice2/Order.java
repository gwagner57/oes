package de.oes.core2.pizzaservice2;

import java.util.ArrayList;

import java.util.List;
import java.util.function.Consumer;

import de.oes.core2.activities.aCTIVITYsTART;
import de.oes.core2.foundations.ExogenousEvent;
import de.oes.core2.foundations.eVENT;
import de.oes.core2.lib.Rand;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Order extends ExogenousEvent {

	private PizzaService pizzaService;
	
	public Order(Simulator sim, Number occTime, Number delay, PizzaService pizzaService) {
		super(sim, occTime, delay, null, null);
		this.pizzaService = pizzaService;
	}

	@Override
	public List<eVENT> onEvent() {
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		Simulator sim = this.getSim();
		sim.incrementStat("nmrOfOrders", 1);
		return followupEvents;
	}

	@Override
	public Number reccurence() {
		return Rand.exponential(0.5);
	}

	@Override
	public eVENT createNextEvent() {
		return new Order(this.getSim(), null, this.reccurence(), pizzaService);
	}

	@Override
	public String getSuccessorActivity() {
		return "MakePizza";
	}
}
