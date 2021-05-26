package de.oes.core2.activities;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class rANGE {
	private String name;
	private rESOURCEpOOL resourcePool;
	private List<Class<? extends rESOURCE>> alternativeResourceTypes;
}
