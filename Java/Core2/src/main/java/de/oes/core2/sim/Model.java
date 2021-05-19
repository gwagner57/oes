package de.oes.core2.sim;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;
import java.util.function.Supplier;

import de.oes.core2.foundations.eVENT;
import de.oes.core2.foundations.oBJECT;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Model {
	private Time time;
	private String name;
	private TimeUnit timeUnit;
	private Double nextMomentDeltaT;
	private Double timeIncrement;
	private boolean onEachTimeStep; 
	private Set<String> activityTypes;
	private List<Class<? extends oBJECT>> objectTypes;
	private List<Class<? extends eVENT>> eventTypes;
	private Map<String, Number> v = new HashMap<String, Number>();
	private Map<String, Object> p = new HashMap<String, Object>();
	private Map<Object, Supplier<Integer>> f = new HashMap<Object, Supplier<Integer>>();
	private Consumer<Simulator> setupStatistics;
	private Consumer<Simulator> computeFinalStatisctics;
	
	public void incrementStat(String name, Number inc) {
		Number num = this.v.get(name);
		this.v.replace(name, num, num.intValue() + inc.intValue());
	}
	
	public void updateStatValue(String name, Number newNumber) {
		Number num = this.v.get(name);
		this.v.replace(name, num, newNumber);
	}
}
