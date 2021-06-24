package de.oes.core2.sim;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Scenario {
	private Integer idCounter = 0;
	private Long durationInSimTime;
	private Long durationInSimSteps;
	private Long durationInCpuTime;
	private Model model;
	private String description;
	private Simulator simulator;
	private Long scenarioNo;
	private Integer randomSeed;
	private List<Object> parameterValues;
	private Map<String,Number> stat = new HashMap<String,Number>();
	private Consumer<Simulator> setupInitialState;
	private String title;
	
	public Integer incrementIdCounter() {
		this.idCounter++;
		return idCounter;
	}
}
