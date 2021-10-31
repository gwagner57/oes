package de.oes.core2.sim;

import java.util.Set;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class eXPERIMENTpARAMdEF {

	private String name;
	private Set<Object> values;
	private Integer startValue;
	private Integer endValue;
	private int stepSize = 1;
	
	public eXPERIMENTpARAMdEF(String name, Set <Object> values, Integer startValue, Integer endValue, Integer stepSize) {
		super();
		this.name = name;
		if(values != null) this.values = values;
		if(startValue != null) this.startValue = startValue;
		if(endValue != null) this.endValue = endValue;
		if(stepSize != null) this.stepSize = stepSize;
	}
	
}
