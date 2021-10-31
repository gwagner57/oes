package de.oes.core2.pizzaservice1;

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
		// increment queue length
		this.pizzaService.setQueueLength(this.pizzaService.getQueueLength() + 1);
		// update statistics
		
		sim.incrementStat("nmrOfOrders", 1);
		if(this.pizzaService.getQueueLength() > sim.getStat().getSimpleStat().get("maxQueueLength").intValue()) {
			sim.updateStatValue("maxQueueLength", this.pizzaService.getQueueLength());
		}
		// if the service desk is not busy
		if(!this.pizzaService.isBusy()) {
			MakePizza makePizzaActy = new MakePizza(this.getSim(), null, null, MakePizza.duration(), this.pizzaService);
			followupEvents.add(new aCTIVITYsTART(this.getSim(), null, null, makePizzaActy));
		}
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
		// TODO Auto-generated method stub
		return null;
	}

}
