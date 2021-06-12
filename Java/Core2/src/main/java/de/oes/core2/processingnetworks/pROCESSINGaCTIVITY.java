package de.oes.core2.processingnetworks;


import de.oes.core2.activities.aCTIVITY;
import de.oes.core2.lib.Rand;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;


/**
 * Processing Activities are activities that have inputs and outputs and are
 * performed at a processing node (being a resource). Their properties
 * (in particular, their resource roles and duration) are defined within
 * the definition of their processing node.
 */
@Getter
@Setter
public abstract class pROCESSINGaCTIVITY extends aCTIVITY {

	private Object processingNode;
	
	public pROCESSINGaCTIVITY(Simulator sim, Number id, Number occTime, Number startTime, Number duration,
			Number enqueueTime, Object processingNode) {
		super(sim, id, occTime, startTime, duration, enqueueTime);
		this.processingNode = processingNode;
	}

	// define the exponential PDF as the default duration random variable
	public static Double defaultMean = 1.0;
	public static Double defaultDuration = Rand.exponential(1.0 / pROCESSINGaCTIVITY.defaultMean).doubleValue();

}
