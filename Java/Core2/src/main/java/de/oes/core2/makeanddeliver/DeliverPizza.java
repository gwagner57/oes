package de.oes.core2.makeanddeliver;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import de.oes.core2.activities.aCTIVITY;
import de.oes.core2.activities.rESOURCE;
import de.oes.core2.activities.rESOURCErOLE;
import de.oes.core2.activities.tASKqUEUE;
import de.oes.core2.foundations.eVENT;
import de.oes.core2.lib.Rand;
import de.oes.core2.sim.Simulator;

public class DeliverPizza extends aCTIVITY{

	private static tASKqUEUE tasks;
	public static Map<String, List<rESOURCE>> resources = new HashMap <String, List<rESOURCE>>();
	public static Map<String, rESOURCErOLE> resRoles = new HashMap<String, rESOURCErOLE>();
	
	public DeliverPizza(Simulator sim, Number id, Number startTime, Number duration) {
		super(sim, id, null, startTime, duration, null);
		this.durationFunc = DeliverPizza::duration;
		this.onActivityEnd= this::onActivityEnd;
		//oven
		rESOURCErOLE rr2 = new rESOURCErOLE();
		rr2.setCard(1);
		DeliverPizza.resRoles.put("scooter", rr2);
	}

	public static double duration() {
		return Rand.triangular(10, 30, 15).doubleValue();
	}
	
	@Override
	public tASKqUEUE getTasks() {
		return DeliverPizza.tasks;
	}

	@Override
	public void setTasks(tASKqUEUE t) {
		DeliverPizza.tasks = t;
	}

	@Override
	public Map<String, List<rESOURCE>> getResources() {
		return DeliverPizza.resources;
	}

	@Override
	public void setResources(Map<String, List<rESOURCE>> res) {
		DeliverPizza.resources = res;
	}

	@Override
	public Map<String, rESOURCErOLE> getResourceRoles() {
		return DeliverPizza.resRoles;
	}

	@Override
	public void setResourceRoles(Map<String, rESOURCErOLE> resRoles) {
		DeliverPizza.resRoles = resRoles;
	}

	@Override
	public List<rESOURCE> get(String resRoleName) {
		return DeliverPizza.resources.get(resRoleName);
	}

	@Override
	public void put(List<rESOURCE> rESOURCEs, String resRoleName) {
		DeliverPizza.resources.put(resRoleName, rESOURCEs);
	}

	@Override
	public void delete(String resRoleName) {
		DeliverPizza.resources.remove(resRoleName);
	}

	@Override
	public String getSuccessorActivity() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<eVENT> onEvent() {
		// TODO Auto-generated method stub
		return null;
	}

	private List<eVENT> onActivityEnd() {
		this.getSim().incrementStat("deliveredPizzas", 1);
		return new ArrayList<eVENT>();
	}

}
