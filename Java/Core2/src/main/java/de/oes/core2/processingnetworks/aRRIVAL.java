package de.oes.core2.processingnetworks;

import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.function.Consumer;

import de.oes.core2.activities.rESOURCErOLE;
import de.oes.core2.activities.rESOURCEsTATUS;
import de.oes.core2.foundations.eVENT;
import de.oes.core2.lib.Rand;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class aRRIVAL extends eVENT{

	private static final double defaultEventRate = 1;
	private static final double defaultRecurrence = Rand.exponential(defaultEventRate).doubleValue();
	private EntryNode entryNode;
	private Integer quantity;
	
	public aRRIVAL(Simulator sim, Number occTime, Number delay, Number startTime, Number duration, EntryNode entryNode) {
		super(sim, occTime, delay, startTime, duration);
		this.entryNode = entryNode;
	}

	
	
	@Override
	public List<eVENT> onEvent() {
		Simulator sim = this.getSim();
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		Double occT;
		Class<? extends pROCESSINGoBJECT> ProcessingObject = null;
		if(this.entryNode.getOutputType() != null) {
			ProcessingObject = this.entryNode.getOutputType();
		} else { // default
			ProcessingObject = pROCESSINGoBJECT.class;
		}
		// update statistics
		this.entryNode.setNmrOfArrivedObjects(this.entryNode.getNmrOfArrivedObjects() + 1);
		   // create newly arrived processing object
		pROCESSINGoBJECT procObj = null;
		try {
			procObj = (pROCESSINGoBJECT) Class.forName(ProcessingObject.getName()).getConstructor(String.class).newInstance(null, sim, this.getOccTime());
		} catch (InstantiationException | IllegalAccessException | IllegalArgumentException | InvocationTargetException
				| NoSuchMethodException | SecurityException | ClassNotFoundException e) {
			e.printStackTrace();
		}
		
		sim.getObjects().put(procObj.getId(), procObj);
		// invoke onArrival event rule method
		if(this.entryNode.getOnArrival() != null) followupEvents = this.entryNode.getOnArrival().get();
		if(this.entryNode.getSuccessorNode() != null) {
			// push newly arrived object to the inputBuffer of the next node
			this.entryNode.getSuccessorNode().getInputBuffer().add(procObj);
			// is the follow-up processing node available?
			if(this.entryNode.getSuccessorNode().getStatus().equals(rESOURCEsTATUS.AVAILABLE)) {
				this.entryNode.getSuccessorNode().setStatus(rESOURCEsTATUS.BUSY);
				followupEvents.add(new pROCESSINGaCTIVITYsTART(sim, 
						this.getOccTime().doubleValue() + sim.getNextMomentDeltaT(), 
						null, null, 
						this.entryNode.getSuccessorNode(),
						this.entryNode.getResourceRoles() != null? this.entryNode.getResourceRoles() : new HashMap<String, rESOURCErOLE>()));
			}
		}
		// implement the recurrence of aRRIVAL events
		if(this.entryNode.getMaxNmrOfArrivals() == null ||
		   this.entryNode.getNmrOfArrivedObjects() < this.entryNode.getMaxNmrOfArrivals()) {
		   // has an arrival recurrence function been defined for the entry node?
		   if(this.entryNode.getArrivalRecurrence() != null) {
			   occT = this.getOccTime().doubleValue() + this.entryNode.getArrivalRecurrence();
		   } else { // use the default recurrence
			   occT = this.getOccTime().doubleValue() + aRRIVAL.defaultRecurrence;
		   }
		   sim.scheduleEvent(new aRRIVAL(sim, occT, null, null, null, this.entryNode));
		}
		return followupEvents;
	}



	@Override
	public String getSuccessorActivity() {
		// TODO Auto-generated method stub
		return null;
	}
}
