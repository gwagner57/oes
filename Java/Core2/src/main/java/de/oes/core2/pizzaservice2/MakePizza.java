package de.oes.core2.pizzaservice2;


import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

import de.oes.core2.activities.aCTIVITY;
import de.oes.core2.activities.rANGE;
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
		this.durationFunc = MakePizza::duration;
		rESOURCErOLE rr = new rESOURCErOLE();
		rr.setCard(1);
		rANGE range = new rANGE();
		range.setName("PizzaService");
		rr.setRange(range);
		MakePizza.resRoles.put("pizzaService", rr);
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
}
