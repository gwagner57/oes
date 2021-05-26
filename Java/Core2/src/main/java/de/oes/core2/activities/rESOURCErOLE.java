package de.oes.core2.activities;

import java.util.List;
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
	private List<Class<? extends rESOURCE>> alternativeResourceTypes;
	private Map<String, Boolean> activityState;
}
