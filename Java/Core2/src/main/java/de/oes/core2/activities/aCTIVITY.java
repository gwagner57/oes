package de.oes.core2.activities;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Consumer;

import de.oes.core2.foundations.eVENT;
import de.oes.core2.lib.Rand;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class aCTIVITY extends eVENT{
	// startTime=0 indicates to the eVENT constructor that this is an aCTIVITY
	private long id;
	private String name;
	private Number enqueueTime;
	private Map<String, List<rESOURCE>> resources;
	private Map<String, rESOURCErOLE> resourceRoles;
	private Number waitingTimeout;
	private tASKqUEUE tasks;
	public List<eVENT> onActivityStart;
	private Consumer<String> successorActivity;
	
	// define the exponential PDF as the default duration random variable
	public static final double defaultMean = 1.0;
	public static double defaultDuration() {
		return Rand.exponential(1.0 / aCTIVITY.defaultMean).doubleValue();
	}
	
	public aCTIVITY(Simulator sim, Number id, Number occTime, Number startTime, Number duration, Number enqueueTime) {
		super(sim, occTime, null, startTime, duration);
		if(Objects.nonNull(id)) this.id = id.longValue();
		else this.id = sim.getIdCounter().longValue() + 1;
		if(Objects.nonNull(enqueueTime)) this.enqueueTime = enqueueTime;
	}
	
	public List<rESOURCE> get(String resRoleName) {
		return this.resources.get(resRoleName);
	}
	
	public void put(List<rESOURCE> rESOURCEs, String resRoleName) {
		this.resources.put(resRoleName, rESOURCEs);
	}
	
	public void delete(String resRoleName) {
		this.resources.remove(resRoleName);
	}
}
