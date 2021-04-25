package de.oes.core1.sim;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class eXPERIMENTtYPE {
	private Model model;
	private String title;
	private Integer nmrOfReplications;
	private List<Scenario> scenarios;
	private boolean storeExpResults;
	private Integer[] seeds;
	private Map<String, Number[]> replicStat = new HashMap<String, Number[]>();
	private List<eXPERIMENTpARAMdEF> parameterDefs;
	
	public eXPERIMENTtYPE(Model model,String title, Integer nmrOfReplications, List<eXPERIMENTpARAMdEF> parameterDefs, Integer[] seeds) {
		super();
		this.title = title;
		this.parameterDefs = parameterDefs;
		this.nmrOfReplications = nmrOfReplications;
		if(seeds == null) seeds = new Integer[] {};
		this.seeds = Arrays.copyOf(seeds, nmrOfReplications);
		this.scenarios = new ArrayList<Scenario>();
	}
}
