package de.oes.core2.loadhauldump;

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

public class Load extends aCTIVITY {

	public Load(Simulator sim, Number id, Number startTime, Number duration) {
		super(sim, id, null, startTime, duration, null);
		this.durationFunc = this::duration;
		this.onActivityEnd = this::onActivityEnd;
		
		rESOURCErOLE rr = new rESOURCErOLE();
		rANGE range = new rANGE();
		range.setName("Truck");
		rr.setRange(range);
		Load.resRoles.put("trucks", rr);
		
		rESOURCErOLE rr2 = new rESOURCErOLE();
		rANGE range2 = new rANGE();
		rr2.setMinCard(1);
		rr2.setMaxCard(2);
		range2.setName("WheelLoader");
		rr2.setRange(range);
		Load.resRoles.put("wheelLoaders", rr2);
		this.resources.put("wheelLoaders", new ArrayList<rESOURCE>());
	}
	
	public Load(Simulator sim) {
		super(sim, null, null, null, null, null);
		this.durationFunc = this::duration;
		this.onActivityEnd = this::onActivityEnd;
		this.resources.put("wheelLoaders", new ArrayList<rESOURCE>());
	}

	private static tASKqUEUE tasks;
	private static final List<String> PERFORMER = List.of("truck");
	public Map<String, List<rESOURCE>> resources = new HashMap <String, List<rESOURCE>>();
	public static Map<String, rESOURCErOLE> resRoles = new HashMap<String, rESOURCErOLE>();
	
	
	@Override
	public tASKqUEUE getTasks() {
		return Load.tasks;
	}

	@Override
	public void setTasks(tASKqUEUE t) {
		Load.tasks = t;
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
		return Load.resRoles;
	}

	@Override
	public void setResourceRoles(Map<String, rESOURCErOLE> resRoles) {
		Load.resRoles = resRoles;
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
		return "Haul";
	}

	@Override
	public List<eVENT> onEvent() {
		return null;
	}
	
	public Number duration() {
		Double dur = Rand.uniform(10, 20).doubleValue();
		// when the Load operation is performed by two wheel loaders, time is cut in half
		if(this.get("wheelLoaders") != null && this.get("wheelLoaders").size() == 2) dur = dur / 2.0;
		return dur;
	}
	
	private List<eVENT> onActivityEnd() {
		Number v = this.getSim().getModel().getV().get("nmrOfLoads");
		this.getSim().getModel().getV().put("nmrOfLoads", v.intValue() - 1);
		return new ArrayList<eVENT>();
	}

	@Override
	public aCTIVITY newInstance() {
		return new Load(this.getSim());
	}

}
