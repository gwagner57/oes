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
import lombok.Setter;
import lombok.Getter;

@Getter
@Setter
public class GoToLoadingSite extends aCTIVITY {

	public GoToLoadingSite(Simulator sim, Number id,  Number startTime, Number duration) {
		super(sim, id, null, startTime, duration, null);
		this.durationFunc = GoToLoadingSite::duration;
		rESOURCErOLE rr = new rESOURCErOLE();
		rANGE range = new rANGE();
		range.setName("Truck");
		rr.setRange(range);
		GoToLoadingSite.resRoles.put("trucks", rr);
		this.resources.put("trucks", new ArrayList<rESOURCE>());
	}
	
	public GoToLoadingSite(Simulator sim) {
		super(sim, null, null, null, null, null);
		this.durationFunc = GoToLoadingSite::duration;
	}

	private static tASKqUEUE tasks;
	private static final List<String> PERFORMER = List.of("truck");
	public Map<String, List<rESOURCE>> resources = new HashMap <String, List<rESOURCE>>();
	public static Map<String, rESOURCErOLE> resRoles = new HashMap<String, rESOURCErOLE>();
	
	
	@Override
	public tASKqUEUE getTasks() {
		return GoToLoadingSite.tasks;
	}

	@Override
	public void setTasks(tASKqUEUE t) {
		GoToLoadingSite.tasks = t;
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
		return GoToLoadingSite.resRoles;
	}

	@Override
	public void setResourceRoles(Map<String, rESOURCErOLE> resRoles) {
		GoToLoadingSite.resRoles = resRoles;
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
		return "Load";
	}

	@Override
	public List<eVENT> onEvent() {
		return null;
	}
	
	public static Number duration() {
		return Rand.triangular(30, 50, 40);
	}

	@Override
	public aCTIVITY newInstance() {
		return new GoToLoadingSite(this.getSim());
	}

}
