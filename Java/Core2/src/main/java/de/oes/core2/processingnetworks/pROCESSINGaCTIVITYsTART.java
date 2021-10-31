package de.oes.core2.processingnetworks;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import de.oes.core2.activities.aCTIVITY;
import de.oes.core2.activities.aCTIVITYsTART;
import de.oes.core2.activities.rESOURCErOLE;
import de.oes.core2.activities.rESOURCEsTATUS;
import de.oes.core2.dto.ProcessingActivityDTO;
import de.oes.core2.foundations.eVENT;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class pROCESSINGaCTIVITYsTART extends aCTIVITYsTART {

	private pROCESSINGnODE processingNode;
	private String activityType;
	private Number duration;
	private Map<String, rESOURCErOLE> resourceRoles;
	
	public pROCESSINGaCTIVITYsTART(Simulator sim, Number occTime, Number delay, aCTIVITY plannedActivity, pROCESSINGnODE processingNode, Map<String, rESOURCErOLE> roles) {
		super(sim, occTime, delay, plannedActivity);
		this.processingNode = processingNode;
		this.resourceRoles = roles;
	}
	
	public void onConstructionBeforeAssigningProperties(){
		 // assign fixed (implied) activity type
		 this.activityType = "pROCESSINGaCTIVITY";
	}

	public void onConstructionAfterAssigningProperties() {
		if(resourceRoles == null) this.resourceRoles = new HashMap<String, rESOURCErOLE>();
		// make sure that processing node is a resource
		//TODO
//		this.resourceRoles.put("processingNode", this.processingNode);
	}
	
	@Override
	public List<eVENT> onEvent() {
		Simulator sim = this.getSim();
		pROCESSINGnODE pN = this.processingNode;
		ProcessingActivityDTO slots = new ProcessingActivityDTO();
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		if(pN.getInputBuffer().get(0) == null) {
			System.err.println("ProcessingActivityStart with empty inputBuffer at "+ pN.getName() +
			          " at step "+ sim.getStep());
		}
		
		// create slots for constructing new processing activity
		if(this.getDuration() != null) slots.setDuration(this.duration);
		else if(pN.getDuration() != null) {
			slots.setDuration(pN.getDuration());
		} else slots.setDuration(pROCESSINGaCTIVITY.defaultDuration);
		pN.setStatus(rESOURCEsTATUS.BUSY);
		
		for (String resRole : this.resourceRoles.keySet()) {
			rESOURCErOLE resObj = this.resourceRoles.get(resRole);
			if(!slots.getResourceRoles().containsKey(resRole)) slots.getResourceRoles().put(resRole, resObj);
			if(resObj.getActivityState() == null) resObj.setActivityState(new HashMap<String, Boolean>());
			resObj.getActivityState().put(this.activityType, true);
		}
		
		slots.setId(this.getSim().getIdCounter() + 1);
		slots.setStartTime(this.getOccTime());
		pROCESSINGaCTIVITYeND acty = new pROCESSINGaCTIVITYeND(sim, slots);
		acty.setResourceRoles(this.resourceRoles); // assign resourceRoles map
		sim.getOngoingActivities().put(acty.getId(), acty);
		// create slots for constructing a ProcessingActivityEnd event
		slots.setOccTime(this.getOccTime().doubleValue() + acty.getDuration().doubleValue());
		slots.setActivityIdRef(acty.getId());
		slots.setProcessingNode(pN);
		if(pN.getOnStartUp() != null) {
			followupEvents = pN.getOnStartUp().get();
		}
		
		followupEvents.add(new pROCESSINGaCTIVITYeND(sim, slots));
		return followupEvents;
	}
	
}
