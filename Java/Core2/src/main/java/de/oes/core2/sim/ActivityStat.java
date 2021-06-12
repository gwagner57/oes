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
	
	@Override
	public String toString() {
		return "ActivityStat :[\n" +
				"enqueuedActivities " + this.enqueuedActivities + "\n" +
				"startedActivities " + this.startedActivities + "\n" +
				"completedActivities " + this.completedActivities + "\n" +
				"waitingTimeouts " + this.waitingTimeouts + "\n" +
				"waitingTime " + this.waitingTime.getMax() + "\n" +
				"cycleTime " + this.cycleTime.getMax() + "\n" +
				"queueLength " + this.queueLength.getMax() + "\n" +
				"resUtil " + this.resUtil; // TODO: devide by sim.time
	}
	
	
}
