package de.oes.core2.dto;

import java.util.Map;

import de.oes.core2.sim.GenericStat;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder(setterPrefix = "with")
public class ActivityStatatisticsDTO {
	private Integer enqueuedActivities;
	private Integer startedActivities;
	private Integer completedActivities;
	private Map<String, Number> resUtil;
	private Integer waitingTimeouts;
	private GenericStat waitingTime;
	private GenericStat cycleTime;
	private GenericStat queueLength;
}
