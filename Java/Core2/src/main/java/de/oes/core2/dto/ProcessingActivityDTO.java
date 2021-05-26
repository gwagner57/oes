package de.oes.core2.dto;

import java.util.Map;

import de.oes.core2.activities.aCTIVITY;
import de.oes.core2.activities.rESOURCErOLE;
import de.oes.core2.processingnetworks.pROCESSINGnODE;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProcessingActivityDTO {
	private Integer id;
	private pROCESSINGnODE processingNode;
	private Number occTime;
	private Map<String, rESOURCErOLE> resourceRoles;
	private String activityType;
	private Number duration;
	private Number startTime;
	private aCTIVITY activity;
	private Integer activityIdRef;
	private Number delay;
	private Integer priority;
}
