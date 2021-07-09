package de.oes.core2.medicaldepartament_2a;

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

public class WalkToRoom extends aCTIVITY {

	private static tASKqUEUE tasks;
	public Map<String, List<rESOURCE>> resources = new HashMap <String, List<rESOURCE>>();
	public static Map<String, rESOURCErOLE> resRoles = new HashMap<String, rESOURCErOLE>();
	
	public WalkToRoom(Simulator sim, Number id, Number startTime, Number duration) {
		super(sim, id, null, startTime, duration, null);
		this.durationFunc = this::duration;
		
		this.resources.put("nurse", new ArrayList<rESOURCE>());
		
		rESOURCErOLE rr = new rESOURCErOLE();
		rANGE range = new rANGE();
		range.setName("Nurse");
		rr.setRange(range);
		WalkToRoom.resRoles.put("nurse", rr);
		
		
		rESOURCErOLE rr2 = new rESOURCErOLE();
		rr2.setCard(1);
		rr2.setCountPoolName("rooms");
		WalkToRoom.resRoles.put("room", rr2);
		
	}

	public WalkToRoom(Simulator sim) {
		super(sim, null, null, null, null, null);
		this.durationFunc = this::duration;
	}

	private Number duration() {
		return Rand.uniform(0.5, 2.5);
	}
	
	@Override
	public tASKqUEUE getTasks() {
		return WalkToRoom.tasks;
	}

	@Override
	public void setTasks(tASKqUEUE t) {
		WalkToRoom.tasks = t;
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
		return WalkToRoom.resRoles;
	}

	@Override
	public void setResourceRoles(Map<String, rESOURCErOLE> resRoles) {
		WalkToRoom.resRoles = resRoles;
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
		return "Examination";
	}

	@Override
	public aCTIVITY newInstance() {
		return new WalkToRoom(this.getSim());
	}

	@Override
	public List<eVENT> onEvent() {
		return null;
	}

}
