package de.oes.core2.processingnetworks;

import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

import de.oes.core2.activities.rESOURCErOLE;
import de.oes.core2.foundations.eVENT;
import de.oes.core2.foundations.oBJECT;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;


/**
 * Entry nodes are objects that participate in exogenous arrival events
 * leading to the creation of processing objects, which are either routed to a
 * successor node or pushed to an output queue. The definition of an entry
 * node combines defining both a (possibly spatial) object and an associated
 * implicit arrival event type, possibly with an "onArrival" event rule method.
 *
 * Entry node object definitions may include (1) a "successorNode" attribute slot
 * for assigning a successor node to which processing objects are routed; (2) a
 * "maxNmrOfArrivals" attribute slot for defining a maximum number of arrival
 * events after which no more arrival events will be created (and, consequently,
 * the simulation may run out of future events); (3) either an "arrivalRate"
 * attribute slot for defining the event rate parameter of an exponential pdf
 * used for computing the time between two consecutive arrival events, or a per-
 * instance-defined "arrivalRecurrence" method slot for computing the recurrence
 * of arrival events; (4) a per-instance-defined "outputType" slot for defining
 * a custom output type (instead of the default "pROCESSINGoBJECT"). If neither an
 * "arrivalRate" nor an "arrivalRecurrence" method are defined, the exponential
 * distribution with an event rate of 1 is used as a default recurrence.
 *
 * Entry nodes have a built-in (read-only) statistics attribute "nmrOfArrivedObjects"
 * counting the number of objects that have arrived at the given entry node.
 *
 * TODO: If no successor node is defined for an entry node, an output queue is
 * automatically created.
 */
@Getter
@Setter
public class EntryNode extends oBJECT{
	
	private Class<? extends pROCESSINGoBJECT> outputType;
	private Map<String, rESOURCErOLE> resourceRoles;
	private pROCESSINGnODE successorNode;
	private Integer maxNmrOfArrivals;
	private Double arrivalRate;
	private Supplier<? extends List<eVENT>> onArrival;
	private Integer nmrOfArrivedObjects;
	private Double arrivalRecurrence;
	
	public EntryNode(Integer id, String name, Simulator sim) {
		super(id, name, sim);
	}
}
