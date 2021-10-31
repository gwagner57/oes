package de.oes.core2.sim;

import java.util.Map;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReplicationActivityStat {
		private Integer[] enqueuedActivities;
		private Integer[] startedActivities;
		private Integer[] completedActivities;
		private Integer[] waitingTimeouts;
		private Map<String, Number> resUtil;
		private GenericStat[] waitingTime;
		private GenericStat[] cycleTime;
		private GenericStat[] queueLength;
}
