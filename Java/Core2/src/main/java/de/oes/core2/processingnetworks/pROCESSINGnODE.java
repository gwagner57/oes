package de.oes.core2.processingnetworks;

import java.util.List;
import java.util.Map;
import java.util.function.Predicate;
import java.util.function.Supplier;

import de.oes.core2.activities.rESOURCEsTATUS;
import de.oes.core2.foundations.eVENT;
import de.oes.core2.foundations.oBJECT;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;


/*
 * A simple processing node has an input buffer for incoming processing objects 
 * and a successor node. Processing objects may be either of a generic default
 * type "pROCESSINGoBJECT" or of a model-specific subtype of "pROCESSINGoBJECT"
 * (such as "Customer").
 *
 * A processing node is defined with a "duration" slot having either a fixed value 
 * or a (random variable) function expression, applying to its processing activities.
 * If no "duration" slot is defined, the exponential distribution with an event rate 
 * of 1 is used as a default function for sampling processing durations. 
 * 
 * By default, a processing node processes one processing object at a time, but it 
 * may also have its "capacity" attribute set to a value greater than 1.
 *
 * In the general case, a processing node may have several input object types,
 * and an input buffer for each of them, and either a successor processing node or
 * else an (automatically generated) output buffer for each type of output object.
 * By default, when no explicit transformation of inputs to outputs is modeled by
 * specifying an outputTypes map, there is no transformation and it holds that
 * outputs = inputs.
 */
@Getter
@Setter
public class pROCESSINGnODE extends oBJECT {

	private rESOURCEsTATUS status;
	private Number duration;
	private String processingActivityTypeName;
	private Supplier<List<eVENT>> onStartUp;
	private Object successorNode;
	private Object predecessorNode;
	private Map<String, Predicate<? super String>> successorNodes;
	private Integer inputBufferCapacity;
	private String inputTypeName;
	private List<pROCESSINGoBJECT> inputBuffer;
	private Map<String, Object> inputTypes;
	private Map<String, Object> outputTypes;
	private Integer processingCapacity;

	public pROCESSINGnODE(Integer id, String name, Simulator sim, rESOURCEsTATUS status, 
			Number duration, String processingActivityTypeName, Object successorNode,
			Map<String, Predicate<? super String>> successorNodes, Object predecessorNode,
			Integer inputBufferCapacity, String inputTypeName, Map<String, Object> inputTypes,
			Map<String, Object> outputTypes, Integer processingCapacity) {
		super(id, name, sim);
		if(status != null) this.status = status;
		else this.status = rESOURCEsTATUS.AVAILABLE;
		// fixed value or random variable
		if(duration != null) this.duration = duration;
		 // user-defined or "pROCESSINGaCTIVITY"
		if(processingActivityTypeName != null) this.processingActivityTypeName = processingActivityTypeName;
		else this.processingActivityTypeName = "pROCESSINGaCTIVITY";
		// a node has either a "successorNode" value or a "successorNodes" value
		if(successorNode != null) this.successorNode = successorNode;
		// a map with node names as keys and conditions as values for (X)OR/AND splitting
		if(successorNodes != null) this.successorNodes = successorNodes;
		if(predecessorNode != null) this.predecessorNode = predecessorNode;
		if(inputBufferCapacity != null) this.inputBufferCapacity = inputBufferCapacity;
		// user-defined or "pROCESSINGoBJECT"
		if(inputTypeName != null) this.inputTypeName = inputTypeName;
		// Ex: {"lemons": {type:"Lemon", quantity:2}, "ice": {type:"IceCubes", quantity:[0.2,"kg"]},...
		if(inputTypes != null) this.inputTypes = inputTypes;
		// Ex: {"lemonade": {type:"Lemonade", quantity:[1,"l"]}, ...
		if(outputTypes != null) this.outputTypes = outputTypes;
		if(processingCapacity != null) this.processingCapacity = processingCapacity;
	}

}
