package de.oes.core1.sim;

import java.util.List;
import java.util.Set;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class eXPERIMENTpARAMdEF {

	private String name;
	private Set<Number> values;
	private Integer startValue;
	private Integer endValue;
	private int stepSize = 1;
	
	public eXPERIMENTpARAMdEF(String name, Set <Number> values, Integer startValue, Integer endValue, Integer stepSize) {
		super();
		this.name = name;
		if(values != null) this.values = values;
		if(startValue != null) this.startValue = startValue;
		if(endValue != null) this.endValue = endValue;
		if(stepSize != null) this.stepSize = stepSize;
	}
	
}
