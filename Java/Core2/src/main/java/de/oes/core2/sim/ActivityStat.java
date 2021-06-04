package de.oes.core2.sim;

import java.util.Map;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ActivityStat {
	
	private Integer enqueuedActivities;
	private Integer startedActivities;
	private Integer completedActivities;
	private Map<String, Number> resUtil;
	private Integer waitingTimeouts;
	private GenericStat waitingTime;
	private GenericStat cycleTime;
	private GenericStat queueLength;
}
