package de.oes.core2.pizzaservice1;

import java.util.ArrayList;
import java.util.List;

import de.oes.core2.activities.aCTIVITY;
import de.oes.core2.activities.aCTIVITYsTART;
import de.oes.core2.foundations.eVENT;
import de.oes.core2.lib.Rand;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MakePizza extends aCTIVITY {
	
	private PizzaService pizzaService;
	
	public MakePizza(Simulator sim, Number id, Number startTime, Number duration, PizzaService pizzaService) {
		super(sim, id, null, startTime, duration, null);
		this.pizzaService = pizzaService;
		this.onActivityStart = this::onActivityStart;
	}
	
	public List<eVENT> onActivityStart() {
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		this.pizzaService.setBusy(true);
		return followupEvents;
	}
	
	public List<eVENT> onActivityEnd() {
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		// decrement queue length
		this.pizzaService.setQueueLength(this.pizzaService.getQueueLength() - 1);
		// update statistics
		this.getSim().incrementStat("nmrOfDeliveredPizzas", 1);
		// if there are still waiting orders
		if(this.pizzaService.getQueueLength() > 0) {
			// start next MakePizza activity
			MakePizza makePizzaActy = new MakePizza(this.getSim(), null, null, MakePizza.duration(), this.pizzaService);
			followupEvents.add(new aCTIVITYsTART(this.getSim(), null, null, makePizzaActy));
		} else {
			this.pizzaService.setBusy(false);
		}
		return followupEvents;
	}
	
	public static Number duration() {
		return Rand.uniform(1, 3);
	}

	@Override
	public List<eVENT> onEvent() {
		// TODO Auto-generated method stub
		return null;
	}
}
