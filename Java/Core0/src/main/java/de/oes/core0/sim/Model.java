package de.oes.core0.sim;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Consumer;
import java.util.function.Supplier;

import de.oes.core0.foundations.eVENT;
import de.oes.core0.foundations.oBJECT;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Model {
	private Time time;
	private TimeUnit timeUnit;
	private List<Class<? extends oBJECT>> objectTypes;
	private List<Class<? extends eVENT>> eventTypes;
	private Map<String, Number> v = new HashMap<String, Number>();
	private Map<Object, Supplier<Integer>> f = new HashMap<Object, Supplier<Integer>>();
	private Scenario scenario;
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
