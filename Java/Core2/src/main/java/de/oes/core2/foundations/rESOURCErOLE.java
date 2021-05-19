package de.oes.core2.foundations;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class rESOURCErOLE {
	private Integer card;
	private Integer minCard;
	private String name;
	private rANGE range;
	private String countPoolName;
	private rESOURCEpOOL resPool;
	private List<Class<? extends rESOURCE>> alternativeResourceTypes;
}
