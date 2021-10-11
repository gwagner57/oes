package de.oes.core2.makeanddeliver;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
	
	private static tASKqUEUE tasks;
	private static final List<String> PERFORMER = List.of("pizzaMaker");
	public Map<String, List<rESOURCE>> resources = new HashMap <String, List<rESOURCE>>();
	public static Map<String, rESOURCErOLE> resRoles = new HashMap<String, rESOURCErOLE>();
	
	public MakePizza(Simulator sim, Number id, Number startTime, Number duration) {
		super(sim, id, null, startTime, duration, null);
		this.durationFunc = () -> Rand.triangular(3, 6, 4);
		
		//pizzaMakers
		rESOURCErOLE rr = new rESOURCErOLE();
		rr.setCard(2);
		rANGE range = new rANGE();
		range.setName("PizzaMaker");
		rr.setRange(range);
		MakePizza.resRoles.put("pizzaMakers", rr);
		//oven
		rESOURCErOLE rr2 = new rESOURCErOLE();
		rr2.setCard(1);
		MakePizza.resRoles.put("oven", rr2);
		this.resources.put("pizzaMakers", new ArrayList<rESOURCE>());
	}
	
	public static Number duration() {
		return Rand.triangular(3, 6, 4);
	}

	@Override
	public List<eVENT> onEvent() {
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
		return this.resources;
	}

	@Override
	public void setResources(Map<String, List<rESOURCE>> res) {
		this.resources = res;
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
		return this.resources.get(resRoleName);
	}

	@Override
	public void put(List<rESOURCE> rESOURCEs, String resRoleName) {
		this.resources.put(resRoleName, rESOURCEs);
	}

	@Override
	public void delete(String resRoleName) {
		this.resources.remove(resRoleName);
	}

	@Override
	public String getSuccessorActivity() {
		return "DeliverPizza";
	}

	@Override
	public aCTIVITY newInstance() {
		return new MakePizza(this.getSim());
	}

	public MakePizza(Simulator sim) {
		super(sim, null, null, null, null, null);
		this.durationFunc = MakePizza::duration;
	}
}
