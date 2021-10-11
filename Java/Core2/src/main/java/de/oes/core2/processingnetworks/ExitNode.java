package de.oes.core2.processingnetworks;

import java.util.List;
import java.util.function.Supplier;

import de.oes.core2.foundations.eVENT;
import de.oes.core2.foundations.oBJECT;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;


/**
 * Exit nodes are objects that participate in departure events leading to the
 * destruction of the departing object. The definition of an exit node combines
 * defining both a (possibly spatial) object and an associated implicit departure
 * event type, possibly with an "onDeparture" event rule method.
 *
 * Exit nodes have two built-in statistics attributes: (1) "nmrOfDepartedObjects"
 * counting the number of objects that have departed at the given exit node, and
 * (2) "cumulativeTimeInSystem" for adding up the times in system of all departed
 * objects.
 */
@Getter
@Setter
public class ExitNode extends oBJECT{

	private List<pROCESSINGoBJECT> inputBuffer;
	private Integer nmrOfDepartedObjects;
	private Double cumulativeTimeInSystem;
	private Supplier<List<eVENT>> onDeparture;
	
	
	public ExitNode(Integer id, String name, Simulator sim) {
		super(id, name, sim);
	}
	
	
}
