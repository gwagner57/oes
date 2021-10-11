package de.oes.core2.pizzaservice1;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

import de.oes.core2.activities.aCTIVITY;
import de.oes.core2.activities.aCTIVITYsTART;
import de.oes.core2.activities.rESOURCE;
import de.oes.core2.activities.rESOURCErOLE;
import de.oes.core2.activities.tASKqUEUE;
import de.oes.core2.foundations.eVENT;
import de.oes.core2.lib.Rand;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MakePizza extends aCTIVITY {
	
	private PizzaService pizzaService;
	private static tASKqUEUE tasks;
	private static Map<String, List<rESOURCE>> resources = new HashMap <String, List<rESOURCE>>();
	private static Map<String, rESOURCErOLE> resRoles = new HashMap<String, rESOURCErOLE>();
	
	public MakePizza(Simulator sim, Number id, Number startTime, Number duration, PizzaService pizzaService) {
		super(sim, id, null, startTime, duration, null);
		this.pizzaService = pizzaService;
		this.onActivityStart = this::onActivityStart;
		this.onActivityEnd= this::onActivityEnd;
		this.durationFunc = MakePizza::duration;
	}
	
	private List<eVENT> onActivityStart() {
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		this.pizzaService.setBusy(true);
		return followupEvents;
	}
	
	private List<eVENT> onActivityEnd() {
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

	@Override
	public tASKqUEUE getTasks() {
		return MakePizza.tasks;
	}

	@Override
	public void setTasks(tASKqUEUE t) {
		MakePizza.tasks = t;
	}

	@Override
	public Map<String, List<rESOURCE>> getResources() {
		return MakePizza.resources;
	}

	@Override
	public void setResources(Map<String, List<rESOURCE>> res) {
		MakePizza.resources = res;
	}

	@Override
	public Map<String, rESOURCErOLE> getResourceRoles() {
		return MakePizza.resRoles;
	}

	@Override
	public void setResourceRoles(Map<String, rESOURCErOLE> resRoles) {
		 MakePizza.resRoles = resRoles;
	}

	@Override
	public List<rESOURCE> get(String resRoleName) {
		return MakePizza.resources.get(resRoleName);
	}

	@Override
	public void put(List<rESOURCE> rESOURCEs, String resRoleName) {
		MakePizza.resources.put(resRoleName, rESOURCEs);
	}

	@Override
	public void delete(String resRoleName) {
		MakePizza.resources.remove(resRoleName);
	}

	@Override
	public String getSuccessorActivity() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public aCTIVITY newInstance() {
		// TODO Auto-generated method stub
		return null;
	}
}
