package de.oes.core2.activities;

import java.util.ArrayList;
import java.util.List;

import de.oes.core2.foundations.eVENT;
import de.oes.core2.sim.Simulator;

public class aCTIVITYsTART extends eVENT {

	private aCTIVITY plannedActivity;
	
	public aCTIVITYsTART(Simulator sim, Number occTime, Number delay, aCTIVITY plannedActivity) {
		super(sim, occTime, delay, null, null);
		this.plannedActivity = plannedActivity;
	}

	@Override
	public String toString() {
		//TODO
		return "activityStart@" + this.getOccTime();
	}
	
	@Override
	public List<eVENT> onEvent() {
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		aCTIVITY acty = this.plannedActivity; 
		Class<? extends aCTIVITY> AT = acty.getClass();
		 // create slots for constructing new activity
		acty.setStartTime(this.getOccTime());
		
	//	TODO
//		if (acty.duration) {
//		      if (typeof acty.duration === "function") acty.duration = acty.duration();
//		      else acty.duration = acty.duration;
//		    } else if (AT.duration) {
//		      if (typeof AT.duration === "function") acty.duration = AT.duration();
//		      else acty.duration = AT.duration;
//		    }
//		
	    // update statistics
		Integer startedActivities = this.getSim().getStat().getActTypes().get(AT.getName()).getStartedActivities();
		startedActivities = Integer.valueOf(startedActivities.intValue() + 1);
		// Set activity state for all involved resource objects
		for (String resRoleName : acty.getResourceRoles().keySet()) { //TODO AT
			if(acty.getResourceRoles().get(resRoleName).getRange() != null) {  // an individual pool
				List<rESOURCE> resObjects = acty.get(resRoleName);
				for (rESOURCE resObj : resObjects) {
					if(resObj.getActivityState() == null) resObj.setActivityState(new aCTIVITYsTATE());
					resObj.getActivityState().add(AT.getName());
				}
			}
		}
		// if there is an onActivityStart procedure, execute it
		if(acty.onActivityStart != null) {
			followupEvents.addAll(acty.onActivityStart);
		}
		// Schedule an activity end event if the duration is known
		if(acty.getDuration() != null) {
			followupEvents.add(new aCTIVITYeND(this.getSim(), this.getOccTime().doubleValue() + acty.getDuration().doubleValue(), null, null, null, acty));
		}
		return followupEvents;
	}

}
