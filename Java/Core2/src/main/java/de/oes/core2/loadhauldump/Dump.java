package de.oes.core2.loadhauldump;

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

public class Dump extends aCTIVITY {

	private static final List<String> PERFORMER = List.of("truck");
	public Dump(Simulator sim, Number id, Number startTime, Number duration) {
		super(sim, id, null, startTime, duration, null);
		this.durationFunc = Dump::duration;
		rESOURCErOLE rr = new rESOURCErOLE();
		rANGE range = new rANGE();
		range.setName("Truck");
		rr.setRange(range);
		Dump.resRoles.put("trucks", rr);
	}
	
	public Dump(Simulator sim) {
		super(sim, null, null, null, null, null);
		this.durationFunc = Dump::duration;
	}

	private static tASKqUEUE tasks;
	public Map<String, List<rESOURCE>> resources = new HashMap <String, List<rESOURCE>>();
	public static Map<String, rESOURCErOLE> resRoles = new HashMap<String, rESOURCErOLE>();
	
	
	public static Number duration() {
		return Rand.triangular(40, 60, 55);
	}

	@Override
	public tASKqUEUE getTasks() {
		return Dump.tasks;
	}

	@Override
	public void setTasks(tASKqUEUE t) {
		Dump.tasks = t;
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
		return Dump.resRoles;
	}

	@Override
	public void setResourceRoles(Map<String, rESOURCErOLE> resRoles) {
		Dump.resRoles = resRoles;
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
		return this.getSim().getModel().getV().get("nmrOfLoads").intValue() > 0? 
				"GoBackToLoadingSite":"GoHome";
	}

	@Override
	public List<eVENT> onEvent() {
		return null;
	}

	@Override
	public aCTIVITY newInstance() {
		return new Dump(this.getSim());
	}

}
