package de.oes.core2.sim;

import java.util.Map;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SimulationStat {
	private Map <String, ActivityStat> actTypes;
}
