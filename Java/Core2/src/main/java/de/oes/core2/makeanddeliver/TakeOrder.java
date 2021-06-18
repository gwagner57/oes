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

public class TakeOrder extends aCTIVITY {
	
	private static tASKqUEUE tasks;
	private static final List<String> PERFORMER = List.of("orderTaker");
	public static Map<String, List<rESOURCE>> resources = new HashMap <String, List<rESOURCE>>();
	public static Map<String, rESOURCErOLE> resRoles = new HashMap<String, rESOURCErOLE>();
	
	
	public TakeOrder(Simulator sim, Number id, Number startTime, Number duration) {
		super(sim, id, null, startTime, duration, null);
		this.onWaitingTimeout = this::onWaitingTimeout;
		this.durationFunc = TakeOrder::duration;
		this.waitingTimeoutFunc = TakeOrder::waitingTimeout;
		//orderTaker
		rESOURCErOLE rr = new rESOURCErOLE();
		rANGE range = new rANGE();
		range.setName("OrderTaker");
		rr.setRange(range);
		TakeOrder.resRoles.put("orderTaker", rr);
	}

	@Override
	public tASKqUEUE getTasks() {
		return TakeOrder.tasks;
	}

	@Override
	public void setTasks(tASKqUEUE t) {
		TakeOrder.tasks = t;
	}

	@Override
	public Map<String, List<rESOURCE>> getResources() {
		return TakeOrder.resources;
	}

	@Override
	public void setResources(Map<String, List<rESOURCE>> res) {
		TakeOrder.resources = res;
	}

	@Override
	public Map<String, rESOURCErOLE> getResourceRoles() {
		return TakeOrder.resRoles;
	}

	@Override
	public void setResourceRoles(Map<String, rESOURCErOLE> resRoles) {
		TakeOrder.resRoles = resRoles;
	}

	@Override
	public List<rESOURCE> get(String resRoleName) {
		return TakeOrder.resources.get(resRoleName);
	}

	@Override
	public void put(List<rESOURCE> rESOURCEs, String resRoleName) {
		TakeOrder.resources.put(resRoleName, rESOURCEs);
	}

	@Override
	public void delete(String resRoleName) {
		TakeOrder.resources.remove(resRoleName);
	}

	@Override
	public String getSuccessorActivity() {
		return "MakePizza";
	}

	@Override
	public List<eVENT> onEvent() {
		// TODO Auto-generated method stub
		return null;
	}
	
	private List<eVENT> onWaitingTimeout() {
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		 // schedule a LostOrder event
		followupEvents.add(new LostOrder()); //TODO: must do something?
		return followupEvents;
	}
	
	public static Number duration() {
		return Rand.uniform(1, 3);
	}
	public static Number waitingTimeout() {
		return Rand.uniformInt(3, 6);
	}
	
}
