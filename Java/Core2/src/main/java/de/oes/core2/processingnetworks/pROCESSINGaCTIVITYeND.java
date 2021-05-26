package de.oes.core2.processingnetworks;

import java.util.Map;

import de.oes.core2.activities.aCTIVITY;
import de.oes.core2.activities.aCTIVITYeND;
import de.oes.core2.activities.rESOURCErOLE;
import de.oes.core2.dto.ProcessingActivityDTO;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class pROCESSINGaCTIVITYeND extends aCTIVITYeND{

	private Integer id;
	private pROCESSINGnODE processingNode;
	private Map<String, rESOURCErOLE> resourceRoles;
	private String activityType;
	private Integer activityIdRef;
	
	public pROCESSINGaCTIVITYeND(Simulator sim, Number occTime, Number delay, Number startTime, Number duration,
			aCTIVITY activity) {
		super(sim, occTime, delay, startTime, duration, activity);
	}
	
	public pROCESSINGaCTIVITYeND(Simulator sim, ProcessingActivityDTO slots) {
		super(sim, slots.getOccTime(), slots.getDelay(), slots.getStartTime(), slots.getDuration(), slots.getActivity());
	}
	
	public rESOURCErOLE get(String resName) {
		return this.getResourceRoles().get(resName);
	}
	
	public void put(String resName, rESOURCErOLE resObj) {
		this.getResourceRoles().put(resName, resObj);
	}

}
