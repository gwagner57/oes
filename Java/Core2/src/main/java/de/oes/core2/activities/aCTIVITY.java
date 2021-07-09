package de.oes.core2.activities;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Supplier;

import de.oes.core2.foundations.eVENT;
import de.oes.core2.lib.Rand;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public abstract class aCTIVITY extends eVENT {
	// startTime=0 indicates to the eVENT constructor that this is an aCTIVITY
	private long id;
	private String name;
	private Number enqueueTime;
	protected Number waitingTimeout;
	protected Supplier<List<eVENT>> onActivityStart;
	protected Supplier<List<eVENT>> onActivityEnd;
	protected Supplier<List<eVENT>> onWaitingTimeout;
	protected Supplier<Number> durationFunc;
	protected Supplier<Number> waitingTimeoutFunc;
	
	
	// define the exponential PDF as the default duration random variable
	public static final double defaultMean = 1.0;
	public static double defaultDuration() {
		return Rand.exponential(1.0 / aCTIVITY.defaultMean).doubleValue();
	}
	
	public aCTIVITY(Simulator sim, Number id, Number occTime, Number startTime, Number duration, Number enqueueTime) {
		super(sim, occTime, null, startTime, duration);
		if(Objects.isNull(startTime)) startTime = 0;
		if(Objects.nonNull(id)) this.id = id.longValue();
		else this.id = sim.getIdCounter().longValue() + 1;
		if(Objects.nonNull(enqueueTime)) this.enqueueTime = enqueueTime;
	}
	
	
	
	public abstract tASKqUEUE getTasks();
	public abstract void setTasks(tASKqUEUE t);
	public abstract Map<String, List<rESOURCE>> getResources();
	public abstract void setResources(Map<String, List<rESOURCE>> res);
	public abstract Map<String, rESOURCErOLE> getResourceRoles();
	public abstract void setResourceRoles(Map<String, rESOURCErOLE> resRoles);
	public abstract List<rESOURCE> get(String resRoleName);
	public abstract void put(List<rESOURCE> rESOURCEs, String resRoleName);
	public abstract void delete(String resRoleName);
	public abstract String getSuccessorActivity();
	public abstract aCTIVITY newInstance();
}
