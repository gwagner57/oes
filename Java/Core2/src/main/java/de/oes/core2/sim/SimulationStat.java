package de.oes.core2.sim;

import java.util.HashMap;
import java.util.Map;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SimulationStat {
	private Map <String, ActivityStat> actTypes = new HashMap<String, ActivityStat>();
	private Map <String, Number> simpleStat = new HashMap<String, Number>();
	private boolean includeTimeouts;
}
