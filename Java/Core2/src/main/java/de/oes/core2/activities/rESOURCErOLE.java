package de.oes.core2.activities;

import java.util.Map;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class rESOURCErOLE {
	private Integer card;
	private Integer minCard;
	private Integer maxCard;
	private String name;
	private rANGE range;
	private String countPoolName;
	private rESOURCEpOOL resPool;
	private rESOURCEpOOL alternativeResourceTypes;
	private Map<String, Boolean> activityState;
}
