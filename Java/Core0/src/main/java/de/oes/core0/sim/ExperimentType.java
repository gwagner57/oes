package de.oes.core0.sim;

import java.util.HashMap;
import java.util.Map;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExperimentType {
	private String title;
	private Integer nmrOfReplications;
	private Integer experimentNo;
	private Map<String, Number[]> replicStat = new HashMap<String, Number[]>();
	private Map<String, Map <String,Number>> summaryStat = new HashMap<String, Map <String,Number>>();
	
	public ExperimentType(Integer experimentNo, String title, Integer nmrOfReplications) {
		super();
		this.experimentNo = experimentNo;
		this.title = title;
		this.nmrOfReplications = nmrOfReplications;
	}
}
